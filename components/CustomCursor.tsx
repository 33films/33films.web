"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "view" | "open";

export default function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 280, mass: 0.6 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setVisible(true);
    };

    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-cursor='view']")) {
        setMode("view");
      } else if (target.closest("a, button, [role='button']")) {
        setMode("open");
      } else {
        setMode("default");
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
    };
  }, [isMobile, cursorX, cursorY]);

  if (isMobile) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
        style={{ x, y }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: mode === "default" ? 1 : 2.2,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{
            width: mode === "default" ? 10 : 72,
            height: mode === "default" ? 10 : 72,
            transition: "width 0.35s ease, height 0.35s ease",
          }}
        >
          {mode === "default" ? (
            <div className="h-full w-full rounded-full bg-off-white" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border border-off-white">
              <span className="text-label text-[0.55rem] text-off-white">
                {mode === "view" ? "VIEW" : "OPEN"}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
