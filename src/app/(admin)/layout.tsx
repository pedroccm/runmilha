import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("rm_users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-card min-h-screen">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
              <span className="text-destructive-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg">Admin</span>
          </Link>
        </div>
        <nav className="px-3 py-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Overview
          </Link>
          <Link
            href="/admin/rewards"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Rewards
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Users
          </Link>
          <Link
            href="/admin/redemptions"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Redemptions
          </Link>
          <div className="border-t border-border my-3" />
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Back to App
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
