'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Toast from '@/components/ui/Toast';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // 🔹 State hiển thị thông báo
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 🔹 Hiển thị lỗi từ hook useAuth
  useEffect(() => {
    if (error) {
      setToast({
        message: error,
        type: 'error'
      });
    }
  }, [error]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔹 Validate email trống
    if (!formData.email.trim()) {
      setToast({
        message: 'Vui lòng nhập email!',
        type: 'error'
      });
      return;
    }
    
    // 🔹 Validate password trống
    if (!formData.password.trim()) {
      setToast({
        message: 'Vui lòng nhập mật khẩu!',
        type: 'error'
      });
      return;
    }

    // 🔹 Gọi API login
    const res = await login(formData);
    
    // 🔹 Nếu login thất bại (return null), error đã được set trong hook
    if (!res) {
      return;
    }
    
    // 🔹 Kiểm tra nếu tài khoản bị khóa (status = false)
    if (res?.user?.status === false) {
      setToast({
        message: 'Tài khoản của quý khách đã bị cấm!',
        type: 'error'
      });
      return;
    }
    
    // 🔹 Đăng nhập thành công
    if (res?.access_token) {
      setToast({ message: 'Đăng nhập thành công!', type: 'success' });
      setTimeout(() => router.push('/'), 1500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
        {/* 🔹 Toast notification (ở giữa bên trên) */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 px-5 py-3 rounded-lg shadow-lg border ${
                toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'error' ? (
                  <XCircle size={20} className="text-red-500" />
                ) : (
                  <CheckCircle2 size={20} className="text-green-500" />
                )}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              {/* 🔹 Thanh progress chạy dần hết trong 3 giây */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className={`h-1 rounded-full ${
                  toast.type === 'error' ? 'bg-red-400' : 'bg-green-400'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔹 Form login */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại</h1>
              <p className="text-blue-100">Đăng nhập để tiếp tục</p>
            </div>

            <div className="p-8 space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 group transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                {!loading && (
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              {/* Register link */}
              <div className="mt-6 text-center">
                <span className="text-gray-600">Chưa có tài khoản? </span>
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast toast={toast} />
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </>
  );
}