import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MiniFAB } from "./MiniFAB";

describe("MiniFAB", () => {
  describe("disabled属性のテスト", () => {
    it("isHide={true}のとき、button要素にdisabled属性が設定される", () => {
      render(
        <MiniFAB ariaLabel="Test FAB" backgroundColor="#ff0000" isHide={true}>
          Test
        </MiniFAB>,
      );

      const button = screen.getByRole("button", { name: "Test FAB" });
      expect(button.hasAttribute("disabled")).toBe(true);
    });

    it("isHide={false}のとき、button要素にdisabled属性が設定されない", async () => {
      render(
        <MiniFAB ariaLabel="Test FAB" backgroundColor="#ff0000" isHide={false}>
          Test
        </MiniFAB>,
      );

      // 初期化アニメーションが完了するのを待つ
      await waitFor(
        () => {
          const button = screen.getByRole("button", { name: "Test FAB" });
          expect(button.hasAttribute("disabled")).toBe(false);
        },
        { timeout: 200 },
      );
    });
  });

  describe("aria-disabled属性のテスト", () => {
    it("isHide={true}のとき、button要素にaria-disabled='true'が設定される", () => {
      render(
        <MiniFAB ariaLabel="Test FAB" backgroundColor="#ff0000" isHide={true}>
          Test
        </MiniFAB>,
      );

      const button = screen.getByRole("button", { name: "Test FAB" });
      expect(button.getAttribute("aria-disabled")).toBe("true");
    });

    it("isHide={false}のとき、button要素にaria-disabled='false'が設定される", async () => {
      render(
        <MiniFAB ariaLabel="Test FAB" backgroundColor="#ff0000" isHide={false}>
          Test
        </MiniFAB>,
      );

      // 初期化アニメーションが完了するのを待つ
      await waitFor(
        () => {
          const button = screen.getByRole("button", { name: "Test FAB" });
          expect(button.getAttribute("aria-disabled")).toBe("false");
        },
        { timeout: 200 },
      );
    });
  });

  describe("クリックイベントのテスト", () => {
    it("isHide={true}のとき、onClickが呼ばれない", async () => {
      const handleClick = vi.fn();
      render(
        <MiniFAB
          ariaLabel="Test FAB"
          backgroundColor="#ff0000"
          isHide={true}
          onClick={handleClick}
        >
          Test
        </MiniFAB>,
      );

      const button = screen.getByRole("button", { name: "Test FAB" });

      // disabled属性があるため、clickイベント自体が発火しない
      // しかし、プログラムから強制的にクリックを試みる
      button.click();

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("isHide={false}のとき、onClickが正常に呼ばれる", async () => {
      const handleClick = vi.fn();
      render(
        <MiniFAB
          ariaLabel="Test FAB"
          backgroundColor="#ff0000"
          isHide={false}
          onClick={handleClick}
        >
          Test
        </MiniFAB>,
      );

      // 初期化アニメーションが完了するのを待つ
      await waitFor(
        () => {
          const button = screen.getByRole("button", { name: "Test FAB" });
          button.click();
          expect(handleClick).toHaveBeenCalledTimes(1);
        },
        { timeout: 200 },
      );
    });
  });

  describe("初期化時のテスト", () => {
    it("初期レンダリング時にdisabled属性が設定される", () => {
      render(
        <MiniFAB ariaLabel="Test FAB" backgroundColor="#ff0000" isHide={false}>
          Test
        </MiniFAB>,
      );

      const button = screen.getByRole("button", { name: "Test FAB" });
      // 初期化時はinitializeHide=trueなので、disabled属性が設定される
      expect(button.hasAttribute("disabled")).toBe(true);
    });

    it("初期化アニメーション後、isHide={false}ならdisabled属性が外れる", async () => {
      render(
        <MiniFAB ariaLabel="Test FAB" backgroundColor="#ff0000" isHide={false}>
          Test
        </MiniFAB>,
      );

      // 初期化アニメーションが完了するのを待つ
      await waitFor(
        () => {
          const button = screen.getByRole("button", { name: "Test FAB" });
          expect(button.hasAttribute("disabled")).toBe(false);
        },
        { timeout: 200 },
      );
    });
  });

  describe("その他のpropsのテスト", () => {
    it("title属性が正しく設定される", () => {
      render(
        <MiniFAB
          ariaLabel="Test FAB"
          title="Test Title"
          backgroundColor="#ff0000"
        >
          Test
        </MiniFAB>,
      );

      const button = screen.getByRole("button", { name: "Test FAB" });
      expect(button.getAttribute("title")).toBe("Test Title");
    });

    it("aria-label属性が正しく設定される", () => {
      render(
        <MiniFAB ariaLabel="Accessible Label" backgroundColor="#ff0000">
          Test
        </MiniFAB>,
      );

      const button = screen.getByRole("button", { name: "Accessible Label" });
      expect(button).toBeTruthy();
    });

    it("children要素が正しくレンダリングされる", () => {
      render(
        <MiniFAB ariaLabel="Test FAB" backgroundColor="#ff0000">
          <span data-testid="child-element">Child Content</span>
        </MiniFAB>,
      );

      const childElement = screen.getByTestId("child-element");
      expect(childElement).toBeTruthy();
      expect(childElement.textContent).toBe("Child Content");
    });
  });
});
