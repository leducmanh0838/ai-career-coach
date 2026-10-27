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

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { z } from 'zod';
import { useRouter } from 'next/navigation';

const backendUserSchema = z.object({
    id: z.number(),
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    role: z.string(),
    avatar_url: z.string().nullable().optional(),
});

const userSchema = backendUserSchema.transform((data) => ({
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role,
    avatarUrl: data.avatar_url ?? null,
}));

export type User = z.infer<typeof userSchema>;

interface AuthContextType {
    user: User | null;
    setUser: (user: any | null) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    // Hàm setUser được bọc logic tự động parse/transform dữ liệu
    const setUser = (incomingUser: any | null) => {
        if (!incomingUser) {
            setUserState(null);
            localStorage.removeItem('user');
            return;
        }
        try {
            // Tự động chuyển đổi snake_case từ backend sang camelCase cho frontend
            const parsedUser = userSchema.parse(incomingUser);
            setUserState(parsedUser);
            localStorage.setItem('user', JSON.stringify(parsedUser));
        } catch (error) {
            console.error("Lỗi parse dữ liệu user:", error);
            setUserState(null);
            localStorage.removeItem('user');
        }
    };

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
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Lỗi xác thực token:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const logout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            await fetch(`${apiUrl}/api/auth/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
        } catch (error) {
            console.error("Lỗi khi gọi API đăng xuất:", error);
        } finally {
            setUser(null);
            router.push('/login');
        }
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