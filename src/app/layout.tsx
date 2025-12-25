import { AuthProvider } from "@/components/auth/useAuth";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produit",
  description: "Page produit démo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
