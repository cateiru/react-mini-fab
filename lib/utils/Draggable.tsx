import { useEffect, useRef } from "react";

/**
 * Props for the Draggable component
 */
export type DraggableProps = {
  /** Reference to the HTML element that should be made draggable */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Optional unique identifier for saving/loading position from localStorage */
  draggableId?: string;
  /** Callback function invoked when drag state changes. Returns true if the element was dragged (moved > 5px), false otherwise. */
  onDragStateChange?: (wasDragged: boolean) => void;
};

// Constants
const DRAG_THRESHOLD = 5; // Threshold for drag detection (pixels)

// Utility functions

/**
 * Clamps the Y position to prevent element from going beyond screen bounds
 */
const clampYPosition = (y: number, element: HTMLElement): number => {
  const maxY = window.innerHeight - element.offsetHeight;
  return Math.min(Math.max(0, y), maxY);
};

/**
 * Loads position from localStorage
 */
const loadPositionFromStorage = (draggableId: string): number | null => {
  const storageKey = `draggable-position-${draggableId}`;
  const savedPosition = localStorage.getItem(storageKey);

  if (!savedPosition) return null;

  try {
    const { y } = JSON.parse(savedPosition);
    return typeof y === "number" ? y : null;
  } catch (error) {
    console.error("Failed to parse saved position:", error);
    return null;
  }
};

/**
 * Saves position to localStorage
 */
const savePositionToStorage = (draggableId: string, y: number): void => {
  const storageKey = `draggable-position-${draggableId}`;
  localStorage.setItem(storageKey, JSON.stringify({ y }));
};

/**
 * Calculates the distance between two points
 */
const calculateDragDistance = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): number => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

/**
 * Gets the current top position of an element
 */
const getCurrentTop = (element: HTMLElement): number => {
  const computedStyle = window.getComputedStyle(element);
  return Number.parseFloat(computedStyle.top) || 0;
};

// Custom hooks

/**
 * Hook to load initial position from localStorage
 */
const useInitialPosition = (
  targetRef: React.RefObject<HTMLElement | null>,
  draggableId?: string,
) => {
  useEffect(() => {
    const element = targetRef.current;
    if (!element || !draggableId) return;

    const savedY = loadPositionFromStorage(draggableId);
    if (savedY === null) return;

    const clampedY = clampYPosition(savedY, element);
    element.style.top = `${clampedY}px`;

    // Re-save the clamped value if it was adjusted
    if (clampedY !== savedY) {
      savePositionToStorage(draggableId, clampedY);
    }
  }, [targetRef, draggableId]);
};

/**
 * Hook to handle drag events
 */
const useDragHandlers = (
  targetRef: React.RefObject<HTMLElement | null>,
  draggableId?: string,
  onDragStateChange?: (wasDragged: boolean) => void,
) => {
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const initialTopRef = useRef(0);
  const mouseDownPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      initialTopRef.current = getCurrentTop(element);
      dragStartYRef.current = e.clientY;
      mouseDownPositionRef.current = { x: e.clientX, y: e.clientY };
      element.dataset.dragging = "true";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaY = e.clientY - dragStartYRef.current;
      const newTop = initialTopRef.current + deltaY;
      const clampedTop = clampYPosition(newTop, element);

      element.style.top = `${clampedTop}px`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      delete element.dataset.dragging;

      // Check if it was a drag or just a click
      const dragDistance = calculateDragDistance(
        mouseDownPositionRef.current.x,
        mouseDownPositionRef.current.y,
        e.clientX,
        e.clientY,
      );
      const wasDragged = dragDistance > DRAG_THRESHOLD;

      onDragStateChange?.(wasDragged);

      // Save position to localStorage
      if (draggableId) {
        const currentTop = getCurrentTop(element);
        savePositionToStorage(draggableId, currentTop);
      }
    };

    element.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [targetRef, draggableId, onDragStateChange]);
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
  useInitialPosition(props.targetRef, props.draggableId);
  useDragHandlers(props.targetRef, props.draggableId, props.onDragStateChange);

  return null;
};
