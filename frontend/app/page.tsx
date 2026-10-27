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

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="h-[calc(100vh-80px)] min-h-[650px] bg-bg p-3 md:p-6 flex items-center justify-center overflow-hidden">
      
      {/* Khung bao chính: Thu gọn nhẹ từ 7xl xuống 1150px để các thành phần gần nhau hơn, hết bị trống */}
      <div className="relative w-full max-w-[1150px] rounded-[32px] bg-gradient-to-br from-[#93e6ff] via-[#b8caff] to-[#e3b8ff] pt-8 pb-8 px-6 md:px-12 shadow-2xl shadow-blue-900/10 border border-white/60 backdrop-blur-sm flex flex-col justify-between h-full max-h-[850px]">
        
        {/* 1. HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center my-auto">
          
          {/* Cột trái: Tiêu đề & Các nút bấm */}
          <div className="flex flex-col items-start gap-6 z-10">
            <h1 className="text-4xl md:text-[54px] font-black text-slate-900 tracking-tight leading-[1.15] uppercase">
              Định hướng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 drop-shadow-sm">
                sự nghiệp thông minh
              </span>
            </h1>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/analysis"
                className="group px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
              >
                Bắt đầu phân tích
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">✨</span>
              </Link>
              
              <Link
                href="/profile"
                className="px-8 py-4 rounded-full bg-white/80 backdrop-blur-md text-slate-800 font-bold text-sm tracking-widest uppercase hover:bg-white hover:scale-105 hover:shadow-md transition-all duration-300 border border-slate-200/80"
              >
                Tạo hồ sơ
              </Link>
            </div>
          </div>

          {/* Cột phải: Hình minh họa MỚI (Đã phóng to lên max-w-500px để lấp đầy khoảng trống) */}
          <div className="flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-[480px]">
              <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xl hover:scale-[1.02] transition-transform duration-500">
                {/* Vòng sáng nền mờ tạo cảm giác không gian sâu */}
                <circle cx="250" cy="200" r="160" fill="#FFFFFF" fillOpacity="0.25" filter="blur(15px)" />
                
                {/* Khung Giao diện AI Phân tích chính */}
                <rect x="40" y="50" width="420" height="300" rx="24" fill="#FFFFFF" fillOpacity="0.85" stroke="#FFFFFF" strokeWidth="4" />
                
                {/* Header thanh công cụ xanh */}
                <path d="M40 74 C40 60.7 50.7 50 64 50 L436 50 C449.3 50 460 60.7 460 74 L460 110 L40 110 L40 74 Z" fill="#3346F0" />
                <circle cx="65" cy="80" r="6" fill="#FF5F56" />
                <circle cx="85" cy="80" r="6" fill="#FFBD2E" />
                <circle cx="105" cy="80" r="6" fill="#27C93F" />
                <text x="250" y="86" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" textAnchor="middle">AI CAREER MATCHING</text>

                {/* Khu vực phân tích Hồ sơ (Avatar) */}
                <circle cx="125" cy="185" r="50" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="4" />
                <text x="125" y="202" fill="#3346F0" fontSize="45" textAnchor="middle">👤</text>
                
                <rect x="85" y="255" width="80" height="12" rx="6" fill="#CBD5E1" />
                <rect x="100" y="275" width="50" height="8" rx="4" fill="#94A3B8" />

                {/* Các đường tia quét AI connecting sang công việc */}
                <path d="M 185 185 C 225 185, 245 145, 285 145" stroke="#3346F0" strokeWidth="4" strokeDasharray="6 6" fill="none" />
                <path d="M 185 185 C 225 185, 245 225, 285 225" stroke="#06B6D4" strokeWidth="4" strokeDasharray="6 6" fill="none" />
                
                {/* Công việc phù hợp 1 (Top) */}
                <rect x="285" y="115" width="145" height="55" rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
                <rect x="300" y="132" width="22" height="22" rx="6" fill="#3346F0" />
                <rect x="335" y="135" width="70" height="6" rx="3" fill="#3346F0" />
                <rect x="335" y="150" width="45" height="5" rx="2.5" fill="#94A3B8" />
                {/* Dấu check xanh */}
                <circle cx="430" cy="142" r="12" fill="#10B981" />
                <path d="M425 142 L429 146 L435 138" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Công việc phù hợp 2 (Bottom) */}
                <rect x="285" y="200" width="145" height="55" rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
                <rect x="300" y="217" width="22" height="22" rx="6" fill="#06B6D4" />
                <rect x="335" y="220" width="60" height="6" rx="3" fill="#06B6D4" />
                <rect x="335" y="235" width="80" height="5" rx="2.5" fill="#94A3B8" />

                {/* Nhãn "Độ phù hợp 98%" (Match Score nổi bật) */}
                <rect x="180" y="280" width="140" height="48" rx="24" fill="#10B981" filter="drop-shadow(0 8px 12px rgba(16,185,129,0.3))" />
                <text x="250" y="310" fill="#FFFFFF" fontSize="17" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">✨ 98% MATCH</text>
              </svg>
            </div>
          </div>
        </div>

        {/* 2. CÁC THẺ TÍNH NĂNG BÊN ĐƯỚI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 z-10">
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] gap-4 text-center cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
              🚀
            </div>
            <span className="font-extrabold text-slate-800 uppercase tracking-wide text-xs md:text-sm group-hover:text-blue-600 transition-colors">
              Khám phá năng lực
            </span>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] gap-4 text-center cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
              💡
            </div>
            <span className="font-extrabold text-slate-800 uppercase tracking-wide text-xs md:text-sm group-hover:text-amber-600 transition-colors">
              Gợi ý lộ trình AI
            </span>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] gap-4 text-center cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
              🧩
            </div>
            <span className="font-extrabold text-slate-800 uppercase tracking-wide text-xs md:text-sm group-hover:text-rose-600 transition-colors">
              Hoàn thiện hồ sơ
            </span>
          </div>

        </div>

      </div>
    </main>
  );
}