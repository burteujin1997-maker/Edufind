import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const isLoggedIn = cookieStore.get("admin_session")?.value === "true";

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
