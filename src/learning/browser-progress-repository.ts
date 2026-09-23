import type {
  LearningProgressPersistence,
  LearningProgressRecord,
  LearningProgressRepository,
  LearningProgressSnapshot,
} from "./progress";
import { parseLearningProgressRecord } from "./progress";

const STORAGE_PREFIX = "oenocademy:learning-progress:v1:";
const CHANGE_EVENT = "oenocademy:learning-progress-change";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface BrowserEventTarget {
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: Event): boolean;
}

interface BrowserLearningProgressOptions {
  getStorage?: () => StorageLike | undefined;
  eventTarget?: BrowserEventTarget;
}

function storageKey(pathId: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(pathId)}`;
}

export function createBrowserLearningProgressRepository({
  getStorage = () => {
    try {
      return window.localStorage;
    } catch {
      return undefined;
    }
  },
  eventTarget = typeof window === "undefined" ? undefined : window,
}: BrowserLearningProgressOptions = {}): LearningProgressRepository {
  const temporaryRecords = new Map<string, LearningProgressRecord>();

  function resolveStorage(): StorageLike | undefined {
    try {
      return getStorage();
    } catch {
      return undefined;
    }
  }

  function announceChange(pathId: string) {
    eventTarget?.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { pathId } }));
  }

  return {
    async load(pathId, knownStepIds): Promise<LearningProgressSnapshot> {
      const storage = resolveStorage();
      if (!storage) {
        return {
          record: parseLearningProgressRecord(temporaryRecords.get(pathId), pathId, knownStepIds),
          persistence: "temporary",
        };
      }

      let rawValue: string | null;
      try {
        rawValue = storage.getItem(storageKey(pathId));
      } catch {
        return {
          record: parseLearningProgressRecord(temporaryRecords.get(pathId), pathId, knownStepIds),
          persistence: "temporary",
        };
      }
      if (rawValue === null) return { record: null, persistence: "persistent" };

      try {
        return {
          record: parseLearningProgressRecord(JSON.parse(rawValue), pathId, knownStepIds),
          persistence: "persistent",
        };
      } catch {
        return { record: null, persistence: "persistent" };
      }
    },

    async save(record): Promise<LearningProgressPersistence> {
      temporaryRecords.set(record.path_id, record);
      const storage = resolveStorage();
      if (!storage) {
        announceChange(record.path_id);
        return "temporary";
      }

      try {
        storage.setItem(storageKey(record.path_id), JSON.stringify(record));
        announceChange(record.path_id);
        return "persistent";
      } catch {
        announceChange(record.path_id);
        return "temporary";
      }
    },

    async clear(pathId): Promise<LearningProgressPersistence> {
      temporaryRecords.delete(pathId);
      const storage = resolveStorage();
      if (!storage) {
        announceChange(pathId);
        return "temporary";
      }

      try {
        storage.removeItem(storageKey(pathId));
        announceChange(pathId);
        return "persistent";
      } catch {
        announceChange(pathId);
        return "temporary";
      }
    },

    subscribe(pathId, onChange) {
      if (!eventTarget) return () => undefined;

      const onStorage = (event: Event) => {
        const storageEvent = event as StorageEvent;
        if (storageEvent.key === storageKey(pathId)) onChange();
      };
      const onLocalChange = (event: Event) => {
        const customEvent = event as CustomEvent<{ pathId?: string }>;
        if (customEvent.detail?.pathId === pathId) onChange();
      };

      eventTarget.addEventListener("storage", onStorage);
      eventTarget.addEventListener(CHANGE_EVENT, onLocalChange);
      return () => {
        eventTarget.removeEventListener("storage", onStorage);
        eventTarget.removeEventListener(CHANGE_EVENT, onLocalChange);
      };
    },
  };
}

export const browserLearningProgressRepository = createBrowserLearningProgressRepository();
