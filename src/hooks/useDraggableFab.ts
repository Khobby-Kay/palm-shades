"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FabPosition = { x: number; y: number };

const DRAG_THRESHOLD = 10;

type Options = {
  storageKey: string;
  size: number;
  margin?: number;
  /** Minimum px to keep clear at the bottom (tab bar, compare tray, safe area). */
  bottomReserve?: number;
};

function readSafeAreaBottom(): number {
  if (typeof window === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;bottom:0;height:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden;";
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  document.body.removeChild(probe);
  return h;
}

function defaultPosition(size: number, margin: number, bottomReserve: number): FabPosition {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const safe = readSafeAreaBottom();

  if (isDesktop) {
    return {
      x: w - size - margin,
      y: h - size - margin - safe,
    };
  }

  // Mobile: original right-side slot, above view-cart FAB (~5.5rem from bottom).
  const fromBottom = 5.5 * 16 + safe;
  return {
    x: w - size - margin,
    y: h - size - fromBottom,
  };
}

function clampPosition(
  pos: FabPosition,
  size: number,
  margin: number,
  bottomReserve: number
): FabPosition {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const maxY = h - size - bottomReserve;
  return {
    x: Math.min(Math.max(margin, pos.x), w - size - margin),
    y: Math.min(Math.max(margin, pos.y), maxY),
  };
}

export function useDraggableFab({
  storageKey,
  size,
  margin = 16,
  bottomReserve = 72,
}: Options) {
  const [position, setPosition] = useState<FabPosition | null>(null);
  const [ready, setReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragMovedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  const clamp = useCallback(
    (pos: FabPosition) => clampPosition(pos, size, margin, bottomReserve),
    [size, margin, bottomReserve]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as FabPosition;
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setPosition(clamp(parsed));
          setReady(true);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setPosition(clamp(defaultPosition(size, margin, bottomReserve)));
    setReady(true);
  }, [storageKey, size, margin, bottomReserve, clamp]);

  useEffect(() => {
    if (!ready || !position) return;
    const onResize = () => setPosition((p) => (p ? clamp(p) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [ready, position, clamp]);

  useEffect(() => {
    if (!ready || !position) return;
    setPosition((p) => (p ? clamp(p) : p));
  }, [bottomReserve, ready, clamp]);

  const persist = useCallback(
    (pos: FabPosition) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(pos));
      } catch {
        /* ignore */
      }
    },
    [storageKey]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!position) return;
    pointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragMovedRef.current = false;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { ...position };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId || !position) return;
    const dx = e.clientX - startPointerRef.current.x;
    const dy = e.clientY - startPointerRef.current.y;
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    dragMovedRef.current = true;
    setPosition(
      clamp({
        x: startPosRef.current.x + dx,
        y: startPosRef.current.y + dy,
      })
    );
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointerIdRef.current = null;
    setIsDragging(false);
    if (position) persist(position);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    endDrag(e);
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    endDrag(e);
  };

  return {
    position,
    ready,
    isDragging,
    dragMovedRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
