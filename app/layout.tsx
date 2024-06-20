import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CPU Scheduling Algorithm Generator",
  description: "A CPU scheduling algorithm generator with animation",
  creator: "Alberto Daniel Garcia",
  keywords: [
    "first come first served",
    "fcfs",
    "shortest job first",
    "sjf",
    "priority scheduling",
    "round robin",
    "CPU Scheduling",
    "Operating Systems",
    "Algorithm Generator",
    "Algorithm Animation",
    "Algorithm Solver",
    "Algorithm Visualizer",
    "Algorithm Simulator",
  ],
  metadataBase: new URL('https://scheduling-algorithms-two.vercel.app/'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} bg-gray-50 overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
