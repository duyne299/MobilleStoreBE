"use client";
import React from 'react';
import { Shield, RefreshCw, Truck, Award, Facebook, MessageCircle, Youtube, Clock, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Thương hiệu đảm bảo",
      description: "Nhập khẩu, bảo hành chính hãng"
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-red-600" />,
      title: "Đổi trả dễ dàng",
      description: "Theo chính sách đổi trả tại Duyne Shop"
    },
    {
      icon: <Truck className="w-8 h-8 text-red-600" />,
      title: "Giao hàng tận nơi",
      description: "Trên toàn quốc"
    },
    {
      icon: <Award className="w-8 h-8 text-red-600" />,
      title: "Sản phẩm chất lượng",
      description: "Đảm bảo tương thích và độ bền cao"
    }
  ];

  const paymentMethods = [
    { name: "Visa", logo: "https://cdn2.fptshop.com.vn/svg/visa_icon_44fe6e15ed.svg" },
    { name: "Mastercard", logo: "https://cdn2.fptshop.com.vn/svg/mastercard_icon_c75f94f6a5.svg" },
    { name: "JCB", logo: "https://cdn2.fptshop.com.vn/svg/jcb_icon_214783937c.svg" },
    { name: "VNPay", logo: "https://cdn2.fptshop.com.vn/svg/vnpay_icon_f42045057d.svg" },
    { name: "ZaloPay", logo: "https://cdn2.fptshop.com.vn/svg/zalopay_icon_26d64ea93f.svg" },
    { name: "Napas", logo: "https://cdn2.fptshop.com.vn/svg/napas_icon_94d5330e3c.svg" },
    { name: "Apple Pay", logo: "https://cdn2.fptshop.com.vn/svg/applepay_icon_cb6806a0d0.svg" },
    { name: "Momo", logo: "https://cdn2.fptshop.com.vn/svg/momo_icon_baef21b5f7.svg" }
  ];

  return (
    <footer className="bg-[#F3F4F6]">
      {/* Features Section */}
      <div className="bg-[#F3F4F6] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="mb-2">
                  {feature.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Store Location Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Hệ thống trên toàn quốc</h2>
            <p className="text-sm text-gray-400 mb-4">
              Bao gồm Cửa hàng Duyne Shop
            </p>
          </div>

          {/* Footer Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Connect */}
            <div>
              <h3 className="text-base font-bold mb-4 uppercase">Kết nối với Duyne Shop</h3>
              <div className="flex gap-3 mb-6">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
              </div>

              <h3 className="text-base font-bold mb-4 uppercase">Tổng đài miễn phí</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Tư vấn mua hàng (Miễn phí)</p>
                  <a href="tel:18006601" className="text-white font-bold text-lg hover:text-red-500">1800.6601</a>
                  <span className="text-gray-400 text-xs ml-2">(Nhánh 1)</span>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Hỗ trợ kỹ thuật</p>
                  <a href="tel:18006601" className="text-white font-bold text-lg hover:text-red-500">1800.6601</a>
                  <span className="text-gray-400 text-xs ml-2">(Nhánh 2)</span>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Góp ý, khiếu nại và liên hệ nhánh cảnh báo vi phạm</p>
                  <a href="tel:18006616" className="text-white font-bold text-lg hover:text-red-500">1800.6616</a>
                  <span className="text-gray-400 text-xs ml-2">(8h00 - 22h00)</span>
                </div>
              </div>
            </div>

            {/* Column 2: About Us */}
            <div>
              <h3 className="text-base font-bold mb-4 uppercase">Về chúng tôi</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white">Giới thiệu về công ty</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Quy chế hoạt động</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Dự án Doanh nghiệp</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Tin tức khuyến mại</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Giới thiệu máy đổi trả</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Hướng dẫn mua hàng & thanh toán online</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Đại lý ủy quyền và TTBH ủy quyền của Apple</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Tra cứu hoá đơn điện tử</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Tra cứu bảo hành</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Câu hỏi thường gặp</a></li>
              </ul>
            </div>

            {/* Column 3: Policies */}
            <div>
              <h3 className="text-base font-bold mb-4 uppercase">Chính sách</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách bảo hành</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách đổi trả</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách bảo mật</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách trả góp</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách khủ hợp sản phẩm</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách giao hàng & lắp đặt</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách mạng di động TeddyTech</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách thu thập & xử lý dữ liệu cá nhân</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Quy định về hỗ trợ kỹ thuật & sao lưu dữ liệu</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách giao hàng & lắp đặt Điện máy, Gia dụng</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách chương trình khách hàng thân thiết</a></li>
              </ul>
            </div>

            {/* Column 4: Payment & Certificates */}
            <div>
              <h3 className="text-base font-bold mb-4 uppercase">Hỗ trợ thanh toán</h3>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {paymentMethods.map((method, index) => (
                  <div key={index} className=" flex items-center justify-start">
                    <img src={method.logo} alt={method.name} className="h-6 w-auto object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>© 2007 - 2024 Công Ty Cổ Phần Bán Lẻ Kỹ Thuật Số</p>
            <p className="mt-2">Địa chỉ: Đường Phan Tây Nhạc, Xuân Phương, Nam Từ Liêm, Hà Nội 129630, Việt Nam</p>
          </div>
        </div>
      </div>
    </footer>
  );
}