import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./admin/lib/auth-context";
import "./globals.css";
import { AppContextProvider } from "./context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Organic Diet",
  description: "Organic Diet App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppContextProvider>
          <AuthProvider>
            {/* Global container */}

              {children}
       
          </AuthProvider>
        </AppContextProvider>
      </body>
    </html>
  );
}

