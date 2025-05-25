import type { Metadata, Viewport } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";

// Fonts
const inter = Inter({ subsets: ["latin"] });
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
});

// SEO Enhancements
const siteUrl = "https://scheduling-algorithms-two.vercel.app/";
export const metadata: Metadata = {
  title: {
    template: "%s | CPU Scheduling Algorithm Simulator & Visualizer",
    default:
      "CPU Scheduling Algorithm Simulator & Visualizer | FCFS, SJF, Priority, Round Robin",
  },
  description:
    "Visualize and compare CPU scheduling algorithms like FCFS, SJF (Shortest Job First), Priority, and Round Robin. Enter process details, see ready queue and Gantt chart animations, and analyze performance metrics.",
  creator: "Alberto Daniel Garcia",
  alternates: {
    canonical: "/", // Set the canonical URL for the root page
  },
  metadataBase: new URL(siteUrl),
  keywords: [
    "CPU Scheduling",
    "Scheduling Algorithms",
    "Operating Systems",
    "Process Scheduling",
    "First Come First Served",
    "FCFS",
    "Shortest Job First",
    "SJF",
    "Shortest Job Next",
    "SJN",
    "Shortest Process Next",
    "SPN",
    "Priority Scheduling",
    "Round Robin",
    "RR",
    "Preemptive Scheduling",
    "Non-Preemptive Scheduling",
    "Gantt Chart",
    "Ready Queue",
    "Turnaround Time",
    "Waiting Time",
    "Algorithm Simulator",
    "Algorithm Visualizer",
    "OS Concepts",
    "Computer Science Education",
    "Algorithm Animation",
    "CPU Simulator",
  ],

  // Control search engine crawling/indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Viewport Configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Define JSON-LD
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CPU Scheduling Algorithm Simulator & Visualizer",
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Simulation",
    operatingSystem: "Web Platform",
    description:
      "Interactively simulate and visualize CPU scheduling algorithms including FCFS, SJF (Shortest Job First), Priority, and Round Robin. Features animated Ready Queue and Gantt Chart, plus detailed performance metrics.",
    url: siteUrl,
    author: {
      "@type": "Person",
      name: "Alberto Daniel Garcia",
    },
    keywords:
      "CPU Scheduling, FCFS, SJF, Priority, Round Robin, Simulator, Visualizer, Operating Systems, Gantt Chart",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "First Come First Served (FCFS) Simulation",
      "Shortest Job First (SJF) Simulation (Preemptive & Non-Preemptive)",
      "Priority Scheduling Simulation (Preemptive & Non-Preemptive)",
      "Round Robin (RR) Simulation",
      "Animated Ready Queue Visualization",
      "Animated Gantt Chart Visualization",
      "Calculation of Completion Time, Turnaround Time, Waiting Time",
      "Average Performance Metrics Table",
    ],
  };

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body
        className={`${inter.className} ${openSans.variable} bg-gray-50 dark:bg-gray-900 overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
