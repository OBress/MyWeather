"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatInput from "@/components/ChatInput";

const handleChatSubmit = (input: string) => {
  console.log("Chat input:", input);
};

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
      <div className="flex flex-col min-h-screen pt-16">
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          {children}
        </main>
        <ChatInput onSubmit={handleChatSubmit} />
      </div>
    </>
  );
}
