import { useEffect, useRef, useState } from "react";

type DraggableProps = {
  targetRef: React.RefObject<HTMLElement | null>;
};

export const Draggable = (props: DraggableProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ y: 0 });
  const initialPositionRef = useRef({ y: 0 });

  // ドラッグイベント処理
  useEffect(() => {
    const element = props.targetRef.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      // 現在のCSSの値を取得
      const computedStyle = window.getComputedStyle(element);
      const currentTop = Number.parseFloat(computedStyle.top) || 0;

      initialPositionRef.current = {
        y: currentTop,
      };

      dragStartRef.current = {
        y: e.clientY,
      };

      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = e.clientY - dragStartRef.current.y;
      const newTop = initialPositionRef.current.y + deltaY;

      element.style.top = `${newTop}px`;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    element.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, props.targetRef]);

  return null;
};
