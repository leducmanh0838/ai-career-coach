/**
 * Copyright (c) 2026 AURA FARMING 20 PRO MAX
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  History, 
  FileText, 
  LogOut, 
  ChevronDown,
  LogIn
} from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { useAuth } from "@/context/AuthContext";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface HeaderProps {
  navItems?: NavItem[];
  className?: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Tin tuyển dụng", href: "/job-postings" },
];

const PROFILE_MENU_ITEMS = [
  { label: "Hồ sơ cá nhân", href: "/profile", icon: User },
  { label: "Lịch sử phân tích", href: "/history", icon: History },
  { label: "Tài liệu kỹ thuật", href: "/docs", icon: FileText },
];

/** Robot Mascot SVG Logo */
export function RobotLogoIcon({ className = "w-8 h-8 sm:w-9 sm:h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <line x1="24" y1="4" x2="24" y2="9" stroke="#3346f0" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="3.5" r="2.5" fill="#00d8f6" />
      <rect x="7" y="16" width="3.5" height="9" rx="1.75" fill="#3346f0" />
      <rect x="37.5" y="16" width="3.5" height="9" rx="1.75" fill="#3346f0" />
      <rect x="9.5" y="9" width="29" height="22" rx="7" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
      <rect x="13" y="12.5" width="22" height="15" rx="4.5" fill="#0f172a" />
      <path d="M16.5 18.5C17.3 17 18.7 17 19.5 18.5" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
      <path d="M28.5 18.5C29.3 17 30.7 17 31.5 18.5" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 23C23 24 25 24 26 23" stroke="#00e5ff" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="21.5" y="31" width="5" height="2.5" rx="1.2" fill="#64748b" />
      <path d="M14 34.5C14 33.5 15 33 16.5 33H31.5C33 33 34 33.5 34 34.5L34.5 42C34.5 43.5 33 44 31.5 44H16.5C15 44 13.5 43.5 13.5 42L14 34.5Z" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
      <rect x="20" y="35.5" width="8" height="5" rx="2" fill="#3346f0" />
      <line x1="22.5" y1="38" x2="25.5" y2="38" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.5 35.5L10 38C9.2 38.6 9.2 39.8 10 40.4L13.5 42" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="#ffffff" />
      <path d="M34.5 35.5L38 35C38.8 35 39.5 35.8 39.2 36.6L38.2 38.5H40.5C41.3 38.5 41.8 39.3 41.4 40.1L39.8 42.5C39.4 43.3 38.5 43.8 37.5 43.8H34.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M39 35C39 33.5 39.8 32.5 40.5 32.5C41.2 32.5 41.5 33.5 41.5 35L40.5 37" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="17" y="44" width="5.5" height="2" rx="1" fill="#1e293b" />
      <rect x="25.5" y="44" width="5.5" height="2" rx="1" fill="#1e293b" />
    </svg>
  );
}

export function Header({
  navItems = DEFAULT_NAV_ITEMS,
  className = "",
}: HeaderProps) {
  const pathname = usePathname() || "/";
  const { user, logout, isLoading } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside & Escape key listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileMenuOpen(false);
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !(target as HTMLElement).closest("#mobile-menu-toggle-btn")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Ghép họ và tên từ dữ liệu AuthContext
  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "Tên";

  // Reusable User Info Box
  const renderUserCard = () => (
    <div className="flex items-center gap-3 p-2.5 rounded-md bg-surface-2 mb-3">
      <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-border shadow-2xs shrink-0 bg-surface">
        <SafeImage 
          src={user?.avatarUrl} 
          fallback="/default-avatar.png" 
          alt={fullName} 
          width={36} 
          height={36} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{fullName}</p>
        <p className="text-xs text-muted truncate">{user?.email || user?.role || "Học viên"}</p>
      </div>
    </div>
  );

  return (
    <header className={`sticky top-0 z-50 w-full px-3 py-2.5 sm:px-6 sm:py-3.5 transition-all duration-200 ${className}`}>
      <div className={`mx-auto max-w-5xl w-full rounded-full bg-surface-2 px-3.5 py-1.5 sm:px-6 sm:py-2 flex items-center justify-between border border-border transition-all duration-200 ${isScrolled ? "shadow-md border-border/90" : "shadow-xs"}`}>
        
        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group select-none shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="AI Career Coach - Trang chủ">
          <div className="transition-transform duration-200 group-hover:scale-105 shrink-0">
            <RobotLogoIcon className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <span className="text-sm sm:text-base font-semibold tracking-tight text-text group-hover:text-primary transition-colors whitespace-nowrap">
            AI Career Coach
          </span>
        </Link>

        {/* CENTER: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-10 shrink-0" aria-label="Thanh điều hướng chính">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 text-sm lg:text-[15px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm ${isActive ? "text-primary font-semibold" : "text-text hover:text-primary"}`}
              >
                {item.label}
                {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Auth & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {isLoading ? (
            <div className="w-24 h-9 bg-surface/50 rounded-full animate-pulse" />
          ) : user ? (
            /* --- ĐÃ ĐĂNG NHẬP --- */
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                id="user-profile-menu-button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2.5 py-0.5 sm:py-1 rounded-full hover:bg-surface/60 active:bg-surface transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-1 ring-border shadow-2xs shrink-0 bg-surface">
                  <SafeImage 
                    src={user.avatarUrl} 
                    fallback="/default-avatar.png" 
                    alt={fullName} 
                    width={36} 
                    height={36} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="text-sm sm:text-base font-medium text-text max-w-[70px] sm:max-w-[110px] truncate hidden xs:inline-block">
                  {fullName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 hidden sm:block ${isProfileMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              {/* Desktop Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-surface p-1.5 shadow-lg border border-border z-50">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-semibold text-text truncate">{fullName}</p>
                    <p className="text-xs text-muted truncate">{user.email || user.role || "Học viên"}</p>
                  </div>
                  {PROFILE_MENU_ITEMS.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:text-primary hover:bg-surface-2 rounded-sm transition-colors"
                    >
                      <Icon className="w-4 h-4 text-muted" />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-border my-1" />
                  <button
                    type="button"
                    onClick={() => { setIsProfileMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-sm transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* --- CHƯA ĐĂNG NHẬP --- */
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-surface/70 hover:bg-surface text-text active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
          >
            <div className="relative w-4 h-4 flex flex-col justify-center items-center">
              <span className={`block h-0.5 w-4 bg-text rounded-full transition-transform duration-200 ${isMobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"}`} />
              <span className={`block h-0.5 w-4 bg-text rounded-full transition-opacity duration-200 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`block h-0.5 w-4 bg-text rounded-full transition-transform duration-200 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-xs z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
          <div ref={mobileMenuRef} className="relative z-50 mx-auto mt-2 max-w-sm w-full rounded-lg bg-surface p-4 shadow-xl border border-border md:hidden">
            {user ? (
              <>
                {renderUserCard()}
                <nav className="flex flex-col gap-1" aria-label="Menu di động">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${isActive ? "bg-primary text-on-primary font-semibold shadow-xs" : "text-text hover:bg-surface-2"}`}
                      >
                        <span>{item.label}</span>
                        {isActive ? <span className="w-1.5 h-1.5 rounded-full bg-white" /> : <ChevronDown className="w-4 h-4 text-muted -rotate-90" />}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-border my-2.5" />

                <div className="flex flex-col gap-1">
                  {PROFILE_MENU_ITEMS.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs text-text hover:bg-surface-2 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-muted" />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 py-2 text-center">
                <p className="text-sm text-muted">Bạn chưa đăng nhập vào hệ thống.</p>
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md shadow-xs transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}

export default Header;