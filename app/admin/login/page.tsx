import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Sign In",
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest-950 px-5 py-12">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-forest-600/40 blur-[120px]" />
        <div className="absolute bottom-0 right-[-80px] h-[420px] w-[420px] rounded-full bg-gold-500/15 blur-[110px]" />
        <div className="grain absolute inset-0" />
      </div>
      <div className="relative">
        <LoginForm />
      </div>
    </main>
  );
}