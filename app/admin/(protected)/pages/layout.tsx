import { PageTabs } from "@/components/admin/page-tabs";

export default function AdminPagesLayout({ children }: { children: React.ReactNode }) {
  return <PageTabs>{children}</PageTabs>;
}