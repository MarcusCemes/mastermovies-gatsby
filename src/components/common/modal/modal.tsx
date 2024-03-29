import { PageHeader } from "antd";
import classnames from "classnames";
import React, { CSSProperties, useEffect, useState } from "react";
import { Transition, TransitionGroup } from "react-transition-group";
import { ThemeContext } from "../../../hooks/theme";
import { Spinner } from "../spinner";
import cssStyles from "./modal.module.css";

interface IModalProps {
  /** Show the overlay, and content in a modal if provided */
  active?: boolean;
  /** Hide the modal header */
  noHeader?: boolean;
  /** Text next to the back button */
  backText?: string;
  /**
   * When the user wants to return, a boolean is passed indicating whether
   * the modal should be completely closed (e.g. clicking the overlay)
   */
  onBack?: (all: boolean) => any;
  /** Lock the <body> from scrolling while modal is active */
  scrollLock?: boolean;

  classNames?: {
    modal?: string;
    content?: string;
  };
  styles?: {
    modal?: CSSProperties;
    content?: CSSProperties;
  };
  /** Don't maximize to fullscreen on mobiles */
  noMobileMaximize?: boolean;
}

/**
 * Use `Modal` to display a beautiful modal. `Modal` takes an array of children. Each child will
 * receive its own modal, and only the last child will be shown at any given moment. When adding or
 * removing children, an animation will to transition between child modals.
 *
 * To retrain the ability to edit children, you must pass a unique `key` prop to each child.
 *
 * If no children are passed and the modal is active, a spinner will be shown. The overlay and modal are
 * fixed positioned to cover the parent. The user of React Portals is recommended.
 *
 * If `scrollLock` is enabled, the body will be locked from scrolling while the `Modal` is active.
 *
 * @todo Fix animation on mobile, better layout, better size
 * @example
 * // Each Step has its own Modal, only Step 3 is visible
 * <Modal active scrollLock>
 *   <Step1 />
 *   <Step2 />
 *   <Step3 />
 * </Modal>
 */
export const Modal: React.FC<IModalProps> = ({
  active = false,
  backText = "Back",
  noHeader = false,
  onBack = () => {
    return;
  },
  noMobileMaximize,
  children,
  classNames = {},
  styles = {},
}) => {
  // Remember the width of the scrollbar, may not work if the body is not overflowed
  const [scrollbarWidth, setScrollbarWidth] = useState<number>(0);

  // Lock the body from scrolling without affecting the viewport layout
  useEffect(() => {
    if (active) {
      // Cache the scrollbar size after it disappears
      const newScrollbarWidth = window.innerWidth - document.documentElement.clientWidth || scrollbarWidth;
      if (newScrollbarWidth > 0 && newScrollbarWidth !== scrollbarWidth) {
        setScrollbarWidth(newScrollbarWidth);
      }

      // Increment the lock counter, this is decremented in the cleanup function
      const body = document.getElementsByTagName("body")[0];
      const locks = parseInt(body.getAttribute("data-modal-lock"), 10) || 0;
      const padding = Math.round(newScrollbarWidth).toString() + "px";

      body.style.overflowY = "hidden";
      body.style.paddingRight = padding;

      body.setAttribute("data-modal-lock", (locks + 1).toString());

      return () => {
        const newLocks = parseInt(body.getAttribute("data-modal-lock"), 10) || 0;
        // Return the ability to scroll if all locks (from other modals) have been released
        if (newLocks <= 1) {
          body.style.overflowY = "";
          body.style.paddingRight = "";
          body.removeAttribute("data-modal-lock");
        } else {
          body.setAttribute("data-modal-lock", (newLocks - 1).toString());
        }
      };
    }
  }, [active]);

  const parsedChildren = React.Children.toArray(children);

  // Create the main transition group and overlay logic
  return (
    <ThemeContext.Provider value="light">
      <Transition in={active} timeout={{ enter: 1000, exit: 1000 }} mountOnEnter unmountOnExit>
        <div className={cssStyles.modalWrapper}>
          <Transition key="overlay" in={active} timeout={{ enter: 10, exit: 600 }} appear>
            {(state) => (
              <div
                className={classnames(cssStyles.overlay, { [cssStyles.overlayActive]: state === "entered" })}
                onClick={() => onBack(true)}
              >
                <Spinner active={active && parsedChildren.length === 0} delay={1000} />
              </div>
            )}
          </Transition>

          <TransitionGroup
            component={null}
            children={
              !active
                ? []
                : parsedChildren.map((child, i) => (
                    <Transition
                      key={React.isValidElement(child) ? child.key : ""}
                      timeout={{ enter: 10, exit: 600 }}
                      classNames={{ enterDone: cssStyles.modalActive }}
                      appear
                    >
                      {(state) => (
                        <div
                          style={styles.modal}
                          className={classnames(
                            cssStyles.modal,
                            {
                              [cssStyles.modalActive]: state === "entered",
                              [cssStyles.modalStacked]: i !== parsedChildren.length - 1,
                              [cssStyles.noMobileMax]: noMobileMaximize,
                            },
                            classNames.modal
                          )}
                        >
                          {!noHeader && <PageHeader title={backText} onBack={() => onBack(false)} />}
                          <div
                            className={classnames(cssStyles.modalContent, classNames.content)}
                            style={styles.content}
                          >
                            {child}
                          </div>
                        </div>
                      )}
                    </Transition>
                  ))
            }
          />
        </div>
      </Transition>
    </ThemeContext.Provider>
  );
};
