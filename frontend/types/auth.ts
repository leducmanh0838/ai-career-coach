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
