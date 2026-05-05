export const metadata = {
  title: 'MBO Lite Demo',
  description: 'End-to-end MBO lifecycle prototype',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, Arial, sans-serif', background: '#f5f7fb' }}>{children}</body>
    </html>
  );
}
