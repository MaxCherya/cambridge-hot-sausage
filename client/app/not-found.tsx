import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F1E8", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "8rem", lineHeight: 1, color: "rgba(90,31,31,0.1)", fontWeight: 700 }}>404</div>
          <h1 style={{ marginTop: "1rem", fontSize: "1.5rem", color: "#5A1F1F" }}>Page not found</h1>
          <p style={{ marginTop: "0.5rem", color: "rgba(43,43,43,0.5)" }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              background: "#5A1F1F",
              color: "#F5F1E8",
              borderRadius: "9999px",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
