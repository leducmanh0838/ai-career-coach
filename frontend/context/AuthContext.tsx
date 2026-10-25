'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, userSchema } from "@/types/auth";
export type { User };

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
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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