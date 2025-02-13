import { DIMENSIONS } from "./constants";
import styles from "./styles.module.css";

type State = {
  isCtrlDown: boolean;
  anchorElement: HTMLElement | null;
  targetElement: HTMLElement | null;
};

const state: State = {
  isCtrlDown: false,
  anchorElement: null,
  targetElement: null,
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

const removePaintings = () => {
  // Array.from(document.querySelectorAll(`.${styles.line}`)).forEach(
  //   (lineElement) => {
  //     lineElement.remove();
  //   }
  // );
  // Array.from(document.querySelectorAll(`.${styles.size}`)).forEach(
  //   (lineElement) => {
  //     lineElement.remove();
  //   }
  // );
};

const paintLines = (x1: number, x2: number, y1: number, y2: number) => {
  const fragment = document.createDocumentFragment();

  if (x1 !== x2) {
    const horizontalLineWidth = Math.abs(Math.round(x2 - x1));

    const horizontalLine = document.createElement("div");
    horizontalLine.classList.add(styles.line);
    horizontalLine.style.top = `${y1}px`;
    horizontalLine.style.left = `${x1}px`;
    horizontalLine.style.width = `${horizontalLineWidth}px`;
    fragment.appendChild(horizontalLine);

    const horizontalLineWidthSizeBlock = document.createElement("span");
    horizontalLineWidthSizeBlock.classList.add(styles.size, styles.horizontal);
    horizontalLineWidthSizeBlock.style.top = `${
      y1 - DIMENSIONS.lineAndSizeGap - DIMENSIONS.lineWidth
    }px`;
    horizontalLineWidthSizeBlock.style.left = `${
      x1 + horizontalLineWidth / 2
    }px`;
    horizontalLineWidthSizeBlock.innerHTML = `${horizontalLineWidth}px`;
    fragment.appendChild(horizontalLineWidthSizeBlock);
  }

  if (y1 !== y2) {
    const verticalLineHeight = Math.abs(Math.round(y2 - y1));

    const verticalLine = document.createElement("div");
    verticalLine.classList.add(styles.line);
    verticalLine.style.left = `${x1}px`;
    verticalLine.style.top = `${y1}px`;
    verticalLine.style.height = `${verticalLineHeight}px`;
    fragment.appendChild(verticalLine);

    const verticalLineHeightSizeBlock = document.createElement("span");
    verticalLineHeightSizeBlock.classList.add(styles.size, styles.vertical);
    verticalLineHeightSizeBlock.style.left = `${
      x1 - DIMENSIONS.lineAndSizeGap - DIMENSIONS.lineWidth
    }px`;
    verticalLineHeightSizeBlock.style.top = `${y1 + verticalLineHeight / 2}px`;
    verticalLineHeightSizeBlock.innerHTML = `${verticalLineHeight}px`;
    fragment.appendChild(verticalLineHeightSizeBlock);
  }

  if (!fragment.children.length) return;

  document.body.appendChild(fragment);
};

const initRuler = (anchorElement: HTMLElement, targetElement: HTMLElement) => {
  const {
    left: anchorX,
    top: anchorY,
    height: anchorHeight,
    width: anchorWidth,
  } = anchorElement.getBoundingClientRect();
  const {
    left: targetX,
    top: targetY,
    height: targetHeight,
    width: targetWidth,
  } = targetElement.getBoundingClientRect();

  const hasHorizontalSpace = anchorX + anchorWidth !== targetX + targetWidth;
  const hasVerticalSpace = anchorY + anchorHeight !== targetY + targetHeight;

  const isTargetFromRight = targetX + targetWidth > anchorX + anchorWidth;
  const leftElement = isTargetFromRight ? anchorElement : targetElement;
  const { left: leftElementX, width: leftElementWidth } =
    leftElement.getBoundingClientRect();

  const rightElement = isTargetFromRight ? targetElement : anchorElement;
  const { left: rightElementX, width: rightElementWidth } =
    rightElement.getBoundingClientRect();

  const isTargetFromTop = anchorY + anchorHeight > targetY + targetHeight;
  const topElement = isTargetFromTop ? targetElement : anchorElement;
  const { top: topElementY, height: topElementWidth } =
    topElement.getBoundingClientRect();

  const bottomElement = isTargetFromTop ? anchorElement : targetElement;
  const { top: bottomElementY, height: bottomElementHeight } =
    bottomElement.getBoundingClientRect();

  const x1 = leftElementX + leftElementWidth;
  const x2 =
    x1 > rightElementX ? rightElementX + rightElementWidth : rightElementX;
  const y1 = topElementY + topElementWidth;
  const y2 =
    y1 > bottomElementY ? bottomElementY + bottomElementHeight : bottomElementY;

  paintLines(
    hasHorizontalSpace ? x1 : 0,
    hasHorizontalSpace ? x2 : 0,
    hasVerticalSpace ? y1 : 0,
    hasVerticalSpace ? y2 : 0
  );
};

const mouseOverTargetElementHandler = (event: MouseEvent) => {
  unHighlightElement(state.targetElement!);
  state.targetElement = null;
  removePaintings();

  const element = event.target as HTMLElement;
  state.targetElement = element;
  highlightElement(state.targetElement);

  initRuler(state.anchorElement!, state.targetElement);
};

const clickTargetElementHandler = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  unHighlightElement(state.anchorElement!);
  unPinElement(state.anchorElement!);

  pinElement(element);
  state.anchorElement = element;

  unHighlightElement(state.targetElement!);
  state.targetElement = null;
  removePaintings();

  document.removeEventListener("mouseover", mouseOverAnchorElementHandler);
  document.addEventListener("mouseover", mouseOverTargetElementHandler);
};

const mouseOverAnchorElementHandler = (event: MouseEvent) => {
  unHighlightElement(state.anchorElement as HTMLElement);

  unHighlightElement(state.targetElement!);
  state.targetElement = null;

  const element = event.target as HTMLElement;
  state.anchorElement = element;
  highlightElement(state.anchorElement);

  document.addEventListener("click", clickTargetElementHandler);
};

const keyDownHandler = (event: KeyboardEvent) => {
  if (event.key !== "Control" || state.isCtrlDown) return;
  state.isCtrlDown = true;
  document.addEventListener("mouseover", mouseOverAnchorElementHandler);
};

const keyUpHandler = (event: KeyboardEvent) => {
  if (event.ctrlKey) return;
  state.isCtrlDown = false;
  document.removeEventListener("mouseover", mouseOverAnchorElementHandler);
  document.removeEventListener("mouseover", mouseOverTargetElementHandler);
  document.removeEventListener("click", clickTargetElementHandler);

  unHighlightElement(state.anchorElement!);
  unPinElement(state.anchorElement!);
  state.anchorElement = null;

  unHighlightElement(state.targetElement!);
  state.targetElement = null;
  removePaintings();
};

const init = () => {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
};

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
