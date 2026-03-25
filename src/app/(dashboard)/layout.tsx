import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <footer className="shrink-0 px-6 py-2 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-400 text-center">
            © {new Date().getFullYear()} Trifid CRM. All rights reserved.
          </p>
        </footer>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
