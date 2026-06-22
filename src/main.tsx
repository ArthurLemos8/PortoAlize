import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Importa a árvore de rotas gerada automaticamente pelo plugin do Vite
import { routeTree } from "./routeTree.gen";

// Cria a instância do router
const router = createRouter({ routeTree });

// Registra o router para segurança de tipos (Type Safety)
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
