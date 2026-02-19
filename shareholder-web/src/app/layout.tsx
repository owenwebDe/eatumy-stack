import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
// Removed Google Font imports due to build fetch errors
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/auth-provider";

// Comenting out Google Fonts due to build time fetch errors
/*
const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});
*/

// Fallback to system fonts for successful build
const fontSans = { variable: "font-sans" };
const fontHeading = { variable: "font-heading" };

export const metadata: Metadata = {
  title: "EatumyHolder | Shareholder Portal",
  description: "Secure shareholder portfolio management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
