import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitbybit BabylonJS Next.js Example",
  description: "Minimal example of @bitbybit-dev/babylonjs with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
