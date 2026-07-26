export const dynamic = "force-dynamic";

import { listUsers } from "@/actions/users";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export default async function AdminUsersPage() {
  const users = await listUsers();
  return <AdminUsersClient users={users} />;
}
