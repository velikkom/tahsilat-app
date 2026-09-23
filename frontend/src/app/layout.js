import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { ThemeProvider } from "@/context/ThemeContext";
import { THEME_BOOTSTRAP_SCRIPT } from "@/utils/theme";

import "@/styles/globals.css";
import "@/styles/layout.css";
import "@/styles/shared-ui.css";
import "@/styles/datatable.css";
import "@/styles/customers.css";
import "@/styles/customer-collections.css";
import "@/styles/collections.css";
import "@/styles/dashboard.css";
import "@/styles/responsive.css";
import "@/styles/users.css";
import "@/styles/trip-print.css";

import "bootstrap/dist/css/bootstrap.min.css";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import "@/styles/theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",

  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",

  subsets: ["latin"],
});

export const metadata = {
  title: "Tahsilat ERP",

  description: "Tahsilat ERP System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`
                ${geistSans.variable}
                ${geistMono.variable}
            `}
    >
      <body suppressHydrationWarning>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {THEME_BOOTSTRAP_SCRIPT}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
