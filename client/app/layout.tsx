/**
 * Root layout — minimal passthrough.
 * The actual <html>/<body> tags are in [locale]/layout.tsx
 * and admin/layout.tsx. This just wraps children.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
