import type { Metadata } from "next";
import "./globals.css";
import Header from "./component/layout/header";

export const metadata: Metadata = {
  title: "AI Career Coach",
  description: "Nền tảng định hướng sự nghiệp và phân tích kỹ năng với AI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-bg text-text antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}

