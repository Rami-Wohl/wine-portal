import { describe, expect, it } from "vitest";
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
