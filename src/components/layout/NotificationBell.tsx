"use client";

// Cloche de notifications dans le header.
//
// Récupère les notifications dérivées via /api/notifications, gère l'état
// lu/non-lu en localStorage (par device), affiche un point tant qu'il y a du
// non-lu, et un dropdown avec la liste.
//
// Logique lu/non-lu :
//   - visible = actions (toujours, tant que la condition tient) + achievements
//     NON LUS (les lus vivent en permanence dans l'onglet Insights).
//   - À l'ouverture : on fige un snapshot de la liste + l'état "lu" du moment
//     (pour que le panneau ne se vide pas et que le point bleu par ligne soit
//     correct), puis on marque tout comme lu → le compteur passe à 0.

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationTone } from "@/lib/notifications";

const SEEN_KEY = "dca_seen_notifications";

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  try {
    // Cap à 200 ids pour éviter une croissance illimitée (ids périodiques).
    const arr = [...seen].slice(-200);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {
    // localStorage indispo → on perd juste l'état lu, pas grave.
  }
}

const TONE_STYLES: Record<NotificationTone, string> = {
  warning: "bg-orange-50 text-orange-600 border-orange-100",
  success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  info: "bg-primary-50 text-primary-600 border-primary-100",
  default: "bg-gray-50 text-gray-500 border-gray-100",
};

export function NotificationBell() {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  // Snapshots figés à l'ouverture du panneau.
  const [snapshot, setSnapshot] = useState<AppNotification[]>([]);
  const [seenAtOpen, setSeenAtOpen] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Charge l'état lu + fetch les notifications au mount.
  useEffect(() => {
    setSeen(loadSeen());
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setNotifs(Array.isArray(d.notifications) ? d.notifications : []))
      .catch(() => {});
  }, []);

  const visible = notifs.filter(
    (n) => n.category === "action" || !seen.has(n.id),
  );
  const unreadCount = notifs.filter((n) => !seen.has(n.id)).length;

  const openPanel = useCallback(() => {
    setSnapshot(visible);
    setSeenAtOpen(new Set(seen));
    setOpen(true);
    // Marque tout comme lu → le compteur retombe à 0.
    const ns = new Set(seen);
    notifs.forEach((n) => ns.add(n.id));
    saveSeen(ns);
    setSeen(ns);
  }, [notifs, seen, visible]);

  // Esc + click outside ferment le panneau.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointer(e: PointerEvent) {
      const t = e.target as Node | null;
      if (t && !wrapperRef.current?.contains(t)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})`
            : "Notifications"
        }
        aria-haspopup="true"
        aria-expanded={open}
        className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center">
            <span className="absolute inline-flex h-4 w-4 rounded-full bg-primary-400 opacity-60 animate-ping" />
            <span className="relative inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary-600 text-white text-[9px] font-bold tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/[0.04] overflow-hidden animate-fade-in z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Notifications</p>
            {snapshot.length > 0 && (
              <span className="text-xs text-gray-400 tabular-nums">
                {snapshot.length}
              </span>
            )}
          </div>

          {snapshot.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell size={22} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Rien de neuf pour le moment.</p>
              <p className="text-xs text-gray-400 mt-1">
                Loggez vos mois pour débloquer badges et niveaux.
              </p>
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
              {snapshot.map((n) => {
                const isUnread = !seenAtOpen.has(n.id);
                const row = (
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors">
                    <div
                      className={cn(
                        "shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center text-base",
                        TONE_STYLES[n.tone],
                      )}
                      aria-hidden
                    >
                      {n.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                        {n.body}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link href={n.href} onClick={() => setOpen(false)}>
                        {row}
                      </Link>
                    ) : (
                      row
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
