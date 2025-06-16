import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/App.tsx";
import "./index.css";

document.addEventListener("DOMContentLoaded", function () {
  const body = document.getElementsByTagName("body")[0];
  document.title = "阿里图床";
  body.innerHTML = ""; //注入页面设置空白
  const container = document.createElement("div");
  container.id = "root";
  body.appendChild(container);
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
