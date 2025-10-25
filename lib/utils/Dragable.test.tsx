import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  calculateDragDistance,
  clampYPosition,
  Draggable,
  getCurrentTop,
  loadPositionFromStorage,
  savePositionToStorage,
} from "./Draggable";

// Test wrapper component
const DraggableWrapper = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        ref={targetRef}
        data-testid="draggable-element"
        style={{
          position: "absolute",
          top: "100px",
          left: "50px",
          width: "100px",
          height: "100px",
        }}
      >
        Drag me
      </div>
      <Draggable targetRef={targetRef} />
    </div>
  );
};

describe("Draggable", () => {
  test("renders the component successfully", () => {
    const { container } = render(<DraggableWrapper />);
    expect(container).toBeTruthy();
  });

  test("returns null", () => {
    const targetRef = { current: null };
    const { container } = render(<Draggable targetRef={targetRef} />);
    expect(container.firstChild).toBeNull();
  });

  test("starts dragging on mousedown event", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    fireEvent.mouseDown(element, { clientY: 150 });

    expect(element.dataset.dragging).toBe("true");
  });

  test("moves the element on mousemove event", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // Start dragging
    fireEvent.mouseDown(element, { clientY: 150 });

    // Move mouse 50px down
    fireEvent.mouseMove(document, { clientY: 200 });

    // Expect top to be 150px (100px + 50px)
    expect(element.style.top).toBe("150px");
  });

  test("stops dragging on mouseup event", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // Start dragging
    fireEvent.mouseDown(element, { clientY: 150 });
    expect(element.dataset.dragging).toBe("true");

    // End dragging
    fireEvent.mouseUp(document);
    expect(element.dataset.dragging).toBeUndefined();
  });

  test("ignores mousemove event when not dragging", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // Move mouse without starting drag
    fireEvent.mouseMove(document, { clientY: 200 });

    // Top remains at initial value
    expect(element.style.top).toBe("100px");
  });

  test("handles multiple drag operations correctly", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // First drag: move 50px down
    fireEvent.mouseDown(element, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 200 });
    fireEvent.mouseUp(document);
    expect(element.style.top).toBe("150px");

    // Second drag: move another 30px down
    fireEvent.mouseDown(element, { clientY: 180 });
    fireEvent.mouseMove(document, { clientY: 210 });
    fireEvent.mouseUp(document);
    expect(element.style.top).toBe("180px");
  });

  test("handles movement in negative direction correctly", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // Start dragging
    fireEvent.mouseDown(element, { clientY: 150 });

    // Move mouse 30px up
    fireEvent.mouseMove(document, { clientY: 120 });

    // Expect top to be 70px (100px - 30px)
    expect(element.style.top).toBe("70px");
  });

  test("does not throw error when targetRef is null", () => {
    const targetRef = { current: null };

    expect(() => {
      render(<Draggable targetRef={targetRef} />);
    }).not.toThrow();
  });
});

describe("Draggable with LocalStorage", () => {
  beforeEach(() => {
    // Clear LocalStorage
    localStorage.clear();
  });

  afterEach(() => {
    // Clear LocalStorage after test
    localStorage.clear();
  });

  const DraggableWrapperWithId = ({
    draggableId,
  }: {
    draggableId?: string;
  }) => {
    const targetRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        <div
          ref={targetRef}
          data-testid="draggable-element"
          style={{
            position: "absolute",
            top: "100px",
            left: "50px",
            width: "100px",
            height: "100px",
          }}
        >
          Drag me
        </div>
        <Draggable targetRef={targetRef} draggableId={draggableId} />
      </div>
    );
  };

  test("saves position to LocalStorage when draggableId is specified and dragging ends", () => {
    const { getByTestId } = render(
      <DraggableWrapperWithId draggableId="test-draggable" />,
    );
    const element = getByTestId("draggable-element");

    // Drag and change position
    fireEvent.mouseDown(element, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 200 });
    fireEvent.mouseUp(document);

    // Verify saved to LocalStorage
    const savedPosition = localStorage.getItem(
      "draggable-position-test-draggable",
    );
    expect(savedPosition).toBeTruthy();

    const parsed = JSON.parse(savedPosition as string);
    expect(parsed.y).toBe(150);
  });

  test("does not save to LocalStorage when draggableId is not specified", () => {
    const { getByTestId } = render(<DraggableWrapperWithId />);
    const element = getByTestId("draggable-element");

    // Drag and change position
    fireEvent.mouseDown(element, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 200 });
    fireEvent.mouseUp(document);

    // Verify not saved to LocalStorage
    expect(localStorage.length).toBe(0);
  });

  test("applies saved position from LocalStorage on initial render", () => {
    // Save position to LocalStorage beforehand
    localStorage.setItem(
      "draggable-position-test-draggable",
      JSON.stringify({ y: 250 }),
    );

    const { getByTestId } = render(
      <DraggableWrapperWithId draggableId="test-draggable" />,
    );
    const element = getByTestId("draggable-element");

    // Verify position loaded from LocalStorage is applied
    expect(element.style.top).toBe("250px");
  });

  test("uses initial position without error when invalid JSON is saved", () => {
    // Save invalid JSON
    localStorage.setItem("draggable-position-test-draggable", "invalid json");

    // Verify no error occurs and initial position is used
    const { getByTestId } = render(
      <DraggableWrapperWithId draggableId="test-draggable" />,
    );
    const element = getByTestId("draggable-element");

    // Verify initial position is used
    expect(element.style.top).toBe("100px");
  });

  test("saves positions independently for different draggableIds", () => {
    const { getByTestId: getById1, unmount: unmount1 } = render(
      <DraggableWrapperWithId draggableId="draggable-1" />,
    );
    const element1 = getById1("draggable-element");

    // Drag first element
    fireEvent.mouseDown(element1, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 200 });
    fireEvent.mouseUp(document);

    unmount1();

    const { getByTestId: getById2, unmount: unmount2 } = render(
      <DraggableWrapperWithId draggableId="draggable-2" />,
    );
    const element2 = getById2("draggable-element");

    // Drag second element
    fireEvent.mouseDown(element2, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 250 });
    fireEvent.mouseUp(document);

    unmount2();

    // Verify positions are saved independently
    const position1 = JSON.parse(
      localStorage.getItem("draggable-position-draggable-1") as string,
    );
    const position2 = JSON.parse(
      localStorage.getItem("draggable-position-draggable-2") as string,
    );

    expect(position1.y).toBe(150);
    expect(position2.y).toBe(200);
  });
});

describe("Draggable with onDragStateChange callback", () => {
  const DraggableWrapperWithCallback = ({
    onDragStateChange,
  }: {
    onDragStateChange?: (wasDragged: boolean) => void;
  }) => {
    const targetRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        <div
          ref={targetRef}
          data-testid="draggable-element"
          style={{
            position: "absolute",
            top: "100px",
            left: "50px",
            width: "100px",
            height: "100px",
          }}
        >
          Drag me
        </div>
        <Draggable
          targetRef={targetRef}
          onDragStateChange={onDragStateChange}
        />
      </div>
    );
  };

  test("calls onDragStateChange with true when element is dragged more than threshold", () => {
    const mockCallback = vi.fn();
    const { getByTestId } = render(
      <DraggableWrapperWithCallback onDragStateChange={mockCallback} />,
    );
    const element = getByTestId("draggable-element");

    // Drag more than 5px (threshold)
    fireEvent.mouseDown(element, { clientX: 100, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });
    fireEvent.mouseUp(document, { clientX: 100, clientY: 200 });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(true);
  });

  test("calls onDragStateChange with false when element is clicked (not dragged)", () => {
    const mockCallback = vi.fn();
    const { getByTestId } = render(
      <DraggableWrapperWithCallback onDragStateChange={mockCallback} />,
    );
    const element = getByTestId("draggable-element");

    // Click without dragging
    fireEvent.mouseDown(element, { clientX: 100, clientY: 150 });
    fireEvent.mouseUp(document, { clientX: 100, clientY: 150 });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(false);
  });

  test("calls onDragStateChange with false when drag is less than threshold", () => {
    const mockCallback = vi.fn();
    const { getByTestId } = render(
      <DraggableWrapperWithCallback onDragStateChange={mockCallback} />,
    );
    const element = getByTestId("draggable-element");

    // Drag less than 5px (threshold)
    fireEvent.mouseDown(element, { clientX: 100, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 102, clientY: 152 });
    fireEvent.mouseUp(document, { clientX: 102, clientY: 152 });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(false);
  });

  test("calls onDragStateChange with true for horizontal drag beyond threshold", () => {
    const mockCallback = vi.fn();
    const { getByTestId } = render(
      <DraggableWrapperWithCallback onDragStateChange={mockCallback} />,
    );
    const element = getByTestId("draggable-element");

    // Horizontal drag more than 5px
    fireEvent.mouseDown(element, { clientX: 100, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(document, { clientX: 150, clientY: 150 });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(true);
  });

  test("calls onDragStateChange with true for diagonal drag beyond threshold", () => {
    const mockCallback = vi.fn();
    const { getByTestId } = render(
      <DraggableWrapperWithCallback onDragStateChange={mockCallback} />,
    );
    const element = getByTestId("draggable-element");

    // Diagonal drag (3,4) = 5px distance
    fireEvent.mouseDown(element, { clientX: 100, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 103, clientY: 154 });
    fireEvent.mouseUp(document, { clientX: 103, clientY: 154 });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(false); // Exactly at threshold
  });

  test("calls onDragStateChange with true when drag exceeds threshold slightly", () => {
    const mockCallback = vi.fn();
    const { getByTestId } = render(
      <DraggableWrapperWithCallback onDragStateChange={mockCallback} />,
    );
    const element = getByTestId("draggable-element");

    // Drag 6px (just over threshold of 5px)
    fireEvent.mouseDown(element, { clientX: 100, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 106, clientY: 150 });
    fireEvent.mouseUp(document, { clientX: 106, clientY: 150 });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(true);
  });

  test("does not call onDragStateChange when callback is not provided", () => {
    const { getByTestId } = render(<DraggableWrapperWithCallback />);
    const element = getByTestId("draggable-element");

    // Should not throw error
    expect(() => {
      fireEvent.mouseDown(element, { clientX: 100, clientY: 150 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 200 });
      fireEvent.mouseUp(document, { clientX: 150, clientY: 200 });
    }).not.toThrow();
  });

  test("calls callback multiple times for multiple drag operations", () => {
    const mockCallback = vi.fn();
    const { getByTestId } = render(
      <DraggableWrapperWithCallback onDragStateChange={mockCallback} />,
    );
    const element = getByTestId("draggable-element");

    // First drag
    fireEvent.mouseDown(element, { clientX: 100, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });
    fireEvent.mouseUp(document, { clientX: 100, clientY: 200 });

    // Second click (no drag)
    fireEvent.mouseDown(element, { clientX: 100, clientY: 200 });
    fireEvent.mouseUp(document, { clientX: 100, clientY: 200 });

    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenNthCalledWith(1, true);
    expect(mockCallback).toHaveBeenNthCalledWith(2, false);
  });
});

describe("Utility Functions", () => {
  describe("clampYPosition", () => {
    test("returns the original value when within bounds", () => {
      const element = document.createElement("div");
      Object.defineProperty(element, "offsetHeight", { value: 100 });

      // Mock window.innerHeight
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 1000,
      });

      const result = clampYPosition(500, element);
      expect(result).toBe(500);
    });

    test("clamps to 0 when value is negative", () => {
      const element = document.createElement("div");
      Object.defineProperty(element, "offsetHeight", { value: 100 });

      const result = clampYPosition(-50, element);
      expect(result).toBe(0);
    });

    test("clamps to maximum when value exceeds screen height", () => {
      const element = document.createElement("div");
      Object.defineProperty(element, "offsetHeight", { value: 100 });

      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 1000,
      });

      // maxY should be 1000 - 100 = 900
      const result = clampYPosition(1500, element);
      expect(result).toBe(900);
    });

    test("handles element at exact maximum position", () => {
      const element = document.createElement("div");
      Object.defineProperty(element, "offsetHeight", { value: 100 });

      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 1000,
      });

      const result = clampYPosition(900, element);
      expect(result).toBe(900);
    });
  });

  describe("calculateDragDistance", () => {
    test("calculates distance for horizontal movement", () => {
      const distance = calculateDragDistance(0, 0, 100, 0);
      expect(distance).toBe(100);
    });

    test("calculates distance for vertical movement", () => {
      const distance = calculateDragDistance(0, 0, 0, 100);
      expect(distance).toBe(100);
    });

    test("calculates distance for diagonal movement", () => {
      const distance = calculateDragDistance(0, 0, 3, 4);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    test("calculates distance for negative movement", () => {
      const distance = calculateDragDistance(100, 100, 50, 50);
      expect(distance).toBeCloseTo(70.71, 2); // √(50² + 50²)
    });

    test("returns 0 for no movement", () => {
      const distance = calculateDragDistance(100, 100, 100, 100);
      expect(distance).toBe(0);
    });
  });

  describe("getCurrentTop", () => {
    test("returns the top position from computed style", () => {
      const element = document.createElement("div");
      element.style.top = "150px";
      document.body.appendChild(element);

      const result = getCurrentTop(element);
      expect(result).toBe(150);

      document.body.removeChild(element);
    });

    test("returns 0 when top is not set", () => {
      const element = document.createElement("div");
      document.body.appendChild(element);

      const result = getCurrentTop(element);
      expect(result).toBe(0);

      document.body.removeChild(element);
    });

    test("parses top value with decimal places", () => {
      const element = document.createElement("div");
      element.style.top = "123.45px";
      document.body.appendChild(element);

      const result = getCurrentTop(element);
      expect(result).toBeCloseTo(123.45, 2);

      document.body.removeChild(element);
    });
  });

  describe("loadPositionFromStorage", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    test("loads saved position from localStorage", () => {
      localStorage.setItem(
        "draggable-position-test-id",
        JSON.stringify({ y: 250 }),
      );

      const result = loadPositionFromStorage("test-id");
      expect(result).toBe(250);
    });

    test("returns null when no data is saved", () => {
      const result = loadPositionFromStorage("non-existent-id");
      expect(result).toBeNull();
    });

    test("returns null when saved data is invalid JSON", () => {
      localStorage.setItem("draggable-position-test-id", "invalid json");

      const result = loadPositionFromStorage("test-id");
      expect(result).toBeNull();
    });

    test("returns null when saved data does not contain y property", () => {
      localStorage.setItem(
        "draggable-position-test-id",
        JSON.stringify({ x: 100 }),
      );

      const result = loadPositionFromStorage("test-id");
      expect(result).toBeNull();
    });

    test("returns null when y is not a number", () => {
      localStorage.setItem(
        "draggable-position-test-id",
        JSON.stringify({ y: "not a number" }),
      );

      const result = loadPositionFromStorage("test-id");
      expect(result).toBeNull();
    });

    test("handles negative y values", () => {
      localStorage.setItem(
        "draggable-position-test-id",
        JSON.stringify({ y: -50 }),
      );

      const result = loadPositionFromStorage("test-id");
      expect(result).toBe(-50);
    });
  });

  describe("savePositionToStorage", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    test("saves position to localStorage", () => {
      savePositionToStorage("test-id", 300);

      const saved = localStorage.getItem("draggable-position-test-id");
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved as string);
      expect(parsed.y).toBe(300);
    });

    test("overwrites existing position", () => {
      savePositionToStorage("test-id", 100);
      savePositionToStorage("test-id", 200);

      const saved = localStorage.getItem("draggable-position-test-id");
      const parsed = JSON.parse(saved as string);
      expect(parsed.y).toBe(200);
    });

    test("saves negative values", () => {
      savePositionToStorage("test-id", -50);

      const saved = localStorage.getItem("draggable-position-test-id");
      const parsed = JSON.parse(saved as string);
      expect(parsed.y).toBe(-50);
    });

    test("saves zero value", () => {
      savePositionToStorage("test-id", 0);

      const saved = localStorage.getItem("draggable-position-test-id");
      const parsed = JSON.parse(saved as string);
      expect(parsed.y).toBe(0);
    });

    test("saves decimal values", () => {
      savePositionToStorage("test-id", 123.45);

      const saved = localStorage.getItem("draggable-position-test-id");
      const parsed = JSON.parse(saved as string);
      expect(parsed.y).toBeCloseTo(123.45, 2);
    });
  });
});
