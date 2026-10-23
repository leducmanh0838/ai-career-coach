"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface UserProfile {
  name?: string;
  avatarUrl?: string;
  email?: string;
  role?: string;
}

export interface HeaderProps {
  navItems?: NavItem[];
  user?: UserProfile;
  className?: string;
  onLogout?: () => void;
}

// Default navigation items matching design
const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Phân tích AI", href: "/analysis" },
  { label: "Lịch sử phân tích", href: "/history" },
];

/**
 * Robot Mascot SVG Icon matching the design image:
 * Friendly smiling blue/cyan robot with visor, chest plate, and thumbs-up gesture
 */
export function RobotLogoIcon({ className = "w-8 h-8 sm:w-9 sm:h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top Antenna */}
      <line x1="24" y1="4" x2="24" y2="9" stroke="#3346f0" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="3.5" r="2.5" fill="#00d8f6" />

      {/* Side Ears / Head Modules */}
      <rect x="7" y="16" width="3.5" height="9" rx="1.75" fill="#3346f0" />
      <rect x="37.5" y="16" width="3.5" height="9" rx="1.75" fill="#3346f0" />

      {/* Robot Head Helmet */}
      <rect
        x="9.5"
        y="9"
        width="29"
        height="22"
        rx="7"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="1.8"
      />

      {/* Visor Screen */}
      <rect
        x="13"
        y="12.5"
        width="22"
        height="15"
        rx="4.5"
        fill="#0f172a"
      />

      {/* Glowing Cyan Smiling Eyes */}
      <path
        d="M16.5 18.5C17.3 17 18.7 17 19.5 18.5"
        stroke="#00e5ff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28.5 18.5C29.3 17 30.7 17 31.5 18.5"
        stroke="#00e5ff"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Screen Smile */}
      <path
        d="M22 23C23 24 25 24 26 23"
        stroke="#00e5ff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Neck */}
      <rect x="21.5" y="31" width="5" height="2.5" rx="1.2" fill="#64748b" />

      {/* Robot Torso */}
      <path
        d="M14 34.5C14 33.5 15 33 16.5 33H31.5C33 33 34 33.5 34 34.5L34.5 42C34.5 43.5 33 44 31.5 44H16.5C15 44 13.5 43.5 13.5 42L14 34.5Z"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="1.8"
      />

      {/* Chest Light / Badge */}
      <rect x="20" y="35.5" width="8" height="5" rx="2" fill="#3346f0" />
      <line x1="22.5" y1="38" x2="25.5" y2="38" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" />

      {/* Left Arm (resting down) */}
      <path
        d="M13.5 35.5L10 38C9.2 38.6 9.2 39.8 10 40.4L13.5 42"
        stroke="#1e293b"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="#ffffff"
      />

      {/* Right Arm (thumbs-up gesture) */}
      <path
        d="M34.5 35.5L38 35C38.8 35 39.5 35.8 39.2 36.6L38.2 38.5H40.5C41.3 38.5 41.8 39.3 41.4 40.1L39.8 42.5C39.4 43.3 38.5 43.8 37.5 43.8H34.5"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Thumb Pointing Up */}
      <path
        d="M39 35C39 33.5 39.8 32.5 40.5 32.5C41.2 32.5 41.5 33.5 41.5 35L40.5 37"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Feet */}
      <rect x="17" y="44" width="5.5" height="2" rx="1" fill="#1e293b" />
      <rect x="25.5" y="44" width="5.5" height="2" rx="1" fill="#1e293b" />
    </svg>
  );
}

/**
 * Illustrated User Avatar SVG matching the design:
 * Circular portrait of a young man with brown hair, friendly smile, and green/teal collar
 */
export function UserAvatarIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Warm beige / cream circle background */}
      <circle cx="20" cy="20" r="20" fill="#fef3c7" />

      {/* Teal / Green Shirt */}
      <path
        d="M8 40C8 33 13.5 29.5 20 29.5C26.5 29.5 32 33 32 40H8Z"
        fill="#0d9488"
      />

      {/* Collar Opening Shadow */}
      <path
        d="M17 29.5C17 31.5 20 32.8 20 32.8C20 32.8 23 31.5 23 29.5"
        fill="#f6ad55"
        opacity="0.3"
      />

      {/* Neck */}
      <rect x="17.5" y="23" width="5" height="7.5" rx="2" fill="#f6ad55" />

      {/* Face & Head */}
      <ellipse cx="20" cy="19.5" rx="6.5" ry="7.2" fill="#fbd38d" />

      {/* Ears */}
      <circle cx="13.2" cy="19.5" r="1.5" fill="#fbd38d" />
      <circle cx="26.8" cy="19.5" r="1.5" fill="#fbd38d" />

      {/* Brown Hair */}
      <path
        d="M13 17.5C13 12.5 15.5 10.5 20 10.5C24.5 10.5 27 12.5 27 17.5C27 15.5 25 13.8 22 13.8C19 13.8 17 14.8 15 15.8C13.8 16.3 13.2 16.8 13 17.5Z"
        fill="#7b341e"
      />
      <path
        d="M14 15.8C15 13 17.5 11.5 20 11.5C23 11.5 25.5 13 26 15.2C25 14 22.8 13.2 20 13.2C17.2 13.2 15.2 14.2 14 15.8Z"
        fill="#5c2513"
      />

      {/* Eyebrows */}
      <path
        d="M16 16.8C16.8 16.3 18.2 16.3 19 16.8"
        stroke="#5c2513"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M21 16.8C21.8 16.3 23.2 16.3 24 16.8"
        stroke="#5c2513"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx="17.5" cy="19" r="1" fill="#1e293b" />
      <circle cx="22.5" cy="19" r="1" fill="#1e293b" />

      {/* Gentle Smiling Mouth */}
      <path
        d="M18.5 22.8C19.2 23.6 20.8 23.6 21.5 22.8"
        stroke="#c05621"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Subtle Rosy Cheeks */}
      <circle cx="15.5" cy="21.2" r="1" fill="#f6ad55" opacity="0.6" />
      <circle cx="24.5" cy="21.2" r="1" fill="#f6ad55" opacity="0.6" />
    </svg>
  );
}

/**
 * Responsive Header Component following Tailwind v4 design tokens:
 * - Floating pill capsule bar matching the design
 * - Theme tokens: bg-surface-2, text-text, text-muted, bg-primary, border-border
 * - Adaptive layout across Mobile, Tablet, and Desktop
 */
export function Header({
  navItems = DEFAULT_NAV_ITEMS,
  user = { name: "Tên", role: "Học viên" },
  className = "",
  onLogout,
}: HeaderProps) {
  const pathname = usePathname() || "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle elevation enhancement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !(event.target as HTMLElement).closest("#mobile-menu-toggle-btn")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full px-3 py-2.5 sm:px-6 sm:py-3.5 transition-all duration-200 ${className}`}
    >
      {/* Floating Pill Capsule Container */}
      <div
        className={`mx-auto max-w-5xl w-full rounded-full bg-surface-2 px-3.5 py-1.5 sm:px-6 sm:py-2 flex items-center justify-between border border-border transition-all duration-200 ${
          isScrolled ? "shadow-md border-border/90" : "shadow-xs"
        }`}
      >
        {/* LEFT: Logo & Brand Name */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 group select-none shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="AI Career Coach - Trang chủ"
        >
          <div className="transition-transform duration-200 group-hover:scale-105 shrink-0">
            <RobotLogoIcon className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <span className="text-sm sm:text-base font-semibold tracking-tight text-text group-hover:text-primary transition-colors whitespace-nowrap">
            AI Career Coach
          </span>
        </Link>

        {/* CENTER: Navigation Links (Tablet & Desktop >= 768px) */}
        <nav
          className="hidden md:flex items-center gap-6 lg:gap-10 shrink-0"
          aria-label="Thanh điều hướng chính"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 text-sm lg:text-[15px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-text hover:text-primary"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: User Profile & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* User Profile Container */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              id="user-profile-menu-button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2.5 py-0.5 sm:py-1 rounded-full hover:bg-surface/60 active:bg-surface transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            >
              {/* Circular Avatar */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-1 ring-border shadow-2xs shrink-0 bg-surface">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserAvatarIllustration />
                )}
              </div>

              {/* User Name */}
              <span className="text-sm sm:text-base font-medium text-text max-w-[70px] sm:max-w-[110px] truncate hidden xs:inline-block">
                {user.name || "Tên"}
              </span>

              {/* Subtle chevron */}
              <svg
                className={`w-3.5 h-3.5 text-muted transition-transform duration-200 hidden sm:block ${
                  isProfileMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Desktop User Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-md bg-surface p-1.5 shadow-lg border border-border z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-profile-menu-button"
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-semibold text-text truncate">
                    {user.name || "Tên người dùng"}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {user.email || user.role || "Học viên"}
                  </p>
                </div>

                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:text-primary hover:bg-surface-2 rounded-sm transition-colors"
                >
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Hồ sơ cá nhân
                </Link>

                <Link
                  href="/history"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:text-primary hover:bg-surface-2 rounded-sm transition-colors"
                >
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lịch sử phân tích
                </Link>

                <Link
                  href="/docs"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:text-primary hover:bg-surface-2 rounded-sm transition-colors"
                >
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Tài liệu kỹ thuật
                </Link>

                <div className="border-t border-border my-1" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-sm transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON (Hidden on Desktop >= 768px) */}
          <button
            type="button"
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-surface/70 hover:bg-surface text-text active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
          >
            <span className="sr-only">Toggle Navigation</span>
            <div className="relative w-4 h-4 flex flex-col justify-center items-center">
              <span
                className={`block h-0.5 w-4 bg-text rounded-full transition-transform duration-200 ease-in-out ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
                }`}
              />
              <span
                className={`block h-0.5 w-4 bg-text rounded-full transition-opacity duration-200 ease-in-out ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-4 bg-text rounded-full transition-transform duration-200 ease-in-out ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU DRAWER / MODAL */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu Panel */}
          <div
            ref={mobileMenuRef}
            className="relative z-50 mx-auto mt-2 max-w-sm w-full rounded-lg bg-surface p-4 shadow-xl border border-border md:hidden"
          >
            {/* User Profile Banner in Mobile Menu */}
            <div className="flex items-center gap-3 p-2.5 rounded-md bg-surface-2 mb-3">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-border shadow-2xs shrink-0 bg-surface">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserAvatarIllustration />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">
                  {user.name || "Tên người dùng"}
                </p>
                <p className="text-xs text-muted truncate">
                  {user.email || user.role || "Học viên"}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1" aria-label="Menu di động">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-on-primary font-semibold shadow-xs"
                        : "text-text hover:bg-surface-2 active:bg-surface-2"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    ) : (
                      <svg
                        className="w-4 h-4 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border my-2.5" />

            {/* Quick Actions */}
            <div className="flex flex-col gap-1">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs text-text hover:bg-surface-2 transition-colors"
              >
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Hồ sơ cá nhân</span>
              </Link>

              <Link
                href="/docs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs text-text hover:bg-surface-2 transition-colors"
              >
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Tài liệu nội bộ (/docs)</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;
