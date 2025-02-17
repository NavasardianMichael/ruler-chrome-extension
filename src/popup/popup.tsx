import { createRoot } from "react-dom/client";
import { Container } from "./container/Container";

const rootElement = document.getElementById("popup-root") as HTMLElement;
const root = createRoot(rootElement);
root.render(<Container />);
