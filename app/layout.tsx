import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Blinker } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const blinker = Blinker({
  variable: "--font-blinker",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Student Performance Predictor",
  description:
    "Predict whether a student is likely to be a high performer based on academic, behavioural and environmental factors using a logistic regression model.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${blinker.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-accent-foreground">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </span>
              <span>
                Student Performance <span className="text-brand">Predictor</span>
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/demo" className="hidden transition-colors hover:text-foreground sm:block">
                Live demo
              </Link>
              <a href="#how" className="hidden transition-colors hover:text-foreground sm:block">
                How it works
              </a>
              <a
                href="#predict"
                className="rounded-full bg-brand px-4 py-1.5 font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Try it
              </a>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="mt-auto border-t border-border bg-background">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-3">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-accent-foreground">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </span>
                  <span>
                    Student Performance{" "}
                    <span className="text-brand">Predictor</span>
                  </span>
                </Link>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Predict whether a student is likely to be a high performer
                  using a logistic regression model trained on 6,607 student
                  records.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Explore
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a
                      href="#predict"
                      className="transition-colors hover:text-foreground"
                    >
                      Predict
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how"
                      className="transition-colors hover:text-foreground"
                    >
                      How it works
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Resources
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a
                      href="https://github.com/Alabiohio/StudentPerformancePredictor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-foreground"
                    >
                      Source code
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how"
                      className="transition-colors hover:text-foreground"
                    >
                      Methodology
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://oheo.site"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-foreground"
                    >
                      Oheo
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Disclaimer
                </h3>
                <p className="text-sm text-muted-foreground">
                  For educational use only — not a substitute for academic
                  counselling.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <p>© {new Date().getFullYear()} Ohiocheoya Alabi. All rights reserved.</p>
                <p>© {new Date().getFullYear()} Oheo. All rights reserved.</p>
              </div>
              <p>Released under the MIT License.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
