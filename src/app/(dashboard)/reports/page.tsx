import { Header } from "@/components/layout/Header";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Reports" subtitle="Analytics and performance reports" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">Reports module coming soon</p>
          <p className="text-xs mt-1">Detailed analytics and reports will appear here</p>
        </div>
      </div>
    </div>
  );
}
