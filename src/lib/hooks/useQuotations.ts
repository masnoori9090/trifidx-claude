"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Quotation } from "@/lib/types";

export function useQuotations(userId?: string, initialQuotations?: Quotation[]) {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations || []);
  const [loading, setLoading] = useState(!initialQuotations);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [salespersonFilter, setSalespersonFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const hasInitialData = useRef(!!initialQuotations);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from("quotations")
        .select("*, creator:users!quotations_created_by_fkey(id, full_name, email, avatar_url), line_items:quotation_line_items(*)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`quote_number.ilike.%${search}%,client_name.ilike.%${search}%`);
      }
      if (salespersonFilter) {
        query = query.eq("created_by", salespersonFilter);
      }
      if (countryFilter) {
        query = query.eq("country", countryFilter);
      }

      const { data, error: qErr } = await query;
      if (qErr) {
        setError(qErr.message);
        setQuotations([]);
      } else {
        setQuotations((data as unknown as Quotation[]) || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch quotations");
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  }, [search, salespersonFilter, countryFilter]);

  useEffect(() => {
    if (hasInitialData.current && !search && !salespersonFilter && !countryFilter) {
      hasInitialData.current = false;
      return;
    }
    fetchQuotations();
  }, [fetchQuotations, search, salespersonFilter, countryFilter]);

  return {
    quotations,
    loading,
    error,
    search,
    salespersonFilter,
    countryFilter,
    setSearch,
    setSalespersonFilter,
    setCountryFilter,
    refetch: fetchQuotations,
  };
}
