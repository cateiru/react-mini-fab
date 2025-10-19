import { useRef } from "react";
import styles from "./FloatingActionButton.module.css";
import { classNames } from "./utils/classNames";
import { Draggable } from "./utils/Dragable";

type FloatingActionButtonProps = {
  onClick?: () => void;
  isHide?: boolean;

  title?: string;
  ariaLabel?: string;
  backgroundColor?: string;
  position?: "left" | "right";

  children?: React.ReactNode;
};

export const FloatingActionButton = (props: FloatingActionButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={classNames(
        styles["floating-action-button-wrapper"],
        props.isHide ? styles.hide : undefined,
        props.position === "right" ? styles.right : styles.left,
      )}
    >
      <Draggable targetRef={ref} />
      <button
        title={props.title}
        aria-label={props.ariaLabel}
        onClick={() => {
          if (props.isHide) return;
          props.onClick?.();
        }}
        type="button"
        className={classNames(styles["floating-action-button"])}
        style={{
          backgroundColor: props.backgroundColor,
        }}
      >
        <span className={classNames(styles["floating-action-button-icon"])}>
          {props.children}
        </span>
      </button>
    </div>
  );
};
