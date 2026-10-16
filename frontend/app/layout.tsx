import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/motion/MotionProvider";
import "./globals.css";

/* Brand display face (headings). Only the Bold weight is used. */
const eighties = localFont({
  src: "./fonts/EightiesComeback-Bold.otf",
  weight: "700",
  style: "normal",
  variable: "--font-eighties",
  display: "swap",
});

/* Body and interface face: DM Sans variable font, weights 400 to 700. */
const dmSans = localFont({
  src: "./fonts/DMSans-Variable.ttf",
  weight: "400 700",
  style: "normal",
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bites and More | Postres caseros por encargo",
    template: "%s | Bites and More",
  },
  description:
    "Postres hechos en casa para tus momentos especiales: pasteles, cupcakes, galletas y más. Haz tu pedido por WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${eighties.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
