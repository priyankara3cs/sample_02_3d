"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Session1 from "../components/sessions/Session1";
import Session2 from "../components/sessions/Session2";
import Session3 from "../components/sessions/Session3";
import Session4 from "../components/sessions/Session4";
import Session5 from "../components/sessions/Session5";

const SESSIONS = [Session1, Session2, Session3, Session4, Session5];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export default function HomePage() {
  const [index, setIndex] = useState(0);
  const [t, setT] = useState(0); // ring progress
  const [transitioning, setTransitioning] = useState(false);
  const [introPlaying, setIntroPlaying] = useState(false); // true while a session's intro runs
  const dir = useRef(1);
  const raf = useRef(null);
  const touchStartY = useRef(null);

  // refs to sessions that have intros
  const session1Ref = useRef(null);
  const session2Ref = useRef(null);

  // lock to one viewport (slider)
  useEffect(() => {
    const prev = {
      overflow: document.body.style.overflow,
      height: document.body.style.height,
    };
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.height = prev.height;
    };
  }, []);

  const holeRadius = useMemo(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1920;
    const h = typeof window !== "undefined" ? window.innerHeight : 1080;
    const maxR = Math.sqrt(w * w + h * h) * 0.65;
    return t * maxR;
  }, [t]);

  const animateRingTo = (target) => {
    cancelAnimationFrame(raf.current);
    setTransitioning(true);
    const start = performance.now();
    const startT = t;
    const endT = target;
    const dur = 650;

    const step = (now) => {
      const k = Math.min(1, Math.max(0, (now - start) / dur));
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const val = startT + (endT - startT) * e;
      setT(val);
      if (k < 1) raf.current = requestAnimationFrame(step);
      else {
        if (endT === 1) {
          setIndex((i) => clamp(i + dir.current, 0, SESSIONS.length - 1));
          setT(0);
        }
        setTransitioning(false);
      }
    };
    raf.current = requestAnimationFrame(step);
  };

  /** Runs a session-specific intro (if present) before advancing.
      For index 0 -> session1Ref.playZoom(); index 1 -> session2Ref.playZoom() */
  const runIntroThenNext = async (sessionIndex) => {
    if (introPlaying) return;
    const ref =
      sessionIndex === 0
        ? session1Ref.current
        : sessionIndex === 1
        ? session2Ref.current
        : null;

    if (ref?.playZoom) {
      setIntroPlaying(true);
      await ref.playZoom();
      setIntroPlaying(false);
      dir.current = 1;
      setT(0);
      animateRingTo(1);
    }
  };

  useEffect(() => {
    const busy = () => transitioning || introPlaying;

    const goNext = async () => {
      if (busy()) return;
      // Sessions with their own intros: 0 and 1
      if (index === 0 || index === 1) {
        await runIntroThenNext(index);
        return;
      }
      if (index >= SESSIONS.length - 1) return;
      dir.current = 1;
      setT(0);
      animateRingTo(1);
    };

    const goPrev = () => {
      if (busy() || index <= 0) return;
      dir.current = -1;
      setT(0);
      animateRingTo(1);
    };

    const onWheel = (e) => {
      if (busy()) return;
      if (e.cancelable) e.preventDefault();
      if (e.deltaY > 10) goNext();
      else if (e.deltaY < -10) goPrev();
    };
    const onKey = (e) => {
      if (busy()) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
    };
    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (busy() || touchStartY.current == null) return;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(dy) < 30) return;
      if (dy < 0) goNext();
      else goPrev();
      touchStartY.current = null;
    };
    const onTouchEnd = () => {
      touchStartY.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [index, transitioning, introPlaying]);

  const CurrentComp = SESSIONS[index];
  const targetIndex = clamp(
    index + (transitioning ? dir.current : 0),
    0,
    SESSIONS.length - 1
  );
  const TargetComp = SESSIONS[targetIndex];

  return (
    <main className="main" style={{ overflow: "hidden" }}>
      <div
        className="sessions-stack"
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        {/* Target (below) only during ring change */}
        {transitioning && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              "--hole": "0px",
            }}
          >
            <TargetComp />
          </div>
        )}

        {/* Current (above). Attach refs to sessions with intros (0 & 1) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            "--hole": transitioning ? `${holeRadius}px` : "0px",
          }}
        >
          {index === 0 ? (
            <CurrentComp ref={session1Ref} />
          ) : index === 1 ? (
            <CurrentComp ref={session2Ref} />
          ) : (
            <CurrentComp />
          )}
          {transitioning && (
            <div
              className="ring-overlay"
              style={{ "--hole": `${holeRadius}px` }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
