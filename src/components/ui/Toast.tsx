// components/Toast.tsx
import { AnimatePresence, motion } from "framer-motion";
import { XCircle, CheckCircle2 } from "lucide-react";

interface ToastProps {
  toast: { type: "success" | "error"; message: string } | null;
}

export default function Toast({ toast }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 px-5 py-3 rounded-lg shadow-lg border ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === "error" ? (
              <XCircle size={20} className="text-red-500" />
            ) : (
              <CheckCircle2 size={20} className="text-green-500" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>

          {/* progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
            className={`h-1 rounded-full ${
              toast.type === "error" ? "bg-red-400" : "bg-green-400"
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
