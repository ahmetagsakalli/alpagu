import AdminPanel from "@/components/admin/AdminPanel";
import { cookies } from "next/headers";
import { COOKIE } from "@/lib/cms/auth-config";
export default async function AdminPage() {
  const hasSession = (await cookies()).has(COOKIE);
  return <AdminPanel hasSession={hasSession} />;
}
