import * as React from "react"
import { ToastProvider as PrimitiveToastProvider } from "@radix-ui/react-toast"

const ToastContext = React.createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = React.useState([])
    const addToast = ({ id, message, type = "success" }) => {
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000)
    }

    return (
        <ToastContext.Provider value={{ addToast }}>
            <PrimitiveToastProvider>{children}</PrimitiveToastProvider>
            <div className="fixed bottom-4 right-4 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`px-4 py-2 rounded-lg shadow-md border-l-4 ${toast.type === "success"
                                ? "bg-green-600 text-white border-green-400"
                                : "bg-red-600 text-white border-red-400"
                            }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = React.useContext(ToastContext)
    if (!ctx) {
        throw new Error("useToast deve estar dentro de ToastProvider")
    }
    return ctx
}