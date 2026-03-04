import { DashboardLayout } from "@/components/admin/DashboardLayout";
import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* div này sẽ thay thế <body> để giữ class fonts + antialiased */}
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </div>
    </ThemeProvider>
  );
}
