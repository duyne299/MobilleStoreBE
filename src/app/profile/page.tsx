"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Bell, FileText, Heart, MapPin, Shield, LogOut, Camera } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUsers } from '@/hooks/useUser';
import { User, userService } from '@/services/userService';
import Toast from '@/components/ui/Toast';
import MyOrders from '@/components/profile/MyOrder';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  });
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateUser, loading, error } = useUsers();

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load user from localStorage & fetch full profile if userId is missing
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setFormData({
        fullName: userData.fullName || userData.username || '',
        phone: userData.phone || '',
        email: userData.email || '',
        address: userData.address || ''
      });
      if (userData.avatar) {
        setAvatarPreview(userData.avatar);
      }

      // Self-healing: if userId is missing, fetch current user info from server
      if (!userData.userId) {
        userService.getCurrentUser().then((fullUser) => {
          if (fullUser && fullUser.userId) {
            localStorage.setItem('user', JSON.stringify(fullUser));
            setUser(fullUser);
            setFormData({
              fullName: fullUser.fullName || '',
              phone: fullUser.phone || '',
              email: fullUser.email || '',
              address: fullUser.address || ''
            });
            if (fullUser.avatar) {
              setAvatarPreview(fullUser.avatar);
            }
          }
        }).catch(err => console.error("Error fetching full user profile:", err));
      }
    }
  }, []);

  // Check URL params để tự động hiển thị đơn hàng
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders') {
      setShowOrders(true);
      setIsEditing(false);
      // Xóa query param sau khi đã xử lý
      router.replace('/profile', { scroll: false });
    }
  }, [searchParams, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setToast({ type: 'error', message: 'Vui lòng chọn file ảnh!' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setToast({ type: 'error', message: 'Kích thước ảnh không được vượt quá 5MB!' });
        return;
      }

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const updateData: Partial<User> & { status?: boolean } = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        status: true
      };

      if (formData.email.trim() && formData.email !== user.email) {
        updateData.email = formData.email.trim();
      }

      console.log('Updating user with data:', updateData);
      console.log('Avatar file:', avatarFile);

      const updatedUser = await updateUser(
        user.userId,
        updateData,
        avatarFile || undefined
      );

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserData = {
        ...currentUser,
        ...updatedUser
      };
      localStorage.setItem('user', JSON.stringify(newUserData));

      setUser(newUserData);
      setAvatarFile(null);
      setIsEditing(false);
      setToast({ type: 'success', message: 'Cập nhật thông tin thành công!' });

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || ''
      });
      setAvatarPreview(user.avatar || '');
      setAvatarFile(null);
    }
  };

  const handleShowOrders = () => {
    setShowOrders(true);
    setIsEditing(false);
  };

  const handleBackFromOrders = () => {
    setShowOrders(false);
  };

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return '';

    if (avatar.startsWith('data:') || avatar.startsWith('blob:')) {
      return avatar;
    }

    if (avatar.startsWith('http')) {
      return avatar;
    }

    return `${process.env.NEXT_PUBLIC_API_URL}${avatar}`;
  };

  const menuItems = [
    { icon: Package, label: 'Đơn hàng của tôi', action: handleShowOrders },
    { icon: Bell, label: 'Thông báo của tôi', action: () => { } },
    { icon: FileText, label: 'Đổi mật khẩu', action: () => { } },
    { icon: Heart, label: 'Danh sách yêu thích', action: () => { } },
    { icon: MapPin, label: 'Sổ địa chỉ nhận hàng', action: () => { } },
    { icon: Shield, label: 'Thông tin bảo hành', action: () => { } },
    { icon: LogOut, label: 'Đăng xuất', action: handleLogout }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F3F4F6]">
        <Toast toast={toast} />

        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm">
            <a href="/" className="text-blue-600 hover:underline">Trang chủ</a>
            <span className="text-gray-400">/</span>
            <span className="text-blue-600">Tài khoản</span>
            {showOrders && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">Đơn hàng của tôi</span>
              </>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Thêm sticky positioning */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl p-6 sticky top-4">
                <div className="flex items-center gap-3 mb-4">
                  {avatarPreview ? (
                    <img
                      src={getAvatarUrl(avatarPreview)}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {getInitials(formData.fullName)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-800">{formData.fullName}</h2>
                    <p className="text-sm text-gray-500">{formData.phone}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setShowOrders(false);
                    }}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Xem hồ sơ
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={index}
                      onClick={item.action}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: '#f9fafb' }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:text-red-600 transition-colors ${item.label === 'Đơn hàng của tôi' && showOrders ? 'bg-red-50 text-red-600' : ''
                        } ${item.label === 'Đăng xuất' ? 'text-red-600 hover:bg-red-50' : ''}`}
                    >
                      <item.icon size={20} className={
                        item.label === 'Đơn hàng của tôi' && showOrders ? 'text-red-600 ' :
                          item.label === 'Đăng xuất' ? 'text-red-600' : 'text-gray-500'
                      } />
                      <span className="text-sm">{item.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Main content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {showOrders ? (
                  <MyOrders key="orders" onBack={handleBackFromOrders} />
                ) : (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl p-8"
                  >
                    <h1 className="text-2xl font-bold text-gray-800 mb-8">Thông tin cá nhân</h1>

                    <div className="flex justify-center mb-8">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative"
                      >
                        {avatarPreview ? (
                          <img
                            src={getAvatarUrl(avatarPreview)}
                            alt="Avatar"
                            className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                            {getInitials(formData.fullName)}
                          </div>
                        )}
                        {isEditing && (
                          <>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                            >
                              <Camera size={20} />
                            </button>
                          </>
                        )}
                      </motion.div>
                    </div>

                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="grid grid-cols-3 gap-4 py-4 border-b">
                        <label className="text-gray-600 text-sm">Họ và tên</label>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full text-gray-800 font-medium bg-transparent border-none focus:outline-none ${isEditing ? 'border-b-2 border-blue-500 pb-1' : ''
                              }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-b">
                        <label className="text-gray-600 text-sm">Số điện thoại</label>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full text-gray-800 font-medium bg-transparent border-none focus:outline-none ${isEditing ? 'border-b-2 border-blue-500 pb-1' : ''
                              }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-b">
                        <label className="text-gray-600 text-sm">Email</label>
                        <div className="col-span-2">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full text-gray-800 font-medium bg-transparent border-none focus:outline-none ${isEditing ? 'border-b-2 border-blue-500 pb-1' : ''
                              }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-b">
                        <label className="text-gray-600 text-sm">Địa chỉ</label>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full text-gray-800 font-medium bg-transparent border-none focus:outline-none ${isEditing ? 'border-b-2 border-blue-500 pb-1' : ''
                              }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-8 gap-4">
                      {isEditing && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors shadow-md"
                        >
                          Hủy
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        disabled={loading}
                        className="bg-red-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Đang lưu...
                          </>
                        ) : (
                          isEditing ? 'Lưu thông tin' : 'Chỉnh sửa thông tin'
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTopButton />
    </>

  );
}