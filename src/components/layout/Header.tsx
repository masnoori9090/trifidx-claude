"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center h-14 px-4 border-b border-slate-200 bg-white gap-4">
      {title && (
        <div className="shrink-0">
          <h1 className="text-base font-semibold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 leading-tight">{subtitle}</p>}
        </div>
      )}

      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          placeholder="Search…"
          className="pl-8 h-8 text-sm bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <UserMenu />
      </div>
    </header>
  );
}
