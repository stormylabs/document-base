import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function useClientRect() {
  const ref = useRef<HTMLDivElement>(null);

  const getRect = useCallback(() => {
    if (ref && ref.current) {
      return ref.current.getBoundingClientRect();
    }
    return { height: 0, width: 0, x: 0, y: 0 };
  }, [ref, ref.current]);

  // Update 'width' and 'height' when the window resizes
  useEffect(() => {
    window.addEventListener("resize", getRect);
    return () => window.removeEventListener("resize", getRect);
  }, []);

  return [getRect, ref] as const;
}
