'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'otp-verify' | 'reset-password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // 🔹 Bước 1: Gửi OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Vui lòng nhập email!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await authService.sendForgotPasswordOtp(email);
      if (response?.data?.message) {
        setSuccessMessage('OTP đã được gửi đến email của bạn!');
        setStep('otp-verify');
        setOtpTimer(300); // 5 phút
        startOtpTimer();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi OTP. Vui lòng kiểm tra email!');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Bước 2: Xác minh OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError('Vui lòng nhập OTP!');
      return;
    }

    if (otp.length < 6) {
      setError('OTP phải có ít nhất 6 ký tự!');
      return;
    }

    // Di chuyển sang bước nhập mật khẩu mới
    setStep('reset-password');
    setError('');
  };

  // 🔹 Bước 3: Đặt mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu mới!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyOtpAndResetPassword({
        email,
        otp,
        newPassword,
      });

      if (response?.data?.message) {
        setSuccessMessage('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Hộp thoại OTP hết hạn
  const startOtpTimer = () => {
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setOtpTimer(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold">Khôi phục mật khẩu</h2>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* 🔹 Bước 1: Nhập Email */}
              {step === 'email' && (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <p className="text-gray-600 mb-4">
                    Nhập email của bạn để nhận mã OTP
                  </p>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                      <CheckCircle size={18} />
                      {successMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    }`}
                  >
                    {loading ? 'Đang gửi...' : 'Gửi OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2 rounded-lg font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    Quay về
                  </button>
                </motion.form>
              )}

              {/* 🔹 Bước 2: Nhập OTP */}
              {step === 'otp-verify' && (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <p className="text-gray-600 mb-4">
                    Mã OTP đã được gửi đến <span className="font-medium">{email}</span>
                  </p>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Mã OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setError('');
                      }}
                      maxLength={6}
                      placeholder="000000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                    />
                  </div>

                  {/* OTP Timer */}
                  {otpTimer > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                      <span className="flex items-center gap-2">
                        <Clock size={18} />
                        Hết hạn trong: {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {otpTimer === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                        setError('');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Gửi lại OTP
                    </button>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      loading || otp.length < 6
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    }`}
                  >
                    {loading ? 'Đang xác minh...' : 'Xác minh OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2 rounded-lg font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    Quay về
                  </button>
                </motion.form>
              )}

              {/* 🔹 Bước 3: Đặt mật khẩu mới */}
              {step === 'reset-password' && (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  <p className="text-gray-600 mb-4">
                    Nhập mật khẩu mới của bạn
                  </p>

                  {/* Mật khẩu mới */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="••••••••"
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

                  {/* Xác nhận mật khẩu */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                      <CheckCircle size={18} />
                      {successMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    }`}
                  >
                    {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2 rounded-lg font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    Quay về
                  </button>
                </motion.form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
