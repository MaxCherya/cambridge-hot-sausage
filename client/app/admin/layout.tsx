import type { Metadata } from "next";
import { Rye } from "next/font/google";
import "../globals.css";

const rye = Rye({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-rye",
});

export const metadata: Metadata = {
  title: { default: "Admin · CHS", template: "%s · Admin · CHS" },
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={rye.variable}>
      <body className="min-h-dvh bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
