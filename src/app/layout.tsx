import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PesaSwift | Instant Mobile Loans to M-PESA",
  description: "Get quick emergency micro-loans directly to your M-PESA. Low interest, fast approval, zero paperwork.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
