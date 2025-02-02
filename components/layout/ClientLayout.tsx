"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import React from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return pathname === "/auth" ? (
    children
  ) : (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 pt-8 relative z-10">
          {children}
        </main>
      </div>
    </>
  );
}
