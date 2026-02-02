import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FlowProvider } from "./store/FlowContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FlowProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FlowProvider>
  </React.StrictMode>
);
