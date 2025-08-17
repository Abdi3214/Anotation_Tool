import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../app/components/ThemeProvider";
import { UserProvider } from "../context/UserContext";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
