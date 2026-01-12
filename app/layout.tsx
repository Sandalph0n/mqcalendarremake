import React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import {Inter} from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { PlannerProvider } from "@/contexts/PlannerContext";


const inter = Inter({subsets:["latin"]})


export const metadata: Metadata = {
  title: "MQ Assignment Planner",
  description: "Manage, Visualize and Genarate Assignment Calendar for Macquarie University Students",
  icons: {
    // icon: "/favicon.ico",
    // shortcut: "/favicon.ico",
    icon: "https://www.mq.edu.au/?a=1232",
    shortcut: "https://www.mq.edu.au/?a=1232",
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          // enableSystem  
        >
          <PlannerProvider>
            <div className="min-h-screen flex flex-col">
              <SiteHeader/>
              <main className="flex-1">{children}</main>
              <SiteFooter/>
            </div>
          </PlannerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
