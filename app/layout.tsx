import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habesha Mesh | Custom Ethiopian 3D Model Assets",
  description:
    "A premium store for custom Ethiopian 3D model assets, game-ready props, architecture kits, and environment packs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
