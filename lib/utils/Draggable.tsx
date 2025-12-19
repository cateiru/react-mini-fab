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

/**
 * Threshold in pixels to distinguish between a drag and a click.
 * If the distance moved between mousedown and mouseup exceeds this value, it is considered a drag.
 * @constant {number}
 */
const DRAG_THRESHOLD = 5;

// Utility functions

/**
 * Clamps the Y position to prevent the element from going beyond screen bounds.
 *
 * @param y - The Y coordinate value to clamp
 * @param element - The target HTML element (used to retrieve element height)
 * @returns The clamped Y coordinate (minimum 0, maximum window.innerHeight - element.offsetHeight)
 *
 * @example
 * ```tsx
 * const element = document.getElementById('my-element');
 * const clampedY = clampYPosition(1500, element); // If screen height is 1000px, adjusted to prevent element from going off-screen
 * ```
 *
 * @internal - Exported for testing purposes only
 */
export const clampYPosition = (y: number, element: HTMLElement): number => {
  const maxY = window.innerHeight - element.offsetHeight;
  return Math.min(Math.max(0, y), maxY);
};

/**
 * Loads saved position information from localStorage.
 *
 * @param draggableId - Unique identifier for the draggable element
 * @returns The saved Y coordinate value. Returns null if not saved or if parsing fails
 *
 * @remarks
 * - Storage key is generated in the format `draggable-position-${draggableId}`
 * - Saved data must be a JSON string in the format `{ y: number }`
 * - If parsing fails, an error message is logged to the console
 *
 * @example
 * ```tsx
 * const savedY = loadPositionFromStorage('my-element');
 * if (savedY !== null) {
 *   element.style.top = `${savedY}px`;
 * }
 * ```
 *
 * @internal - Exported for testing purposes only
 */
export const loadPositionFromStorage = (draggableId: string): number | null => {
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
 * Saves the current position information to localStorage.
 *
 * @param draggableId - Unique identifier for the draggable element
 * @param y - The Y coordinate value to save
 *
 * @remarks
 * - Storage key is generated in the format `draggable-position-${draggableId}`
 * - Data is saved as a JSON string in the format `{ y: number }`
 *
 * @example
 * ```tsx
 * const currentY = element.getBoundingClientRect().top;
 * savePositionToStorage('my-element', currentY);
 * ```
 *
 * @internal - Exported for testing purposes only
 */
export const savePositionToStorage = (draggableId: string, y: number): void => {
  const storageKey = `draggable-position-${draggableId}`;
  localStorage.setItem(storageKey, JSON.stringify({ y }));
};

/**
 * Normalizes pointer coordinates from MouseEvent or TouchEvent.
 *
 * @param e - Mouse event or touch event
 * @returns Normalized coordinates { x: number, y: number }
 *
 * @remarks
 * - For MouseEvent: returns e.clientX, e.clientY
 * - For TouchEvent: returns coordinates of the first touch point (e.touches[0])
 * - Uses only the first touch even in multi-touch scenarios
 *
 * @example
 * ```tsx
 * const handlePointerDown = (e: MouseEvent | TouchEvent) => {
 *   const coords = normalizePointerCoordinates(e);
 *   console.log(coords); // { x: 100, y: 200 }
 * };
 * ```
 *
 * @internal - Exported for testing purposes only
 */
export const normalizePointerCoordinates = (
  e: MouseEvent | TouchEvent,
): { x: number; y: number } => {
  if (e instanceof MouseEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  // TouchEvent の場合、最初のタッチのみを使用
  const touch = e.touches[0];
  return { x: touch.clientX, y: touch.clientY };
};

/**
 * Calculates the Euclidean distance between two points.
 *
 * @param startX - X coordinate of the starting point
 * @param startY - Y coordinate of the starting point
 * @param endX - X coordinate of the ending point
 * @param endY - Y coordinate of the ending point
 * @returns The distance between the two points in pixels
 *
 * @remarks
 * Uses the Pythagorean theorem `√(Δx² + Δy²)` to calculate the distance.
 * This function is used to distinguish between drag and click operations.
 *
 * @example
 * ```tsx
 * const distance = calculateDragDistance(100, 100, 150, 150);
 * console.log(distance); // Approximately 70.71 (√(50² + 50²))
 * ```
 *
 * @internal - Exported for testing purposes only
 */
export const calculateDragDistance = (
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
 * Gets the current top position of an element.
 *
 * @param element - The target HTML element
 * @returns The value of the element's top style property in pixels. Returns 0 if not set
 *
 * @remarks
 * - Uses `window.getComputedStyle()` to retrieve computed styles
 * - Retrieves not only inline styles but also values set via CSS
 * - Returns 0 if parsing fails or if the value is not set
 *
 * @example
 * ```tsx
 * const currentTop = getCurrentTop(element);
 * console.log(currentTop); // Example: 150
 * ```
 *
 * @internal - Exported for testing purposes only
 */
export const getCurrentTop = (element: HTMLElement): number => {
  const computedStyle = window.getComputedStyle(element);
  return Number.parseFloat(computedStyle.top) || 0;
};

// Custom hooks

/**
 * Custom hook to load the saved initial position from localStorage and apply it to the element.
 *
 * @param targetRef - Reference to the draggable element
 * @param draggableId - Unique identifier for the element (optional). Loading from localStorage only occurs when specified
 *
 * @remarks
 * - Executes only once when the component mounts
 * - Does nothing if `draggableId` is not specified
 * - If the loaded position is off-screen, it is automatically clamped and re-saved
 * - Re-executes if `targetRef` or `draggableId` changes (included in dependency array)
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const elementRef = useRef<HTMLDivElement>(null);
 *   useInitialPosition(elementRef, 'my-draggable-element');
 *
 *   return <div ref={elementRef}>Draggable content</div>;
 * };
 * ```
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
 * Custom hook to handle drag events.
 *
 * @param targetRef - Reference to the draggable element
 * @param draggableId - Unique identifier for the element (optional). If specified, the position is saved to localStorage when dragging ends
 * @param onDragStateChange - Callback function invoked when drag state changes (optional). Receives `true` if dragged, `false` if just clicked
 *
 * @remarks
 * This hook handles the following three mouse events:
 * 1. **mousedown**: Records initial position and coordinates when dragging starts
 * 2. **mousemove**: Updates element position in real-time during drag (clamped to prevent going off-screen)
 * 3. **mouseup**: When dragging ends, performs the following:
 *    - Calculates drag distance and determines whether it was a drag or click (threshold: {@link DRAG_THRESHOLD})
 *    - Notifies parent component of the result
 *    - Saves position to localStorage (if draggableId is specified)
 *
 * @remarks
 * - Uses `isDraggingRef` to manage state, preventing unnecessary re-renders
 * - Sets `element.dataset.dragging` to `"true"` during drag (can be used for CSS control)
 * - `mousemove` and `mouseup` events are registered on `document`, so dragging continues even when mouse leaves the element
 * - Cleanup function properly removes event listeners, preventing memory leaks
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const elementRef = useRef<HTMLDivElement>(null);
 *   const [wasDragged, setWasDragged] = useState(false);
 *
 *   useDragHandlers(elementRef, 'my-element', (dragged) => {
 *     console.log(dragged ? 'Element was dragged' : 'Element was clicked');
 *     setWasDragged(dragged);
 *   });
 *
 *   return <div ref={elementRef}>Drag me!</div>;
 * };
 * ```
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
  const lastTouchTimeRef = useRef(0);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    // Ignore synthetic mouse events that some browsers fire shortly after touch events.
    // 500ms is chosen to comfortably exceed the typical ~300ms delay while remaining responsive
    // across a range of devices; adjust only if device behavior or UX requirements change.
    const MOUSE_IGNORE_TIMEOUT = 500; // milliseconds

    // 共通のドラッグ開始処理
    const startDrag = (x: number, y: number) => {
      isDraggingRef.current = true;
      initialTopRef.current = getCurrentTop(element);
      dragStartYRef.current = y;
      mouseDownPositionRef.current = { x, y };
      element.dataset.dragging = "true";
    };

    // 共通のドラッグ移動処理
    const moveDrag = (y: number) => {
      if (!isDraggingRef.current) return;

      const deltaY = y - dragStartYRef.current;
      const newTop = initialTopRef.current + deltaY;
      const clampedTop = clampYPosition(newTop, element);

      element.style.top = `${clampedTop}px`;
    };

    // 共通のドラッグ終了処理
    const endDrag = (x: number, y: number) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      delete element.dataset.dragging;

      // Check if it was a drag or just a click
      const dragDistance = calculateDragDistance(
        mouseDownPositionRef.current.x,
        mouseDownPositionRef.current.y,
        x,
        y,
      );
      const wasDragged = dragDistance > DRAG_THRESHOLD;

      onDragStateChange?.(wasDragged);

      // Save position to localStorage
      if (draggableId) {
        const currentTop = getCurrentTop(element);
        savePositionToStorage(draggableId, currentTop);
      }
    };

    // マウスイベントハンドラ
    const handleMouseDown = (e: MouseEvent) => {
      // タッチイベント直後の場合は無視
      if (Date.now() - lastTouchTimeRef.current < MOUSE_IGNORE_TIMEOUT) {
        return;
      }
      const coords = normalizePointerCoordinates(e);
      startDrag(coords.x, coords.y);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const coords = normalizePointerCoordinates(e);
      moveDrag(coords.y);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const coords = normalizePointerCoordinates(e);
      endDrag(coords.x, coords.y);
    };

    // タッチイベントハンドラ
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchTimeRef.current = Date.now();
      const coords = normalizePointerCoordinates(e);
      startDrag(coords.x, coords.y);
      // スクロールを防止するため、touchstartでpreventDefault()を呼ぶ
      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const coords = normalizePointerCoordinates(e);
      moveDrag(coords.y);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // touchendではe.touchesが空なので、changedTouchesを使用
      if (e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      endDrag(touch.clientX, touch.clientY);
    };

    // イベントリスナーの登録
    element.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      // クリーンアップ
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      element.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
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
