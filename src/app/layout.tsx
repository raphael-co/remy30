import { AuthProvider } from "@/components/auth/useAuth";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "30 De Remy",
  description: "Cette page c'est pour toi Remy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" style={{
      background : "#f0ecdb"
    }}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
