import "./globals.css";
export const metadata = {
  title: "Kalkulačka doručování písemností",
  description: "Pracovní nástroj pro HR a mzdové účetní",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
