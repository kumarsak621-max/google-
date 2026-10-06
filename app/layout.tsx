import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "Photo Retrieval Discovery Engine",
  description:
    "Research tool for vague-memory photo retrieval in Google Photos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
