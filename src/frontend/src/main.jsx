import React from "react"
import ReactDOM from "react-dom/client"
import Inicio from "./Inicio"
import "./index.css"
import { ToastProvider } from "./components/ui/use-toast"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <Inicio />
    </ToastProvider>
  </React.StrictMode>
)
