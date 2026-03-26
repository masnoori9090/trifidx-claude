"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Building2, Globe, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Lead, User } from "@/lib/types";

interface ClientsClientProps {
  users: Partial<User>[];
  initialClients?: Lead[];
}

export function ClientsClient({ users, initialClients }: ClientsClientProps) {
  const [clients, setClients] = useState<Lead[]>(initialClients || []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const hasInitialData = useState(() => !!initialClients)[0];

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("leads")
      .select("*, owner:users!leads_owner_id_fkey(id, full_name, email, avatar_url)")
      .eq("is_client", true)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (search) {
      query = query.or(
        `business_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data } = await query;
    setClients((data as unknown as Lead[]) || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    // Skip first fetch if we have initial server data and no search active
    if (hasInitialData && !search) return;
    const t = setTimeout(fetchClients, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchClients, search, hasInitialData]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search clients…"
            className="pl-8 h-8 text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-2 bg-slate-50 border-b border-slate-200">
        <span className="text-xs text-slate-500">
          {loading ? "Loading…" : `${clients.length.toLocaleString()} clients`}
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Building2 className="h-10 w-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium">No clients yet</p>
            <p className="text-xs mt-1">Convert a lead to client from the Leads page</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => setSelected(client)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <LeadDetail
          lead={selected}
          users={users}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setSelected(updated);
            fetchClients();
          }}
        />
      )}
    </div>
  );
}

function ClientCard({ client, onClick }: { client: Lead; onClick: () => void }) {
  const name = [client.first_name, client.last_name].filter(Boolean).join(" ");
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-zinc-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-zinc-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-slate-900 text-sm truncate">{client.business_name}</p>
          {name && <p className="text-xs text-slate-500 truncate">{name}</p>}
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-500">
        {client.country && (
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{client.country}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {(client.phone || client.mobile) && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{client.phone || client.mobile}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {client.owner?.full_name || "Unassigned"}
        </span>
        <span className="text-xs text-slate-400">{formatDate(client.updated_at)}</span>
      </div>
    </div>
  );
}
