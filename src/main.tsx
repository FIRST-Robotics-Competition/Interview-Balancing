import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="container">
        <App />
      </div>
    </QueryClientProvider>
  </React.StrictMode>
);
