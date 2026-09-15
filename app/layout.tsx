import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./globals.css";
import { GymStoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/Toast";
import { AppChrome } from "@/components/nav/AppChrome";

export const metadata: Metadata = {
  title: {
    default: "Iron Peak Fitness | Membership Dashboard",
    template: "%s | Iron Peak Fitness",
  },
  description: "Gym membership and subscription management dashboard — track active members, renewals, payments and expiring memberships.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0c",
};

export default function GymRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="gym-app">
        <GymStoreProvider>
          <ToastProvider>
            <AppChrome>{children}</AppChrome>
          </ToastProvider>
        </GymStoreProvider>
      </body>
    </html>
  );
}
