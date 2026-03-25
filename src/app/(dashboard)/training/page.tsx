import { Header } from "@/components/layout/Header";
import { BookOpen } from "lucide-react";

export default function TrainingPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Training" subtitle="Sales training and resources" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">Training module coming soon</p>
          <p className="text-xs mt-1">Sales training materials and videos will appear here</p>
        </div>
      </div>
    </div>
  );
}
