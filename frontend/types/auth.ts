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

import { z } from "zod";

// 1. Định nghĩa Zod Schema cho dữ liệu thô từ Backend (snake_case)
export const backendUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.string().optional().default("Học viên"),
  avatar_url: z.string().optional().default(""),
});

// 2. Transform sang chuẩn camelCase cho Frontend sử dụng
export const userSchema = backendUserSchema.transform((data) => ({
  id: data.id,
  email: data.email,
  firstName: data.first_name,
  lastName: data.last_name,
  name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email,
  role: data.role || "Học viên",
  avatarUrl: data.avatar_url || "",
}));

// Kiểu dữ liệu TypeScript suy ra từ Zod Schema
export type BackendUser = z.input<typeof backendUserSchema>;
export type User = z.infer<typeof userSchema>;
