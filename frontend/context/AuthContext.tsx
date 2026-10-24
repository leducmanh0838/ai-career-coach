'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { z } from 'zod';

// 1. Định nghĩa Zod Schema cho dữ liệu thô từ Backend (snake_case)
const backendUserSchema = z.object({
    id: z.number(),
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    role: z.string(),
    avatar_url: z.string(),
});

// 2. Transform sang chuẩn camelCase cho Frontend sử dụng
const userSchema = backendUserSchema.transform((data) => ({
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role,
    avatarUrl: data.avatar_url,
}));

// Kiểu dữ liệu TypeScript suy ra từ Zod Schema
export type User = z.infer<typeof userSchema>;

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                const response = await fetch(`${apiUrl}/api/auth/refresh/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                const data: any = await response.json();

                if (response.ok && data.user) {
                    console.info("Load user: ", JSON.stringify(data.user));
                    // Validate và tự động transform sang camelCase bằng Zod
                    const parsedUser = userSchema.parse(data.user);
                    setUser(parsedUser);
                    localStorage.setItem('user', JSON.stringify(parsedUser));
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error("Lỗi xác thực phiên đăng nhập hoặc dữ liệu không khớp:", error);
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được dùng bên trong AuthProvider');
    }
    return context;
};