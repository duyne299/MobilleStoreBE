"use client";

import * as React from "react";
import {
  Home,
  Package,
  Tag,
  Award,
  ShoppingCart,
  Warehouse,
  FileText,
  Image,
  MessageSquare,
  Store,
  Users,
  TicketPercent,
  Settings,
  X,
  Menu,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const navigation = [
  { name: "Trang chủ", href: "/admin", icon: Home },
  { name: "Sản phẩm", href: "/admin/products", icon: Package },
  { name: "Danh mục", href: "/admin/categories", icon: Tag },
  { name: "Thương hiệu", href: "/admin/brands", icon: Award },
  { name: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { name: "Kho", href: "/admin/warehouses", icon: Warehouse },
  { name: "Bài viết", href: "/admin/posts", icon: FileText },
  { name: "Banner", href: "/admin/banners", icon: Image },
  { name: "Tin nhắn", href: "/admin/messages", icon: MessageSquare },
  { name: "Cửa hàng", href: "/admin/stores", icon: Store },
  { name: "Tài khoản", href: "/admin/users", icon: Users },
  { name: "Mã giảm giá", href: "/admin/discounts", icon: TicketPercent },
  { name: "Cài đặt", href: "/admin/settings", icon: Settings },
];

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-card shadow-lg transform transition-all duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          } ${isCollapsed ? "w-16" : "w-64"
          } md:translate-x-0 md:static md:inset-0`}
      >
        {/* Header với title và collapse button */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-100 dark:bg-muted/50 flex-shrink-0">
          {!isCollapsed && (
            <Link
              href="/"
              className="text-xl font-bold text-card-foreground transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            suppressHydrationWarning
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            suppressHydrationWarning
            onClick={onClose}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin" // chỉ highlight đúng /admin
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-300 ease-in-out ${
                      isActive
                        ? "bg-gray-300 dark:bg-muted/90 text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/70 hover:text-foreground"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <>
                      <item.icon
                        className={`h-5 w-5 ${
                          isCollapsed ? "mx-auto" : "mr-3"
                        } transition-colors`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                      {isCollapsed && isActive && (
                        <div className="absolute left-12 bg-card border border-border rounded-md px-2 py-1 text-xs font-medium text-card-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {item.name}
                        </div>
                      )}
                    </>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
