import React, { useEffect, useState, useCallback } from "react";

type ConnectorProp = {
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  bend?: number;
  strokeWidth?: number;
  color?: string;
};

export const Connector = ({
  containerRef,
  fromRef,
  toRef,
  bend = 120,
  strokeWidth = 2,
  color = "currentColor",
}: ConnectorProp) => {
  const [dims, setDims] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    from: { x: 0, y: 0 },
    to: { x: 0, y: 0 },
  });

  const updateDims = useCallback(() => {
    if (!fromRef.current || !toRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerBox = container.getBoundingClientRect();
    const fromBox = fromRef.current.getBoundingClientRect();
    const toBox = toRef.current.getBoundingClientRect();

    // Add scroll offsets so coordinates stay consistent
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const from = {
      x: (fromBox.right - containerBox.left) + scrollLeft,
      y: (fromBox.top + fromBox.height / 2 - containerBox.top) + scrollTop,
    };
    const to = {
      x: (toBox.left - containerBox.left) + scrollLeft,
      y: (toBox.top + toBox.height / 2 - containerBox.top) + scrollTop,
    };
    const left = Math.min(from.x, to.x);
    const top = Math.min(from.y, to.y);
    const width = Math.abs(to.x - from.x);
    const height = Math.abs(to.y - from.y) || 1;

    setDims({
      left,
      top,
      width,
      height,
      from: { x: from.x - left, y: from.y - top },
      to: { x: to.x - left, y: to.y - top },
    });
  }, [fromRef, toRef, containerRef]);

  useEffect(() => {
    // Run initially
    updateDims();

    // Update whenever window resizes or scrolls
    window.addEventListener("resize", updateDims);
    window.addEventListener("scroll", updateDims, true);

    // Use ResizeObserver to detect size changes in the connected elements
    const resizeObserver = new ResizeObserver(() => {
      updateDims();
    });

    // Use MutationObserver to detect DOM changes (like style changes from dragging)
    const mutationObserver = new MutationObserver(() => {
      updateDims();
    });

    // Observe the from and to elements for size changes
    if (fromRef.current) {
      resizeObserver.observe(fromRef.current);
      mutationObserver.observe(fromRef.current, { 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
      });
    }
    if (toRef.current) {
      resizeObserver.observe(toRef.current);
      mutationObserver.observe(toRef.current, { 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
      });
    }

    // Also observe the container for scroll and size changes
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      containerRef.current.addEventListener("scroll", updateDims);
    }

    return () => {
      window.removeEventListener("resize", updateDims);
      window.removeEventListener("scroll", updateDims, true);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", updateDims);
      }
    };
  }, [fromRef, toRef, containerRef, updateDims]);

  const path = `M ${dims.from.x} ${dims.from.y}
    C ${dims.from.x + bend} ${dims.from.y},
      ${dims.to.x - bend} ${dims.to.y},
      ${dims.to.x} ${dims.to.y}`;

  return (
    <svg
      width={dims.width}
      height={dims.height}
      style={{
        position: "absolute",
        left: dims.left,
        top: dims.top,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 0
      }}
    >
      <path d={path} stroke={color} strokeWidth={strokeWidth} fill="none" />
    </svg>
  );
};
