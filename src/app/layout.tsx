import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ClinCase — Patient Case Taking",
  description:
    "Structured clinical case taking for doctors — patients, guided intake, and case review.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="shell">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
