import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";
import type { EntityLinkFinding } from "./dependencies";

export const LINK_AUDIT_DECISIONS = ["link", "skip", "false-positive"] as const;
export const LINK_AUDIT_STATUSES = ["pending", ...LINK_AUDIT_DECISIONS] as const;
export type LinkAuditStatus = (typeof LINK_AUDIT_STATUSES)[number];

const candidateIdSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9.-]*:(?:nl|en)->[a-z][a-z0-9.-]*$/u,
    "must use <document-id>:<locale>-><target-id>",
  );

const registryDecisionSchema = z
  .object({
    id: candidateIdSchema,
    status: z.enum(LINK_AUDIT_DECISIONS),
    reviewed_at: z.iso.date(),
    reason: z.string().trim().min(1).optional(),
  })
  .superRefine((entry, context) => {
    if ((entry.status === "skip" || entry.status === "false-positive") && !entry.reason) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: `is required when status is '${entry.status}'`,
      });
    }
  });

const registrySchema = z
  .object({
    version: z.literal(1),
    known_candidates: z.array(candidateIdSchema),
    decisions: z.array(registryDecisionSchema),
  })
  .superRefine((registry, context) => {
    const seen = new Set<string>();
    registry.known_candidates.forEach((id, index) => {
      if (seen.has(id)) {
        context.addIssue({
          code: "custom",
          path: ["known_candidates", index],
          message: `duplicates '${id}'`,
        });
      }
      seen.add(id);
    });
    const decided = new Set<string>();
    registry.decisions.forEach((decision, index) => {
      if (!seen.has(decision.id)) {
        context.addIssue({
          code: "custom",
          path: ["decisions", index, "id"],
          message: `must also occur in known_candidates`,
        });
      }
      if (decided.has(decision.id)) {
        context.addIssue({
          code: "custom",
          path: ["decisions", index, "id"],
          message: `duplicates '${decision.id}'`,
        });
      }
      decided.add(decision.id);
    });
  });

export type LinkAuditRegistryDecision = z.infer<typeof registryDecisionSchema>;
export type LinkAuditRegistry = z.infer<typeof registrySchema>;

export type TriagedLinkFinding = {
  finding: EntityLinkFinding;
  status: LinkAuditStatus | "new";
};

export type LinkAuditTriage = {
  current: TriagedLinkFinding[];
  counts: Record<LinkAuditStatus | "new", number>;
  inactive: number;
};

export const LINK_AUDIT_REGISTRY = path.join("editorial", "link-audit-decisions.yaml");

function registryError(filePath: string, error: z.ZodError): Error {
  const details = error.issues
    .map((issue) => `${issue.path.join(".") || "record"} ${issue.message}`)
    .join("; ");
  return new Error(`${filePath}: ${details}`);
}

export async function loadLinkAuditRegistry(root = process.cwd()): Promise<LinkAuditRegistry> {
  const filePath = path.join(root, LINK_AUDIT_REGISTRY);
  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return { version: 1, known_candidates: [], decisions: [] };
    }
    throw error;
  }

  const result = registrySchema.safeParse(YAML.parse(source));
  if (!result.success) throw registryError(path.relative(root, filePath), result.error);
  return result.data;
}

export function triageLinkFindings(
  findings: EntityLinkFinding[],
  registry: LinkAuditRegistry,
): LinkAuditTriage {
  const known = new Set(registry.known_candidates);
  const decisions = new Map(registry.decisions.map((decision) => [decision.id, decision]));
  const current: TriagedLinkFinding[] = findings.map((finding) => ({
    finding,
    status: decisions.get(finding.id)?.status ?? (known.has(finding.id) ? "pending" : "new"),
  }));
  const currentIds = new Set(findings.map(({ id }) => id));

  return {
    current,
    counts: {
      new: current.filter(({ status }) => status === "new").length,
      pending: current.filter(({ status }) => status === "pending").length,
      link: current.filter(({ status }) => status === "link").length,
      skip: current.filter(({ status }) => status === "skip").length,
      "false-positive": current.filter(({ status }) => status === "false-positive").length,
    },
    inactive: registry.known_candidates.filter((id) => !currentIds.has(id)).length,
  };
}

export async function syncLinkAuditRegistry(
  findings: EntityLinkFinding[],
  root = process.cwd(),
): Promise<{ added: number; registry: LinkAuditRegistry; filePath: string }> {
  const registry = await loadLinkAuditRegistry(root);
  const known = new Set(registry.known_candidates);
  const addedIds = findings.map(({ id }) => id).filter((id) => !known.has(id));
  const nextRegistry = registrySchema.parse({
    version: 1,
    known_candidates: [...registry.known_candidates, ...addedIds].sort(),
    decisions: registry.decisions,
  });
  const filePath = path.join(root, LINK_AUDIT_REGISTRY);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    `# Baseline en handmatige beslissingen voor npm run content:link-audit.\n# --sync voegt alleen nieuwe IDs aan known_candidates toe. Voeg een besluit handmatig toe onder decisions.\n${YAML.stringify(nextRegistry, { lineWidth: 120 })}`,
    "utf8",
  );

  return { added: addedIds.length, registry: nextRegistry, filePath };
}
