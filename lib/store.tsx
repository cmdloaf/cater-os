"use client";

/**
 * Vero data store — THE SEAM for a future backend.
 *
 * Today this provider seeds from `SEED_EVENTS` and persists to localStorage.
 * Every component reads/writes events ONLY through the methods exposed here
 * (`listEvents`, `getEvent`, `createEvent`, `updateEvent`, `getStats`). The
 * methods are async-shaped so that migrating to Django REST Framework is purely
 * a matter of swapping each body for a `fetch('/api/events/...')` call — no
 * component or signature changes required. For example:
 *
 *   async function listEvents() {
 *     const res = await fetch(`${API_BASE}/api/events/`);
 *     return res.json();
 *   }
 */

import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SEED_EVENTS } from "./mock-data";
import type {
  DashboardStats,
  EventRecord,
  EventStatus,
  NewEventInput,
} from "./types";

const STORAGE_KEY = "cateros:events:v1";

interface StoreContextValue {
  events: EventRecord[];
  ready: boolean;
  listEvents: () => Promise<EventRecord[]>;
  getEvent: (id: string) => Promise<EventRecord | undefined>;
  createEvent: (input: NewEventInput) => Promise<EventRecord>;
  updateEvent: (
    id: string,
    patch: Partial<EventRecord>
  ) => Promise<EventRecord | undefined>;
  setStatus: (id: string, status: EventStatus) => Promise<void>;
  resetDemo: () => void;
  getStats: () => DashboardStats;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadFromStorage(): EventRecord[] {
  if (typeof window === "undefined") return SEED_EVENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_EVENTS;
    const parsed = JSON.parse(raw) as EventRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_EVENTS;
    return parsed;
  } catch {
    return SEED_EVENTS;
  }
}

function nextId(): string {
  return `evt-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventRecord[]>(SEED_EVENTS);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage on mount (client only).
  useEffect(() => {
    setEvents(loadFromStorage());
    setReady(true);
  }, []);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [events, ready]);

  const listEvents = useCallback(async () => events, [events]);

  const getEvent = useCallback(
    async (id: string) => events.find((e) => e.id === id),
    [events]
  );

  const createEvent = useCallback(async (input: NewEventInput) => {
    const now = new Date().toISOString();
    const record: EventRecord = {
      ...input,
      id: nextId(),
      status: input.status ?? "Draft",
      createdAt: now,
      updatedAt: now,
    };
    setEvents((prev) => [record, ...prev]);
    return record;
  }, []);

  const updateEvent = useCallback(
    async (id: string, patch: Partial<EventRecord>) => {
      let updated: EventRecord | undefined;
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          updated = {
            ...e,
            ...patch,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        })
      );
      return updated;
    },
    []
  );

  const setStatus = useCallback(
    async (id: string, status: EventStatus) => {
      await updateEvent(id, { status });
    },
    [updateEvent]
  );

  const resetDemo = useCallback(() => {
    setEvents(SEED_EVENTS);
  }, []);

  const getStats = useCallback((): DashboardStats => {
    return {
      upcoming: events.filter(
        (e) => e.status === "Upcoming" || e.status === "Confirmed"
      ).length,
      pendingQuotations: events.filter((e) => e.status === "Quotation Sent")
        .length,
      confirmed: events.filter((e) => e.status === "Confirmed").length,
      totalEvents: events.length,
      draft: events.filter((e) => e.status === "Draft").length,
      completed: events.filter((e) => e.status === "Completed").length,
    };
  }, [events]);

  const value = useMemo(
    () => ({
      events,
      ready,
      listEvents,
      getEvent,
      createEvent,
      updateEvent,
      setStatus,
      resetDemo,
      getStats,
    }),
    [
      events,
      ready,
      listEvents,
      getEvent,
      createEvent,
      updateEvent,
      setStatus,
      resetDemo,
      getStats,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
