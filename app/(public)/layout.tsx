import React from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pastel-theme">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
