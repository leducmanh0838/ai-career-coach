import type { Metadata } from "next";
import "./globals.css";
import Header from "./component/layout/header";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "AI Career Coach",
  description: "Nền tảng định hướng sự nghiệp và phân tích kỹ năng với AI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  console.info("googleClientId: ", googleClientId)
  return (
    <html lang="vi">
      <body className="min-h-screen bg-bg text-text antialiased">
        <AuthProvider>
          <GoogleOAuthProvider clientId={googleClientId}>
            <Header />
            {children}
          </GoogleOAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

