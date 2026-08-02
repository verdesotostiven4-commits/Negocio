import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authorized = await isAdmin();
  return authorized ? <AdminDashboard /> : <AdminLogin />;
}
