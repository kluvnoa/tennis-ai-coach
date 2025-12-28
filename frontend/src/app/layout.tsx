// Root layout - redirects are handled by middleware
// This file is kept minimal as [locale]/layout.tsx handles the actual layout

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
