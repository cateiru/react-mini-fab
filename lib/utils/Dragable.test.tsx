import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, test } from "vitest";
import { Draggable } from "./Dragable";

// テスト用のラッパーコンポーネント
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
  test("コンポーネントが正常にレンダリングされる", () => {
    const { container } = render(<DraggableWrapper />);
    expect(container).toBeTruthy();
  });

  test("null を返す", () => {
    const targetRef = { current: null };
    const { container } = render(<Draggable targetRef={targetRef} />);
    expect(container.firstChild).toBeNull();
  });

  test("mousedown イベントでドラッグが開始される", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    fireEvent.mouseDown(element, { clientY: 150 });

    expect(element.dataset.dragging).toBe("true");
  });

  test("mousemove イベントで要素が移動する", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // ドラッグ開始
    fireEvent.mouseDown(element, { clientY: 150 });

    // マウスを50px下に移動
    fireEvent.mouseMove(document, { clientY: 200 });

    // top が 150px (100px + 50px) になることを期待
    expect(element.style.top).toBe("150px");
  });

  test("mouseup イベントでドラッグが終了する", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // ドラッグ開始
    fireEvent.mouseDown(element, { clientY: 150 });
    expect(element.dataset.dragging).toBe("true");

    // ドラッグ終了
    fireEvent.mouseUp(document);
    expect(element.dataset.dragging).toBeUndefined();
  });

  test("ドラッグ中でない場合、mousemove イベントが無視される", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // ドラッグを開始せずに mousemove
    fireEvent.mouseMove(document, { clientY: 200 });

    // top は初期値のまま
    expect(element.style.top).toBe("100px");
  });

  test("複数回のドラッグ操作が正しく動作する", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // 1回目のドラッグ: 50px下に移動
    fireEvent.mouseDown(element, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 200 });
    fireEvent.mouseUp(document);
    expect(element.style.top).toBe("150px");

    // 2回目のドラッグ: さらに30px下に移動
    fireEvent.mouseDown(element, { clientY: 180 });
    fireEvent.mouseMove(document, { clientY: 210 });
    fireEvent.mouseUp(document);
    expect(element.style.top).toBe("180px");
  });

  test("負の方向への移動も正しく動作する", () => {
    const { getByTestId } = render(<DraggableWrapper />);
    const element = getByTestId("draggable-element");

    // ドラッグ開始
    fireEvent.mouseDown(element, { clientY: 150 });

    // マウスを30px上に移動
    fireEvent.mouseMove(document, { clientY: 120 });

    // top が 70px (100px - 30px) になることを期待
    expect(element.style.top).toBe("70px");
  });

  test("targetRef が null の場合、エラーが発生しない", () => {
    const targetRef = { current: null };

    expect(() => {
      render(<Draggable targetRef={targetRef} />);
    }).not.toThrow();
  });
});
