import { requireAdmin } from "@/lib/auth";
import { getAdminUsers } from "@/lib/queries";
import { AdminAccountsManager } from "@/components/admin/admin-accounts-manager";

export default async function AdminAccountsPage() {
  const [currentUser, admins] = await Promise.all([requireAdmin(), getAdminUsers()]);

  const items = admins.map((admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    isActive: admin.isActive,
    createdAt: admin.createdAt.toISOString(),
    articleCount: admin._count.blogs,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <AdminAccountsManager
        admins={items}
        currentUserId={currentUser.id}
        currentUserRole={currentUser.role}
      />
    </div>
  );
}

