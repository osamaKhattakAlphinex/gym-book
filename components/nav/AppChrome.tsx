"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";
import { DesktopTopBar } from "@/components/nav/DesktopTopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

/**
 * Owner chrome — sidebar, top bars, bottom nav.
 *
 * Member-facing routes are deliberately bare. `/pay/<ref>` is opened by a
 * member from a WhatsApp link, and showing them the owner's dashboard
 * navigation would be both confusing and wrong.
 */
const BARE_ROUTES = ["/pay", "/payments/result"];

function matches(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  /*
   * The public marketing site brings its own header and footer, so it gets no
   * wrapper at all here — wrapping it in <main> would nest the site header
   * inside the page's main landmark.
   */
  if (pathname === "/" || matches(pathname, MARKETING_ROUTES)) {
    return <>{children}</>;
  }

  if (matches(pathname, BARE_ROUTES)) {
    return <main className="min-h-dvh">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="md:pl-64">
        <TopBar />
        <DesktopTopBar />
        <main className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-6xl pb-24 md:pb-10">{children}</main>
      </div>
      <BottomNav />
    </>
  );
}
