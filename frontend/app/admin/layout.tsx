import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Panel de administración",
    template: "%s | Panel de Bites and More",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
