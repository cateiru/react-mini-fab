import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
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

describe("Draggable with LocalStorage", () => {
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    // テスト後もLocalStorageをクリア
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

  test("draggableId が指定されている場合、ドラッグ終了時に位置が LocalStorage に保存される", () => {
    const { getByTestId } = render(
      <DraggableWrapperWithId draggableId="test-draggable" />,
    );
    const element = getByTestId("draggable-element");

    // ドラッグして位置を変更
    fireEvent.mouseDown(element, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 200 });
    fireEvent.mouseUp(document);

    // LocalStorageに保存されていることを確認
    const savedPosition = localStorage.getItem(
      "draggable-position-test-draggable",
    );
    expect(savedPosition).toBeTruthy();

    const parsed = JSON.parse(savedPosition as string);
    expect(parsed.y).toBe(150);
  });

  test("draggableId が指定されていない場合、LocalStorage に保存されない", () => {
    const { getByTestId } = render(<DraggableWrapperWithId />);
    const element = getByTestId("draggable-element");

    // ドラッグして位置を変更
    fireEvent.mouseDown(element, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 200 });
    fireEvent.mouseUp(document);

    // LocalStorageに保存されていないことを確認
    expect(localStorage.length).toBe(0);
  });

  test("LocalStorage に保存された位置が初期表示時に適用される", () => {
    // 事前にLocalStorageに位置を保存
    localStorage.setItem(
      "draggable-position-test-draggable",
      JSON.stringify({ y: 250 }),
    );

    const { getByTestId } = render(
      <DraggableWrapperWithId draggableId="test-draggable" />,
    );
    const element = getByTestId("draggable-element");

    // LocalStorageから読み込まれた位置が適用されていることを確認
    expect(element.style.top).toBe("250px");
  });

  test("不正な JSON が保存されている場合、エラーが発生せず初期位置が使用される", () => {
    // 不正なJSONを保存
    localStorage.setItem("draggable-position-test-draggable", "invalid json");

    // エラーが発生せず、初期位置が使用されることを確認
    const { getByTestId } = render(
      <DraggableWrapperWithId draggableId="test-draggable" />,
    );
    const element = getByTestId("draggable-element");

    // 初期位置が使用されていることを確認
    expect(element.style.top).toBe("100px");
  });

  test("複数の異なる draggableId で独立して位置が保存される", () => {
    const { getByTestId: getById1, unmount: unmount1 } = render(
      <DraggableWrapperWithId draggableId="draggable-1" />,
    );
    const element1 = getById1("draggable-element");

    // 1つ目の要素をドラッグ
    fireEvent.mouseDown(element1, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 200 });
    fireEvent.mouseUp(document);

    unmount1();

    const { getByTestId: getById2, unmount: unmount2 } = render(
      <DraggableWrapperWithId draggableId="draggable-2" />,
    );
    const element2 = getById2("draggable-element");

    // 2つ目の要素をドラッグ
    fireEvent.mouseDown(element2, { clientY: 150 });
    fireEvent.mouseMove(document, { clientY: 250 });
    fireEvent.mouseUp(document);

    unmount2();

    // それぞれの位置が独立して保存されていることを確認
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
