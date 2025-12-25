import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginClient />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "22px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 16,
          padding: 16,
          background: "rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ height: 22, width: 120, background: "rgba(0,0,0,0.1)", borderRadius: 8 }} />
        <div style={{ height: 44, marginTop: 16, background: "rgba(0,0,0,0.1)", borderRadius: 14 }} />
        <div style={{ height: 44, marginTop: 10, background: "rgba(0,0,0,0.1)", borderRadius: 14 }} />
        <div style={{ height: 44, marginTop: 14, background: "rgba(0,0,0,0.1)", borderRadius: 16 }} />
      </div>
    </div>
  );
}
