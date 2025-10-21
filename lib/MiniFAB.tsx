import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MiniFAB.module.css";
import { classNames } from "./utils/classNames";
import { Draggable } from "./utils/Draggable";

/**
 * Props for the MiniFAB component.
 */
export type MiniFABProps = {
  /**
   * Callback function invoked when the button is clicked.
   */
  onClick?: () => void;

  /**
   * Controls the visibility of the button. When `true`, the button is hidden.
   * @default false
   */
  isHide?: boolean;

  /**
   * Tooltip text displayed when hovering over the button.
   */
  title?: string;

  /**
   * Accessibility label for screen readers.
   */
  ariaLabel: string;

  /**
   * Background color of the button.
   */
  backgroundColor: string;

  /**
   * Position of the button on the screen.
   * @default "left"
   */
  position?: "left" | "right";

  /**
   * Unique identifier for the draggable functionality.
   */
  draggableId?: string;

  /**
   * Badge configuration to display on the button.
   * @default undefined
   */
  badge?: Badge;

  /**
   * Whether to include fixed class names for styling purposes.
   * @default false
   */
  includeFixedClassName?: boolean;

  /**
   * Content to be rendered inside the button (typically an icon).
   */
  children?: React.ReactNode;
};

/**
 * Configuration for the badge displayed on the FloatingActionButton.
 */
type Badge = {
  /**
   * Background color of the badge.
   */
  color: string;
};

/**
 * A floating action button component that can be positioned on either side of the screen
 * and supports dragging, badges, and smooth animations.
 *
 * Features:
 * - Vertically draggable with position persistence (when draggableId is provided)
 * - Smooth show/hide animations
 * - Animated position switching between left and right
 * - Optional badge indicator
 * - Customizable colors and accessibility labels
 *
 * @param props - Component props
 * @returns A floating action button element
 *
 * @example
 *
 * ```tsx
 * <MiniFAB
 *   onClick={() => console.log('Clicked!')}
 *   position="right"
 *   title="Help"
 *   ariaLabel="Open help window"
 *   backgroundColor="#007bff"
 *   draggableId="help-button"
 *   badge={{ color: '#ff0000' }}
 * >
 *   <HelpIcon />
 * </MiniFAB>
 * ```
 */
export const MiniFAB = (props: MiniFABProps) => {
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

  const cssVariables = {
    "--background-color": props.backgroundColor,
    "--focus-outline-color": props.backgroundColor,
    "--badge-color": props.badge?.color,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={classNames(
        styles["floating-action-button-wrapper"],
        isHide ? styles.hide : undefined,
        position === "right" ? styles.right : styles.left,
        hideAnimation ? styles["hide-animation"] : undefined,
        props.includeFixedClassName ? "mini-fab-wrapper" : undefined,
      )}
      style={cssVariables}
    >
      <Draggable targetRef={ref} draggableId={props.draggableId} />
      {props.badge && (
        <span
          className={classNames(
            styles["floating-action-button-badge"],
            props.includeFixedClassName ? "mini-fab-badge" : undefined,
          )}
        />
      )}
      <button
        title={props.title}
        aria-label={props.ariaLabel}
        onClick={() => {
          // if hidden, do nothing
          if (isHide) return;
          props.onClick?.();
        }}
        type="button"
        className={classNames(
          styles["floating-action-button"],
          props.includeFixedClassName ? "mini-fab-button" : undefined,
        )}
      >
        <span
          className={classNames(
            styles["floating-action-button-icon"],
            props.includeFixedClassName ? "mini-fab-icon" : undefined,
          )}
        >
          {props.children}
        </span>
      </button>
    </div>
  );
};
