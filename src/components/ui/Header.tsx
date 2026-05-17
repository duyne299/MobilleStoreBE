"use client";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  User,
  UserCircle,
  Package,
  ClipboardList,
  Heart,
  MapPin,
  Shield,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CategoryMenu from "../categories/CategoryMenu";
import Logo from "@/img/Logo.png";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { useProducts } from "@/hooks/useProduct";

export default function Header() {
  const router = useRouter();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuPinned, setIsMenuPinned] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Search suggestions states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { itemCount } = useCart();
  const { products, fetchProducts } = useProducts();

  // Hàm lấy chữ cái đầu từ tên
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Load user data from localStorage
  useEffect(() => {
    try {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserAvatar(userData.avatar || null);
        setUserName(userData.fullName || null);
        setUserRole(userData.role || null);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error loading user data from localStorage:", error);
    }
  }, []);

  // Close user menu and search suggestions when clicking outside
  // Close user menu and search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside user menu
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setShowUserMenu(false);
      }

      // Check if click is outside search
      if (
        showSuggestions &&
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showUserMenu || showSuggestions) {
      // Sử dụng setTimeout để đảm bảo event được đăng ký sau khi click toggle hoàn thành
      const timer = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [showUserMenu, showSuggestions]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          await fetchProducts({
            page: 1,
            limit: 100,
            search: searchQuery,
          });
          setIsSearching(false);
        } catch (error) {
          console.error("Error searching products:", error);
          setIsSearching(false);
        }
      }, 300);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // useEffect riêng để xử lý khi products thay đổi
  useEffect(() => {
    if (searchQuery.trim().length >= 2 && products.length > 0) {
      const filtered = products
        .filter(
          (p) =>
            p.proName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !p.isDeleted,
        )
        .slice(0, 5);
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    }
  }, [products, searchQuery]);

  const handleCategoryMouseEnter = () => {
    if (isMenuPinned) return;
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
    }
    setShowCategoryMenu(true);
  };

  const handleCategoryMouseLeave = () => {
    if (isMenuPinned) return;
    categoryTimeoutRef.current = setTimeout(() => {
      setShowCategoryMenu(false);
    }, 200);
  };

  const handleCategoryClick = () => {
    setShowCategoryMenu(true);
    setIsMenuPinned(true);
  };

  const handlePinChange = (pinned: boolean) => {
    setIsMenuPinned(pinned);
    if (!pinned) {
      setTimeout(() => {
        setShowCategoryMenu(false);
      }, 100);
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleMenuItemClick = () => {
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    setUserAvatar(null);
    setUserName(null);
    setUserRole(null);
    setIsLoggedIn(false);
    setShowUserMenu(false);
    window.location.href = "/auth/login";
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setToast({
        type: "success",
        message: "Bạn cần đăng nhập để xem giỏ hàng",
      });
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim().replace(/\s+/g, "+");
      setShowSuggestions(false);
      router.push(`/product?search=${query}`);
    }
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    setSearchQuery("");
    router.push(`/product/${slug}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const menuItems = [
    { icon: UserCircle, text: "Thông tin cá nhân", link: "/profile" },
    { icon: Package, text: "Đơn hàng của tôi", link: "/profile?tab=orders" },
    { icon: ClipboardList, text: "Đổi mật khẩu", link: "/services" },
    { icon: Heart, text: "Danh sách yêu thích", link: "/loyalty" },
    { icon: MapPin, text: "Sổ địa chỉ nhận hàng", link: "/addresses" },
    { icon: Shield, text: "Thông tin bảo hành", link: "/warranty" },
  ];

  return (
    <>
      <header className="bg-red-700 text-white">
        <div className="container mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between gap-4 py-3 px-4 xl:px-[149px]">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src={Logo}
                alt="Teddy Shop"
                width={1000}
                height={100}
                className="h-20 w-auto"
              />
            </Link>

            {/* Left Group: Category + Search */}
            <div className="flex items-center gap-4 flex-1 max-w-4xl pl-16">
              {/* Category Button */}
              <div
                className="relative flex-shrink-0 pb-8"
                onMouseEnter={handleCategoryMouseEnter}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <button
                  onClick={handleCategoryClick}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-900 hover:bg-[#6A151B] rounded-full text-white font-medium transition-colors whitespace-nowrap"
                >
                  <svg
                    width={21}
                    height={15}
                    viewBox="0 0 21 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.777557 1.19531C0.777557 0.781099 1.11334 0.445312 1.52756 0.445312H19.5276C19.9418 0.445312 20.2776 0.781099 20.2776 1.19531C20.2776 1.60953 19.9418 1.94531 19.5276 1.94531H1.52756C1.11334 1.94531 0.777557 1.60953 0.777557 1.19531Z"
                      fill="white"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.777557 7.69531C0.777557 7.2811 1.11334 6.94531 1.52756 6.94531H15.5276C15.9418 6.94531 16.2776 7.2811 16.2776 7.69531C16.2776 8.10953 15.9418 8.44531 15.5276 8.44531H1.52756C1.11334 8.44531 0.777557 8.10953 0.777557 7.69531Z"
                      fill="white"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.777557 14.1953C0.777557 13.7811 1.11334 13.4453 1.52756 13.4453H19.5276C19.9418 13.4453 20.2776 13.7811 20.2776 14.1953C20.2776 14.6095 19.9418 14.9453 19.5276 14.9453H1.52756C1.11334 14.9453 0.777557 14.6095 0.777557 14.1953Z"
                      fill="white"
                    />
                  </svg>
                  <span>Danh mục</span>
                </button>

                {/* Category Menu */}
                {showCategoryMenu && (
                  <div
                    className="absolute left-0 top-full mt-2 z-50"
                    onMouseEnter={handleCategoryMouseEnter}
                    onMouseLeave={handleCategoryMouseLeave}
                  >
                    <CategoryMenu
                      isPinned={isMenuPinned}
                      onPinChange={handlePinChange}
                    />
                  </div>
                )}
              </div>

              {/* Search Bar with Suggestions */}
              <div className="flex-1" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative flex items-center bg-white rounded-full max-w-[570px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      placeholder="Nhập tên điện thoại, tablet, phụ kiện... cần tìm"
                      className="w-full py-2.5 pl-5 pr-14 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 bg-[#FEE2E2] text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </form>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute mt-2 w-full max-w-[570px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        Đang tìm kiếm...
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <div className="py-2">
                        {searchSuggestions.map((product) => (
                          <button
                            key={product.proId}
                            onClick={() => handleSuggestionClick(product.slug)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={(() => {
                                    const img = product.images?.find((i: any) => i.isCover) || product.images?.[0] || product.mainImage;
                                    const url = typeof img === 'string' ? img : img?.imageUrl;
                                    if (!url) return "https://placehold.co/100x100?text=No+Image";
                                    return url.startsWith('http')
                                      ? url
                                      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${url}`;
                                  })()}
                                  alt={product.proName}
                                  className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.proName}
                              </p>
                            </div>
                          </button>
                        ))}
                        <div className="border-t border-gray-100 px-4 py-2">
                          <button
                            onClick={handleSearchSubmit}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Xem tất cả kết quả cho "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Không tìm thấy sản phẩm phù hợp
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Group: User + Cart */}
            <div className="flex items-center gap-3 flex-shrink-0 pb-8">
              {/* User Button with Avatar and Dropdown */}
              <div className="relative" ref={userMenuRef}>
                {isLoggedIn ? (
                  <button
                    onClick={toggleUserMenu}
                    className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-red-700 transition-all bg-red-900"
                    title={userName || "User"}
                  >
                    {userAvatar ? (
                        <img
                          src={(userAvatar || "").startsWith('http')
                            ? userAvatar
                            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${userAvatar || ""}`
                          }
                          alt={userName || "user"}
                          className="w-full h-full object-cover"
                        />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-red-800 to-red-900 font-semibold text-lg">
                        {getInitials(userName)}
                      </div>
                    )}
                  </button>
                ) : (
                  <Link href="/auth/login">
                    <button
                      className="w-12 h-12 rounded-full bg-red-900 hover:bg-[#6A151B] text-white flex items-center justify-center transition-colors"
                      title="Đăng nhập"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        width="24"
                        fill="currentColor"
                      >
                        <path d="M17.7545 13.9999C18.9966 13.9999 20.0034 15.0068 20.0034 16.2488V17.1673C20.0034 17.7406 19.8242 18.2997 19.4908 18.7662C17.9449 20.9294 15.4206 22.0011 12.0004 22.0011C8.5794 22.0011 6.05643 20.9289 4.51427 18.7646C4.18231 18.2987 4.00391 17.7409 4.00391 17.1688V16.2488C4.00391 15.0068 5.01076 13.9999 6.25278 13.9999H17.7545ZM12.0004 2.00464C14.7618 2.00464 17.0004 4.24321 17.0004 7.00464C17.0004 9.76606 14.7618 12.0046 12.0004 12.0046C9.23894 12.0046 7.00036 9.76606 7.00036 7.00464C7.00036 4.24321 9.23894 2.00464 12.0004 2.00464Z" />
                      </svg>
                    </button>
                  </Link>
                )}

                {/* User Dropdown Menu */}
                {showUserMenu && isLoggedIn && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-red-900 flex items-center justify-center">
                          {userAvatar ? (
                            <img
                                src={(userAvatar || "").startsWith('http')
                                ? userAvatar
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${userAvatar || ""}`
                              }
                              alt={userName || "user"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold text-lg">
                              {getInitials(userName)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {userName || "Người dùng"}
                          </p>
                          <p className="text-sm text-red-100">
                            {userRole === "admin"
                              ? "Quản trị viên"
                              : "Khách hàng"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {menuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={index}
                            href={item.link}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 cursor-pointer"
                            onClick={handleMenuItemClick}
                          >
                            <IconComponent
                              size={20}
                              className="text-gray-600"
                            />
                            <span className="text-sm font-medium">
                              {item.text}
                            </span>
                          </Link>
                        );
                      })}

                      {/* Admin Menu Item */}
                      {userRole === "admin" && (
                        <Link
                          href="/admin"
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 border-t border-gray-100 cursor-pointer"
                          onClick={handleMenuItemClick}
                        >
                          <Settings size={20} className="text-red-600" />
                          <span className="text-sm font-medium text-red-600">
                            Trang quản lý
                          </span>
                        </Link>
                      )}

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 border-t border-gray-100 cursor-pointer"
                      >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Button with Count Badge */}
              <Link
                href="/cart"
                className="flex-shrink-0"
                onClick={handleCartClick}
              >
                <button className="relative flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-900 rounded-full text-white font-medium transition-colors">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="22"
                      width="22"
                      fill="currentColor"
                    >
                      <path d="M2.5 4.25C2.5 3.83579 2.83579 3.5 3.25 3.5H3.80826C4.75873 3.5 5.32782 4.13899 5.65325 4.73299C5.87016 5.12894 6.02708 5.58818 6.14982 6.00395C6.18306 6.00134 6.21674 6 6.2508 6H18.7481C19.5783 6 20.1778 6.79442 19.9502 7.5928L18.1224 14.0019C17.7856 15.1832 16.7062 15.9978 15.4779 15.9978H9.52977C8.29128 15.9978 7.2056 15.1699 6.87783 13.9756L6.11734 11.2045L4.85874 6.95578L4.8567 6.94834C4.701 6.38051 4.55487 5.85005 4.33773 5.4537C4.12686 5.0688 3.95877 5 3.80826 5H3.25C2.83579 5 2.5 4.66421 2.5 4.25ZM9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21ZM16 21C17.1046 21 18 20.1046 18 19C18 17.8954 17.1046 17 16 17C14.8954 17 14 17.8954 14 19C14 20.1046 14.8954 21 16 21Z" />
                    </svg>
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </div>
                  <span>Giỏ hàng</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile & Tablet Header */}
          <div className="lg:hidden">
            {/* Top Bar: Menu Icon + Logo + Cart */}
            <div className="flex items-center justify-between px-4 py-3">
              {/* Left: Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="w-10 h-10 rounded-full bg-red-900 hover:bg-[#6A151B] flex items-center justify-center transition-colors"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Center: Logo */}
              <Link href="/" className="flex-shrink-0">
                <Image
                  src={Logo}
                  alt="FPT Shop"
                  width={100}
                  height={35}
                  className="h-8 w-auto"
                />
              </Link>

              {/* Right: User Avatar + Cart */}
              <div className="flex items-center gap-2">
                {/* User Avatar - Mobile */}
                <div className="relative" ref={userMenuRef}>
                  {isLoggedIn ? (
                    <button
                      onClick={toggleUserMenu}
                      className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-red-700 transition-all bg-red-900 flex items-center justify-center"
                      title={userName || "User"}
                    >
                      {userAvatar ? (
                        <img
                          src={(userAvatar || "").startsWith('http')
                            ? userAvatar
                            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${userAvatar || ""}`
                          }
                          alt={userName || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {getInitials(userName)}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link href="/auth/login">
                      <button
                        className="w-10 h-10 rounded-full bg-red-900 hover:bg-[#6A151B] flex items-center justify-center transition-colors"
                        title="Đăng nhập"
                      >
                        <User size={18} />
                      </button>
                    </Link>
                  )}

                  {/* Mobile User Dropdown */}
                  {showUserMenu && isLoggedIn && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100">
                      <div className="bg-gradient-to-r from-red-600 to-red-700 p-3 text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-red-900 flex items-center justify-center">
                            {userAvatar ? (
                              <img
                                src={(userAvatar || "").startsWith('http')
                                  ? userAvatar
                                  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${userAvatar || ""}`
                                }
                                alt={userName || "user"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold text-sm">
                                {getInitials(userName)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {userName || "Người dùng"}
                            </p>
                            <p className="text-xs text-red-100">
                              {userRole === "admin"
                                ? "Quản trị viên"
                                : "Khách hàng"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        {menuItems.map((item, index) => {
                          const IconComponent = item.icon;
                          return (
                            <Link
                              key={index}
                              href={item.link}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700 cursor-pointer"
                              onClick={handleMenuItemClick}
                            >
                              <IconComponent
                                size={18}
                                className="text-gray-600"
                              />
                              <span className="text-sm">{item.text}</span>
                            </Link>
                          );
                        })}

                        {userRole === "admin" && (
                          <Link
                            href="/admin"
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700 border-t border-gray-100 cursor-pointer"
                            onClick={handleMenuItemClick}
                          >
                            <Settings size={18} className="text-red-600" />
                            <span className="text-sm text-red-600">
                              Trang quản lý
                            </span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 border-t border-gray-100 cursor-pointer"
                        >
                          <LogOut size={18} />
                          <span className="text-sm">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Button - Mobile */}
                <Link href="/cart" onClick={handleCartClick}>
                  <button className="relative w-10 h-10 rounded-full bg-red-900 hover:bg-[#6A151B] flex items-center justify-center transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      width="20"
                      fill="currentColor"
                    >
                      <path d="M2.5 4.25C2.5 3.83579 2.83579 3.5 3.25 3.5H3.80826C4.75873 3.5 5.32782 4.13899 5.65325 4.73299C5.87016 5.12894 6.02708 5.58818 6.14982 6.00395C6.18306 6.00134 6.21674 6 6.2508 6H18.7481C19.5783 6 20.1778 6.79442 19.9502 7.5928L18.1224 14.0019C17.7856 15.1832 16.7062 15.9978 15.4779 15.9978H9.52977C8.29128 15.9978 7.2056 15.1699 6.87783 13.9756L6.11734 11.2045L4.85874 6.95578L4.8567 6.94834C4.701 6.38051 4.55487 5.85005 4.33773 5.4537C4.12686 5.0688 3.95877 5 3.80826 5H3.25C2.83579 5 2.5 4.66421 2.5 4.25ZM9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21ZM16 21C17.1046 21 18 20.1046 18 19C18 17.8954 17.1046 17 16 17C14.8954 17 14 17.8954 14 19C14 20.1046 14.8954 21 16 21Z" />
                    </svg>
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile Search Bar with Suggestions */}
            <div className="px-4 pb-3" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative flex items-center bg-white rounded-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full py-2.5 pl-4 pr-12 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 bg-[#FEE2E2] text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>

              {/* Mobile Search Suggestions */}
              {showSuggestions && (
                <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Đang tìm kiếm...
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <div className="py-2">
                      {searchSuggestions.map((product) => (
                        <button
                          key={product.proId}
                          onClick={() => handleSuggestionClick(product.slug)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={(() => {
                                const img = product.images?.find((i: any) => i.isCover) || product.images?.[0] || product.mainImage;
                                const url = typeof img === 'string' ? img : img?.imageUrl;
                                if (!url) return "https://placehold.co/100x100?text=No+Image";
                                return url.startsWith('http')
                                  ? url
                                  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${url}`;
                              })()}
                              alt={product.proName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.proName}
                            </p>
                            <p className="text-sm text-red-600 font-semibold">
                              {formatPrice(
                                product.baseSalePrice ?? product.price ?? 0,
                              )}
                            </p>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 px-4 py-2">
                        <button
                          onClick={handleSearchSubmit}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Xem tất cả kết quả
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Không tìm thấy sản phẩm
                    </div>
                  )}
                </div>
              )}

              {/* Trending Searches - Mobile */}
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="bg-white text-gray-800 shadow-lg">
                <CategoryMenu />
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </header>
      <Toast toast={toast} />
    </>
  );
}
