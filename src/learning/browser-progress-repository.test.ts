import { describe, expect, it } from "vitest";
import { createBrowserLearningProgressRepository } from "./browser-progress-repository";
import { createLearningProgressRecord } from "./progress";

class MemoryStorage {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const pathId = "learning-path.example";
const stepIds = ["first", "second"];
const record = createLearningProgressRecord(pathId, ["first"], "2026-09-23T12:00:00.000Z");

describe("browser learning progress repository", () => {
  it("round-trips the API-shaped record through browser storage", async () => {
    const storage = new MemoryStorage();
    const repository = createBrowserLearningProgressRepository({ getStorage: () => storage });

    expect(await repository.save(record)).toBe("persistent");
    expect(await repository.load(pathId, stepIds)).toEqual({
      record,
      persistence: "persistent",
    });

    expect(await repository.clear(pathId)).toBe("persistent");
    expect(await repository.load(pathId, stepIds)).toEqual({
      record: null,
      persistence: "persistent",
    });
  });

  it("treats corrupt stored data as empty progress", async () => {
    const storage = new MemoryStorage();
    storage.values.set(`oenocademy:learning-progress:v1:${encodeURIComponent(pathId)}`, "not-json");
    const repository = createBrowserLearningProgressRepository({ getStorage: () => storage });

    expect(await repository.load(pathId, stepIds)).toEqual({
      record: null,
      persistence: "persistent",
    });
  });

  it("falls back to session memory when storage is unavailable", async () => {
    const repository = createBrowserLearningProgressRepository({
      getStorage: () => {
        throw new Error("blocked");
      },
    });

    expect(await repository.save(record)).toBe("temporary");
    expect(await repository.load(pathId, stepIds)).toEqual({
      record,
      persistence: "temporary",
    });
  });
});
