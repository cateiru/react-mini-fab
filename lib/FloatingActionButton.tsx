import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./FloatingActionButton.module.css";
import { classNames } from "./utils/classNames";
import { Draggable } from "./utils/Dragable";

type FloatingActionButtonProps = {
  onClick?: () => void;
  isHide?: boolean;

  title?: string;
  ariaLabel?: string;
  backgroundColor?: string;
  position?: "left" | "right"; // default: left

  children?: React.ReactNode;
};

export const FloatingActionButton = (props: FloatingActionButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [initializeHide, setInitializeHide] = useState(true);
  const [overrideHide, setOverrideHide] = useState(false);
  const [hideAnimation, setHideAnimation] = useState(true);
  const [position, setPosition] = useState<"left" | "right" | undefined>(
    props.position,
  );

  useEffect(() => {
    // initial animation
    if (initializeHide) {
      setTimeout(() => {
        setInitializeHide(false);
      }, 100);
    }
    // switch position animation
    if (props.position !== position) {
      setOverrideHide(true);
      setTimeout(() => {
        setHideAnimation(false);
        setPosition(props.position ?? "right");

        // reset override after animation
        setTimeout(() => {
          setHideAnimation(true);
          setOverrideHide(false);
        }, 100);
      }, 100);
    }
  }, [initializeHide, position, props.position]);

  const isHide = useMemo(() => {
    if (overrideHide) {
      return true;
    }

    if (props.isHide) {
      return true;
    }
    if (initializeHide) {
      return true;
    }
    return false;
  }, [initializeHide, props.isHide, overrideHide]);

  return (
    <div
      ref={ref}
      className={classNames(
        styles["floating-action-button-wrapper"],
        isHide ? styles.hide : undefined,
        position === "right" ? styles.right : styles.left,
        hideAnimation ? styles["hide-animation"] : undefined,
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
