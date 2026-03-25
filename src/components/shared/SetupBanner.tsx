"use client";
import { useState } from "react";
import { AlertTriangle, X, Copy, CheckCheck } from "lucide-react";

export function SetupBanner({ error }: { error: string }) {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Only show for table-not-found errors
  const isSetupError =
    error.includes("schema cache") ||
    error.includes("does not exist") ||
    error.includes("relation") ||
    error.includes("table");

  if (!isSetupError) return null;

  const sqlUrl = "https://supabase.com/dashboard/project/fczrhxbnzuezweizabtn/sql/new";

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">Database setup required</p>
          <p className="text-sm text-amber-700 mt-1">
            The database tables don&apos;t exist yet. Run the setup SQL to get started:
          </p>
          <ol className="text-sm text-amber-800 mt-2 space-y-1 list-decimal list-inside">
            <li>
              Open the{" "}
              <a
                href={sqlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-amber-900"
              >
                Supabase SQL Editor
              </a>
            </li>
            <li>
              Open{" "}
              <code className="bg-amber-100 px-1 rounded text-xs font-mono">
                trifid-crm/supabase-setup.sql
              </code>{" "}
              in your editor
            </li>
            <li>Paste all contents → click <strong>Run</strong></li>
            <li>Refresh this page</li>
          </ol>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
