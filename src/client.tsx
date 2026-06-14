import { StartClient } from "@tanstack/react-start/client";
import { getRouter } from "./router";
import { createRoot } from "react-dom/client";

const router = getRouter();

const rootEl = document.getElementById("root") ?? document.body;
createRoot(rootEl).render(<StartClient router={router} />);