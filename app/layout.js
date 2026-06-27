import "./globals.css";

export const metadata = {
  title: "Cryptic Hunt",
  description: "A unified Next.js hub for the cryptic hunt challenges.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
