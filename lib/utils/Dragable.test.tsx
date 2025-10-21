import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Draggable } from "./Draggable";

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
