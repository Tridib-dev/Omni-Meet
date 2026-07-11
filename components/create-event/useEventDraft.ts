import { useCallback, useEffect, useRef, useState } from "react";
import { EventDraft, emptyDraft } from "./types";

const STORAGE_KEY = "eventDraft:v1";

type SerializableDraft = Omit<EventDraft, "imageFile">;

const readStoredDraft = (): SerializableDraft | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SerializableDraft;
  } catch {
    return null;
  }
};

/**
 * Persists the draft to sessionStorage on every change (debounced) so a
 * refresh, accidental back-nav, or auth redirect never loses the user's
 * progress. The File object itself can't be serialized, so we keep the
 * File in memory only and persist the preview URL / a "hadImage" flag
 * for messaging ("re-select your banner image" on restore, if needed).
 */
export const useEventDraft = () => {
  const [draft, setDraft] = useState<EventDraft>(() => {
    const stored = readStoredDraft();
    return stored ? { ...emptyDraft, ...stored, imageFile: null } : emptyDraft;
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      const { imageFile: _imageFile, ...serializable } = draft;
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      } catch {
        // storage full or unavailable — fail silently, draft still lives in memory
      }
    }, 250);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [draft]);

  const updateDraft = useCallback((patch: Partial<EventDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    setDraft(emptyDraft);
  }, []);

  return { draft, updateDraft, resetDraft, isHydrated };
};
