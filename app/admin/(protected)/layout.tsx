import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminFlash, ToastProvider, ToastStack } from "@/components/admin/toast";
import { getSessionUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries";
import { getAdminToast } from "@/lib/toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getSessionUser(), getSiteSettings()]);
  if (!user) redirect("/admin/login");

  const flash = await getAdminToast();

  return (
    <ToastProvider>
      <AdminShell userName={user.name} userEmail={user.email} logo={settings.logo}>
        {children}
      </AdminShell>
      <AdminFlash key={flash?.nonce ?? "none"} flash={flash} />
      <ToastStack />
    </ToastProvider>
  );
}