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

  it("keeps a failed write in memory when older storage remains readable", async () => {
    const storage = new MemoryStorage();
    const repository = createBrowserLearningProgressRepository({ getStorage: () => storage });
    await repository.save(record);
    const setItem = storage.setItem.bind(storage);
    storage.setItem = () => {
      throw new Error("quota exceeded");
    };
    const updated = createLearningProgressRecord(pathId, stepIds, "2026-10-03T12:00:00.000Z");

    expect(await repository.save(updated)).toBe("temporary");
    expect(await repository.load(pathId, stepIds)).toEqual({
      record: updated,
      persistence: "temporary",
    });

    storage.setItem = setItem;
    expect(await repository.save(updated)).toBe("persistent");
    expect(await repository.load(pathId, stepIds)).toEqual({
      record: updated,
      persistence: "persistent",
    });
  });

  it("does not restore old progress after a failed reset", async () => {
    const storage = new MemoryStorage();
    const repository = createBrowserLearningProgressRepository({ getStorage: () => storage });
    await repository.save(record);
    const removeItem = storage.removeItem.bind(storage);
    storage.removeItem = () => {
      throw new Error("removal blocked");
    };

    expect(await repository.clear(pathId)).toBe("temporary");
    expect(await repository.load(pathId, stepIds)).toEqual({
      record: null,
      persistence: "temporary",
    });

    storage.removeItem = removeItem;
    expect(await repository.clear(pathId)).toBe("persistent");
    expect(await repository.load(pathId, stepIds)).toEqual({
      record: null,
      persistence: "persistent",
    });
  });

  it("retains a temporary save when browser storage becomes accessible again", async () => {
    const storage = new MemoryStorage();
    let available = false;
    const repository = createBrowserLearningProgressRepository({
      getStorage: () => (available ? storage : undefined),
    });
    await repository.save(record);
    available = true;
    expect(await repository.load(pathId, stepIds)).toEqual({
      record,
      persistence: "temporary",
    });
  });
});
