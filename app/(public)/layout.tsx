import React from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
