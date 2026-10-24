"use client";

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hàm xử lý khi Google trả về token thành công
  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error('Không nhận được token từ Google.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ id_token: idToken }),
      });

      const data: any = await response.json();
      if (!response.ok) throw new Error(data.error || 'Đăng nhập thất bại.');

      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã có lỗi xảy ra trong quá trình đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8 shadow-sm">

        {/* Header / Logo Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-soft text-primary rounded-lg mb-4 text-2xl font-bold">
            AI
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">AI Career Coach</h1>
          <p className="text-sm text-muted">
            Trợ lý định hướng nghề nghiệp và luyện phỏng vấn thông minh
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-sm">
            {errorMessage}
          </div>
        )}

        {/* Trạng thái đang gọi API backend */}
        {isLoading && (
          <div className="mb-6 p-3 bg-primary-soft border border-border text-primary text-sm rounded-sm text-center font-medium animate-pulse">
            Đang đồng bộ tài khoản với hệ thống...
          </div>
        )}

        {/* Khung chứa nút đăng nhập Google */}
        <div className="space-y-4">
          <div className="text-center text-sm text-muted mb-4">
            Đăng nhập nhanh chóng và an toàn với Google
          </div>

          {/* Component GoogleLogin chính hãng */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrorMessage('Đăng nhập Google thất bại. Vui lòng thử lại.');
              }}
              theme="outline"
              size="large"
              width="100%"
              shape="rectangular"
            />
          </div>
        </div>

        {/* Footer nhỏ */}
        <div className="mt-8 text-center text-xs text-muted">
          Bằng việc đăng nhập, bạn đồng ý với các điều khoản sử dụng và chính sách bảo mật của AI Career Coach.
        </div>

      </div>
    </main>
  );
}