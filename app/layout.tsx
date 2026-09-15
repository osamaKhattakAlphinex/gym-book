import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "./globals.css";
import { GymStoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/Toast";
import { AppChrome } from "@/components/nav/AppChrome";

export const metadata: Metadata = {
  title: {
    default: "Iron Peak Fitness | Strength, Conditioning & Community",
    template: "%s | Iron Peak Fitness",
  },
  description:
    "Iron Peak Fitness — strength training, HIIT, boxing and mobility coaching with expert trainers. Flexible memberships, open early to late, seven days a week.",
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
