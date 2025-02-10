import styles from "./styles.module.css";

type State = {
  isCtrlDown: boolean;
  anchorElement: HTMLElement | null;
};

const state: State = {
  isCtrlDown: false,
  anchorElement: null,
};

const highlightElement = (element: HTMLElement) => {
  if (!element) return;
  element.classList.add(styles.highlighted);
};

const unHighlightElement = (element: HTMLElement) => {
  if (!element) return;
  element.classList.remove(styles.highlighted);
};
const pinElement = (element: HTMLElement) => {
  if (!element) return;
  element.classList.add(styles.pinned);
};

const unPinElement = (element: HTMLElement) => {
  if (!element) return;
  element.classList.remove(styles.pinned);
};

const clickHandler = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  if (state.anchorElement !== element) return;
  pinElement(element);
};

const mouseOverHandler = (event: MouseEvent) => {
  unHighlightElement(state.anchorElement as HTMLElement);
  //   unPinElement(state.anchorElement as HTMLElement);

  const element = event.target as HTMLElement;
  state.anchorElement = element;
  highlightElement(state.anchorElement);

  document.addEventListener("click", clickHandler);
};

const keyDownHandler = (event: KeyboardEvent) => {
  if (event.key !== "Control" || state.isCtrlDown) return;
  console.log("keydown event", event);
  state.isCtrlDown = true;
  document.addEventListener("mouseover", mouseOverHandler);
};

const init = () => {
  document.addEventListener("keydown", keyDownHandler);

  document.addEventListener("keyup", (event) => {
    console.log("keyup event", event);
    if (event.ctrlKey) return;
    state.isCtrlDown = false;
    document.removeEventListener("mouseover", mouseOverHandler);
    if (state.anchorElement) {
      unHighlightElement(state.anchorElement);
      unPinElement(state.anchorElement);
    }
  });
};

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
