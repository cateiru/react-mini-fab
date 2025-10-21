import { useEffect, useRef, useState } from "react";

/**
 * Props for the Draggable component
 */
export type DraggableProps = {
  /** Reference to the HTML element that should be made draggable */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Optional unique identifier for saving/loading position from localStorage */
  draggableId?: string;
};

/**
 * A component that makes a target element draggable vertically.
 * The element's position is saved to localStorage if a draggableId is provided.
 * The position is automatically clamped to prevent the element from being dragged beyond the screen bounds.
 *
 * @param props - Component props
 * @returns null (this component renders nothing visible)
 *
 * @example
 *
 * ```tsx
 * const MyComponent = () => {
 *   const elementRef = useRef<HTMLDivElement>(null);
 *
 *   return (
 *     <>
 *       <div ref={elementRef}>Drag me!</div>
 *       <Draggable targetRef={elementRef} draggableId="my-element" />
 *     </>
 *   );
 * };
 * ```
 */
export const Draggable = (props: DraggableProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ y: 0 });
  const initialPositionRef = useRef({ y: 0 });

  // Load saved position from LocalStorage
  useEffect(() => {
    const element = props.targetRef.current;
    if (!element || !props.draggableId) return;

    const storageKey = `draggable-position-${props.draggableId}`;
    const savedPosition = localStorage.getItem(storageKey);

    if (savedPosition) {
      try {
        const { y } = JSON.parse(savedPosition);

        // Clamp y if it exceeds the screen's maximum value
        const maxY = window.innerHeight - element.offsetHeight;
        const clampedY = Math.min(y, maxY);

        element.style.top = `${clampedY}px`;

        // Re-save the clamped value to LocalStorage
        if (clampedY !== y) {
          localStorage.setItem(storageKey, JSON.stringify({ y: clampedY }));
        }
      } catch (error) {
        console.error("Failed to parse saved position:", error);
      }
    }
  }, [props.targetRef, props.draggableId]);

  // Handle drag events
  useEffect(() => {
    const element = props.targetRef.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Get the current CSS value
      const computedStyle = window.getComputedStyle(element);
      const currentTop = Number.parseFloat(computedStyle.top) || 0;

      initialPositionRef.current = {
        y: currentTop,
      };

      dragStartRef.current = {
        y: e.clientY,
      };

      element.dataset.dragging = "true";
      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = e.clientY - dragStartRef.current.y;
      const newTop = initialPositionRef.current.y + deltaY;

      // Clamp y if it exceeds the screen's maximum value
      const maxY = window.innerHeight - element.offsetHeight;
      const clampedTop = Math.min(newTop, maxY);

      element.style.top = `${clampedTop}px`;
    };

    const handleMouseUp = () => {
      if (element) {
        delete element.dataset.dragging;

        // Save position to LocalStorage
        if (props.draggableId) {
          const storageKey = `draggable-position-${props.draggableId}`;
          const computedStyle = window.getComputedStyle(element);
          const currentTop = Number.parseFloat(computedStyle.top) || 0;
          localStorage.setItem(storageKey, JSON.stringify({ y: currentTop }));
        }
      }
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
  }, [isDragging, props.targetRef, props.draggableId]);

  return null;
};
