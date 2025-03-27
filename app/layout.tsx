import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'antd/dist/reset.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "瑞金医院仿真推演系统",
  description: "瑞金医院仿真推演系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
