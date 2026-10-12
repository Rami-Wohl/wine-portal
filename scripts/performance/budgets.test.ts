// Hier testen we de beoordeling, niet de snelheid van de computer.
// We nemen geldige meetgegevens en halen er bewust iets uit of maken een waarde fout.
// expect(...).toThrow betekent: deze invoer moet worden afgewezen met een foutmelding.
// Zo bewaken we dat een ontbrekende meting nooit als 'snel genoeg' wordt beloond.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { evaluateBudgets } from "./budgets";

describe("saved performance report checks", () => {
  it("rejects interrupted runs rather than treating missing scales as passing", () => {
    expect(() =>
      evaluateBudgets({
        method: { production: true, scales: [1, 3, 8] },
        scales: [],
        inventory: { media: { bytes: 0 }, gitObjectBytes: 0 },
      }),
    ).toThrow(/requested scale/);
  });

  it("rejects a saved production run that never completed its build or HTTP measurements", () => {
    const interrupted = JSON.parse(
      '{"method":{"production":true},"scales":[{"scale":8}],"inventory":{"media":{"bytes":0},"gitObjectBytes":0}}',
    );
    expect(() => evaluateBudgets(interrupted)).toThrow(/Incomplete production measurements at 8x/);
  });
});

// Lees een bestaand volledig rapport. Elke test krijgt een nieuw object, zodat
// opzettelijke fouten uit de ene test geen invloed hebben op een andere.
function report() {
  return JSON.parse(readFileSync("editorial/measurements/performance-2026-10-11.json", "utf8"));
}

// Bewijs beide kanten: kapotte invoer wordt geweigerd, maar een volledige
// historische meting en echte budgetoverschrijdingen blijven correct beoordeeld.
describe("complete and valid measurements", () => {
  it("still accepts the existing complete report", () => {
    expect(evaluateBudgets(report()).every(({ passed }) => passed)).toBe(true);
  });
  it("rejects an empty report even without a declared workload", () => {
    const data = report();
    delete data.method;
    data.scales = [];
    expect(() => evaluateBudgets(data)).toThrow(/no scales/);
  });
  it("rejects an empty trace list", () => {
    const data = report();
    data.scales[0].artifacts.largestTracedClosures = [];
    expect(() => evaluateBudgets(data)).toThrow(/trace measurements/);
  });
  it("rejects missing bundle tracing", () => {
    const data = report();
    data.scales[0].artifacts.generatedBundleTraced = false;
    expect(() => evaluateBudgets(data)).toThrow(/trace measurements/);
  });
  it("rejects missing search cases even when the array is not empty", () => {
    const data = report();
    data.scales[0].search.results.pop();
    expect(() => evaluateBudgets(data)).toThrow(/search cases/);
  });
  it("rejects missing samples and duplicate cases", () => {
    const data = report();
    data.scales[0].search.results[0].samplesMs.pop();
    expect(() => evaluateBudgets(data)).toThrow(/samples/);
    const duplicate = report();
    duplicate.scales[0].search.results[0] = duplicate.scales[0].search.results[1];
    expect(() => evaluateBudgets(duplicate)).toThrow(/search cases/);
  });
  it("rejects a missing locale and missing HTTP case", () => {
    const data = report();
    data.scales[0].search.cold[1].locale = "nl";
    expect(() => evaluateBudgets(data)).toThrow(/cold search/);
    const http = report();
    http.scales[0].server.searches.pop();
    expect(() => evaluateBudgets(http)).toThrow(/search cases/);
  });
  // it.each voert dezelfde test voor elke waarde in deze lijst uit.
  it.each([NaN, Infinity, -Infinity, -1])("rejects invalid numeric measurements: %s", (value) => {
    const data = report();
    data.scales[0].content.ms = value;
    expect(() => evaluateBudgets(data)).toThrow(/Invalid measurement/);
  });
  it("rejects duplicate or unexpected scales", () => {
    const data = report();
    delete data.method;
    data.scales.push(data.scales[0]);
    expect(() => evaluateBudgets(data)).toThrow(/Invalid benchmark scales/);
    const extra = report();
    extra.method.scales = [1, 3];
    expect(() => evaluateBudgets(extra)).toThrow(/scales differ/);
  });
  it("rejects partial production data even without a production declaration", () => {
    const data = report();
    delete data.method;
    delete data.scales[0].server;
    expect(() => evaluateBudgets(data)).toThrow(/Incomplete production/);
  });
  it("rejects missing article resources or image samples", () => {
    const data = report();
    data.scales[0].server.article.resources = [];
    expect(() => evaluateBudgets(data)).toThrow(/article\/image/);
    const images = report();
    images.scales[0].server.images.pop();
    expect(() => evaluateBudgets(images)).toThrow(/article\/image/);
  });
  it("rejects invalid heap snapshots before clamping the difference", () => {
    const data = report();
    data.scales[0].search.afterPreparation.heapUsed = -1;
    expect(() => evaluateBudgets(data)).toThrow(/Invalid heap/);
  });
  it("continues to report real budget breaches", () => {
    const data = report();
    data.scales[0].content.ms = 15001;
    expect(
      evaluateBudgets(data).find(
        ({ scenario, metric }) => scenario === "1x" && metric === "content build",
      )?.passed,
    ).toBe(false);
  });
});
