import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminSidebar from "./AdminSidebar"

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: any
}) {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get("admin_session")?.value === "true"
  const pathname = ""

  return (
    <>
      {isLoggedIn ? (
        <div className="flex min-h-screen bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  )
}