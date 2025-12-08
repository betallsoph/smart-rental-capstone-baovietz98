import AdminLayoutClient from "@/components/AdminLayoutClient";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
