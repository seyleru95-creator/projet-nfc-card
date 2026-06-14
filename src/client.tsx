import { StartClient } from "@tanstack/react-start/client";
import { getRouter } from "./router";
import { hydrateRoot } from "react-dom/client";

const router = getRouter();

hydrateRoot(document, <StartClient router={router} />);