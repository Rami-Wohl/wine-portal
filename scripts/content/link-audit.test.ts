import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import YAML from "yaml";
import type { EntityLinkFinding } from "./dependencies";
import {
  LINK_AUDIT_REGISTRY,
  loadLinkAuditRegistry,
  syncLinkAuditRegistry,
  triageLinkFindings,
  type LinkAuditRegistry,
} from "./link-audit";

const findings: EntityLinkFinding[] = [
  {
    id: "region.example:nl->grape.merlot",
    ownerId: "region.example",
    locale: "nl",
    matchedText: "Merlot",
    targetId: "grape.merlot",
  },
  {
    id: "region.example:en->concept.tannin",
    ownerId: "region.example",
    locale: "en",
    matchedText: "Tannin",
    targetId: "concept.tannin",
  },
];

describe("link audit triage", () => {
  it("separates new, pending, reviewed and inactive candidates", () => {
    const registry: LinkAuditRegistry = {
      version: 1,
      known_candidates: [findings[0].id, "region.old:nl->grape.merlot"],
      decisions: [
        {
          id: findings[0].id,
          status: "skip",
          reviewed_at: "2026-09-22",
          reason: "The preceding linked mention already provides enough navigation.",
        },
        {
          id: "region.old:nl->grape.merlot",
          status: "link",
          reviewed_at: "2026-09-21",
        },
      ],
    };

    const result = triageLinkFindings(findings, registry);

    expect(result.counts).toEqual({
      new: 1,
      pending: 0,
      link: 0,
      skip: 1,
      "false-positive": 0,
    });
    expect(result.inactive).toBe(1);
  });

  it("syncs only new candidates and preserves reviewed decisions", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "oenocademy-link-audit-"));
    const filePath = path.join(root, LINK_AUDIT_REGISTRY);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(
      filePath,
      YAML.stringify({
        version: 1,
        known_candidates: [findings[0].id],
        decisions: [
          {
            id: findings[0].id,
            status: "false-positive",
            reviewed_at: "2026-09-21",
            reason: "This occurrence is part of a source title.",
          },
        ],
      }),
    );

    const result = await syncLinkAuditRegistry(findings, root);
    const registry = await loadLinkAuditRegistry(root);

    expect(result.added).toBe(1);
    expect(registry.known_candidates).toHaveLength(2);
    expect(registry.decisions.find(({ id }) => id === findings[0].id)).toMatchObject({
      status: "false-positive",
      reviewed_at: "2026-09-21",
      reason: "This occurrence is part of a source title.",
    });
    expect(await readFile(filePath, "utf8")).toContain("Baseline en handmatige beslissingen");
  });

  it("rejects skip decisions without a reason", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "oenocademy-link-audit-invalid-"));
    const filePath = path.join(root, LINK_AUDIT_REGISTRY);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(
      filePath,
      YAML.stringify({
        version: 1,
        known_candidates: [findings[0].id],
        decisions: [
          {
            id: findings[0].id,
            status: "skip",
            reviewed_at: "2026-09-22",
          },
        ],
      }),
    );

    await expect(loadLinkAuditRegistry(root)).rejects.toThrow(/reason is required/u);
  });

  it("rejects malformed candidate IDs", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "oenocademy-link-audit-invalid-id-"));
    const filePath = path.join(root, LINK_AUDIT_REGISTRY);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(
      filePath,
      YAML.stringify({
        version: 1,
        known_candidates: ["region.example->grape.merlot"],
        decisions: [],
      }),
    );

    await expect(loadLinkAuditRegistry(root)).rejects.toThrow(
      /must use <document-id>:<locale>-><target-id>/u,
    );
  });
});
