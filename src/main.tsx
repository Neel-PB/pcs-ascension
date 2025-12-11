import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Preload critical image assets for instant display in LogoLoader
import AscensionEmblem from "@/assets/Ascension-Emblem.svg";
const preloadImage = new Image();
preloadImage.src = AscensionEmblem;

createRoot(document.getElementById("root")!).render(<App />);
