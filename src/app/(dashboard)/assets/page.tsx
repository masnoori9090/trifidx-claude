import { Header } from "@/components/layout/Header";
import { Package } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Assets" subtitle="Manage your team assets and resources" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">Assets module coming soon</p>
          <p className="text-xs mt-1">Track company assets and resources here</p>
        </div>
      </div>
    </div>
  );
}
