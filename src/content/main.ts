// contentScript.ts

// We'll import our CSS directly so Vite includes it in the bundle
import styles from './styles.module.css';

let anchorElement: HTMLElement | null = null;
let anchorRect: DOMRect | null = null;

// States to track whether we're in "selecting anchor" mode or "measuring" mode
let isCtrlPressed = false;
let isEnterPressed = false;

// A helper overlay to draw lines & distance text
let rulerOverlay: HTMLDivElement;
let svgLine: SVGLineElement;
let distanceText: SVGTextElement;

function createOverlay() {
    rulerOverlay = document.createElement('div');
    rulerOverlay.className = styles.rulerOverlay;

    // Create an SVG that spans the entire screen
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    // The line
    svgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    svgLine.setAttribute('stroke', 'red');
    svgLine.setAttribute('stroke-width', '2');
    svg.appendChild(svgLine);

    // The distance label
    distanceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    distanceText.setAttribute('fill', 'red');
    distanceText.setAttribute('font-size', '14');
    svg.appendChild(distanceText);

    rulerOverlay.appendChild(svg);
    document.body.appendChild(rulerOverlay);
}

function removeOverlay() {
    if (rulerOverlay && rulerOverlay.parentNode) {
        rulerOverlay.parentNode.removeChild(rulerOverlay);
    }
}

function updateRulerOverlay(x1: number, y1: number, x2: number, y2: number) {
    if (!svgLine || !distanceText) return;

    // Update line positions
    svgLine.setAttribute('x1', String(x1));
    svgLine.setAttribute('y1', String(y1));
    svgLine.setAttribute('x2', String(x2));
    svgLine.setAttribute('y2', String(y2));

    // Calculate distance
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Place the distance label roughly midway
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    distanceText.setAttribute('x', String(midX));
    distanceText.setAttribute('y', String(midY));
    distanceText.textContent = `${Math.round(dist)}px`;
}

function onMouseMove(event: MouseEvent) {
    // If we're measuring and we have an anchor
    if (isEnterPressed && anchorRect) {
        // Coordinates for anchor's center
        const aX = anchorRect.left + anchorRect.width / 2;
        const aY = anchorRect.top + anchorRect.height / 2;

        // Coordinates for the hovered element's center
        // (Alternatively, we can measure from anchor to the current mouse position
        //  or to the center of the hovered element if we detect it.)
        const hoveredEl = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
        if (!hoveredEl) return;

        const hoveredRect = hoveredEl.getBoundingClientRect();
        const bX = hoveredRect.left + hoveredRect.width / 2;
        const bY = hoveredRect.top + hoveredRect.height / 2;

        updateRulerOverlay(aX, aY, bX, bY);
    }
}

function onClick(event: MouseEvent) {
    // If Ctrl is pressed, this click selects an element as anchor
    if (isCtrlPressed) {
        anchorElement = event.target as HTMLElement;
        anchorRect = anchorElement.getBoundingClientRect();

        // Optional: visually highlight the selected anchor
        removeHighlightFromAll();
        anchorElement.classList.add(styles.rulerHighlight);

        // After selecting anchor, we can remove old overlay if any
        removeOverlay();
        createOverlay();
    }
}

// Remove the highlight from previously selected anchor if needed
function removeHighlightFromAll() {
    document
        .querySelectorAll(styles.rulerHighlight)
        .forEach(el => el.classList.remove(styles.rulerHighlight));
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Control') {
        isCtrlPressed = true;
    }
    if (event.key === 'Enter') {
        isEnterPressed = true;
        // Create the overlay if we have a valid anchor
        if (anchorElement && anchorRect) {
            createOverlay();
        }
    }
}

function onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
        isCtrlPressed = false;
    }
    if (event.key === 'Enter') {
        isEnterPressed = false;
        // Once user stops holding Enter, remove the overlay
        removeOverlay();
    }
}

function init() {
    // Attach event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);
}

// Initialize when DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}
