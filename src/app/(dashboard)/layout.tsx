import { Sidebar } from "@/components/layout/sidebar";
import packageJson from "../../../package.json";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
        <footer className="border-t border-border px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            RunMilha v{packageJson.version}
          </p>
        </footer>
      </div>
    </div>
  );
}
