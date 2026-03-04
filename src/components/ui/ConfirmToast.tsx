import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ConfirmToastProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  show: boolean;
}

export default function ConfirmToast({ message, onConfirm, onCancel, show }: ConfirmToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          
          {/* Toast container */}
          <motion.div
            key="confirm-toast"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              type: "spring",
              duration: 0.4,
              bounce: 0.3
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[360px]"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header with gradient accent */}
              <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
              
              <div className="p-6">
                {/* Icon and close button */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                    className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full"
                  >
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </motion.div>
                  
                  <button
                    onClick={onCancel}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                {/* Message */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Xác nhận xóa
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {message}
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                  >
                    Xóa ngay
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}