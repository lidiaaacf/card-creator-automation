import * as React from "react"
import { ToastProvider as PrimitiveToastProvider } from "@radix-ui/react-toast"

const ToastContext = React.createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = React.useState([])

    const addToast = (toast) => {
        setToasts((prev) => [...prev, toast])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, 3000)
    }

    return (
        <ToastContext.Provider value={{ addToast }}>
            <PrimitiveToastProvider>{children}</PrimitiveToastProvider>
            <div className="fixed bottom-4 right-4 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md"
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
