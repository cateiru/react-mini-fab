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
  draggableId?: string;

  badge?: Badge;

  children?: React.ReactNode;
};

type Badge = {
  color: string;
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
    const timers: NodeJS.Timeout[] = [];

    // initial animation
    if (initializeHide) {
      const timer = setTimeout(() => {
        setInitializeHide(false);
      }, 100);
      timers.push(timer);
    }
    // switch position animation
    if (props.position !== position) {
      setOverrideHide(true);
      const timer1 = setTimeout(() => {
        setHideAnimation(false);
        setPosition(props.position ?? "right");
      }, 100);
      timers.push(timer1);

      // reset override after animation
      setTimeout(() => {
        setHideAnimation(true);
        setOverrideHide(false);
      }, 200);
    }

    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
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
      <Draggable targetRef={ref} draggableId={props.draggableId} />
      {props.badge && (
        <span
          className={classNames(styles["floating-action-button-badge"])}
          style={{ backgroundColor: props.badge.color }}
        />
      )}
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
