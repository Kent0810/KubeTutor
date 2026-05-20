import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AppProviders from "@/components/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KubeTutor — Learn Docker & Kubernetes",
  description:
    "Structured, interactive learning paths for Docker and Kubernetes. Practice with flashcards, quizzes, and real lesson content.",
};

/** Inlined script to apply saved preferences before first paint (avoids flash). */
const preferencesScript = `
(function(){
  try {
    var theme = localStorage.getItem('kubetutor:theme');
    if (theme) { try { theme = JSON.parse(theme); } catch(e){} }
    if (theme === 'dark') document.documentElement.classList.add('dark');
    var fs = localStorage.getItem('kubetutor:fontSize');
    if (fs) { try { fs = JSON.parse(fs); } catch(e){} }
    if (fs) document.documentElement.setAttribute('data-font-size', fs);
    var rm = localStorage.getItem('kubetutor:reduceMotion');
    if (rm) { try { rm = JSON.parse(rm); } catch(e){} }
    if (rm === true) document.documentElement.setAttribute('data-reduce-motion', 'true');
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-component */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <AppProviders>
          <Navbar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
