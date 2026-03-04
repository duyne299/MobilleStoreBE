'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 🔹 Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setToast({ message: 'Vui lòng điền đầy đủ tất cả các trường!', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    if (!nameRegex.test(formData.fullName)) {
      setToast({ message: 'Tên không được chứa ký tự đặc biệt!', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({ message: 'Email không hợp lệ! Vui lòng nhập đúng định dạng.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // 🔹 Validate mật khẩu phải có ít nhất 6 ký tự
    if (formData.password.length < 6) {
      setToast({ message: 'Mật khẩu phải có ít nhất 6 ký tự!', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ message: 'Mật khẩu xác nhận không khớp!', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const res = await register(formData);
      if (res?.data?.message || res?.data?.access_token) {
        setToast({ message: 'Đăng ký thành công!', type: 'success' });
        setTimeout(() => router.push('/auth/login'), 1500);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Đã xảy ra lỗi trong quá trình đăng ký!', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      {/* 🔹 Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 px-5 py-3 rounded-lg shadow-lg border ${toast.type === 'error'
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
            {/* 🔹 Thanh progress chạy dần trong 3s */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className={`h-1 rounded-full ${toast.type === 'error' ? 'bg-red-400' : 'bg-green-400'
                }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Form register */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Tạo tài khoản</h1>
            <p className="text-blue-100">Đăng ký để bắt đầu</p>
          </div>

          <div className="p-8 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-gray-700">Mật khẩu (tối thiểu 6 ký tự)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  minLength={6}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 group transition-all duration-200 ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            {/* Login link */}
            <div className="mt-6 text-center">
              <span className="text-gray-600">Đã có tài khoản? </span>
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}