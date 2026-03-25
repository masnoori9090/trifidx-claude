"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Deal } from "@/lib/types";

const PAGE_SIZE = 50;

export interface DealsFilters {
  search: string;
  stage: string;
  owner_id: string;
  page: number;
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DealsFilters>({
    search: "", stage: "", owner_id: "", page: 0,
  });

  const fetchDeals = useCallback(async (f: DealsFilters) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from("deals")
        .select(
          "*, owner:users!deals_owner_id_fkey(id, full_name, avatar_url), company:companies(id, name)",
          { count: "exact" }
        )
        .is("deleted_at", null);

      if (f.stage) query = query.eq("stage", f.stage);
      if (f.owner_id) query = query.eq("owner_id", f.owner_id);
      if (f.search) query = query.ilike("title", `%${f.search}%`);

      const from = f.page * PAGE_SIZE;
      query = query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

      const { data, count, error: qErr } = await query;
      if (qErr) {
        setError(qErr.message);
        setDeals([]);
        setTotal(0);
      } else {
        setDeals((data as unknown as Deal[]) || []);
        setTotal(count || 0);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch deals");
      setDeals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeals(filters); }, [filters, fetchDeals]);

  const updateFilter = (key: keyof DealsFilters, value: string | number) =>
    setFilters((f) => ({ ...f, [key]: value, page: 0 }));
  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));

  return { deals, total, loading, error, filters, pageSize: PAGE_SIZE, updateFilter, setPage, refetch: () => fetchDeals(filters) };
}
