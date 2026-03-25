"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { QUOTATION_TEMPLATES, PACKAGE_TEMPLATES, COUNTRIES } from "@/lib/utils";

interface LineItem {
  description: string;
  duration: number;
  monthly_rate: number;
  amount: number;
}

interface CreateQuotationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "QAR", label: "QAR - Qatari Riyal" },
  { value: "KWD", label: "KWD - Kuwaiti Dinar" },
  { value: "BHD", label: "BHD - Bahraini Dinar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JOD", label: "JOD - Jordanian Dinar" },
  { value: "INR", label: "INR - Indian Rupee" },
];

const VAT_OPTIONS = [
  { value: "no_vat", label: "No VAT" },
  { value: "5_vat", label: "5% VAT (Standard)" },
  { value: "15_vat", label: "15% VAT" },
];

const COUNTRY_ISO: Record<string, string> = {
  UAE: "AE", "Saudi Arabia": "SA", Qatar: "QA", Kuwait: "KW",
  Bahrain: "BH", Oman: "OM", Jordan: "JO", Lebanon: "LB",
  Egypt: "EG", USA: "US", UK: "GB", Canada: "CA", India: "IN",
  Pakistan: "PK", Other: "XX",
};

async function getNextQuoteNumber(countryCode: string): Promise<string> {
  const supabase = createClient();
  const { count } = await supabase
    .from("quotations")
    .select("*", { count: "exact", head: true });
  const num = (count || 0) + 1;
  return `${countryCode}-${2000 + num}`;
}

export function CreateQuotationModal({ open, onClose, onCreated }: CreateQuotationModalProps) {
  const { authUser, appUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", duration: 1, monthly_rate: 0, amount: 0 },
  ]);
  const [form, setForm] = useState({
    template: "Trifid Media",
    quote_number: "",
    country: "UAE",
    status: "draft",
    client_name: "",
    quote_date: new Date().toISOString().split("T")[0],
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    currency: "USD",
    vat_option: "5_vat",
    package_template: "",
    payment_terms: "100% advance payment",
    notes: "- The quotation remains valid for a period of 14 days from the date of issuance\n- Buyer understands payments are non-refundable and non-creditable once paid, by cash, cheque, and/or bank transfer deposit to Trifid Media accounts.",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  // Auto-generate quote number when country changes
  useEffect(() => {
    if (!open) return;
    const iso = COUNTRY_ISO[form.country] || "XX";
    getNextQuoteNumber(iso).then((num) => update("quote_number", num));
  }, [form.country, open]);

  const applyPackageTemplate = (templateName: string) => {
    if (!templateName || templateName === "none") {
      setForm((f) => ({ ...f, package_template: "" }));
      return;
    }
    const items = PACKAGE_TEMPLATES[templateName];
    if (items) {
      setLineItems(items.map((item) => ({
        description: item.description,
        duration: 1,
        monthly_rate: item.monthly_rate,
        amount: item.monthly_rate,
      })));
    }
    setForm((f) => ({ ...f, package_template: templateName }));
  };

  const updateLineItem = (index: number, key: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      if (key === "duration" || key === "monthly_rate") {
        updated[index].amount = updated[index].duration * updated[index].monthly_rate;
      }
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: "", duration: 1, monthly_rate: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const vatRate = form.vat_option === "5_vat" ? 0.05 : form.vat_option === "15_vat" ? 0.15 : 0;
  const subtotal = lineItems.reduce((s, item) => s + item.amount, 0);
  const taxAmount = subtotal * vatRate;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data: quotationData, error: qErr } = await supabase
      .from("quotations")
      .insert({
        quote_number: form.quote_number,
        template: form.template,
        status: form.status,
        client_name: form.client_name,
        country: form.country,
        currency: form.currency,
        vat_option: form.vat_option,
        quote_date: form.quote_date,
        valid_until: form.valid_until,
        payment_terms: form.payment_terms,
        notes: form.notes,
        subtotal,
        tax_amount: taxAmount,
        total,
        created_by: authUser?.id,
      })
      .select()
      .single();

    if (qErr) {
      toast.error("Failed to create quotation: " + qErr.message);
      setSaving(false);
      return;
    }

    // Insert line items
    if (lineItems.length > 0 && quotationData) {
      const itemsToInsert = lineItems.map((item, i) => ({
        quotation_id: quotationData.id,
        description: item.description || null,
        duration: item.duration,
        monthly_rate: item.monthly_rate,
        amount: item.amount,
        sort_order: i,
      }));
      await supabase.from("quotation_line_items").insert(itemsToInsert);
    }

    toast.success("Quotation created");
    onCreated();
    onClose();
    setLineItems([{ description: "", duration: 1, monthly_rate: 0, amount: 0 }]);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quotation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template */}
          <div className="space-y-1.5">
            <Label>Quotation Template <span className="text-red-500">*</span></Label>
            <Select value={form.template} onValueChange={(v) => update("template", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTATION_TEMPLATES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quote Number + Country */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quote Number</Label>
              <Input value={form.quote_number} onChange={(e) => update("quote_number", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country/Location</Label>
              <Select value={form.country} onValueChange={(v) => update("country", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status + Client */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Client/Prospect Name <span className="text-red-500">*</span></Label>
              <Input
                value={form.client_name}
                onChange={(e) => update("client_name", e.target.value)}
                placeholder="Select client/prospect..."
                required
              />
            </div>
          </div>

          {/* Created By + Quote Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Created By</Label>
              <Input value={appUser?.full_name || authUser?.email?.split("@")[0] || ""} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <Label>Quote Date</Label>
              <Input type="date" value={form.quote_date} onChange={(e) => update("quote_date", e.target.value)} />
            </div>
          </div>

          {/* Valid Until + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valid Until</Label>
              <Input type="date" value={form.valid_until} onChange={(e) => update("valid_until", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency <span className="text-red-500">*</span></Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* VAT + Package Template */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>VAT Option</Label>
              <Select value={form.vat_option} onValueChange={(v) => update("vat_option", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VAT_OPTIONS.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Quick Start: Package Template</Label>
                <span className="text-xs text-slate-400">{Object.keys(PACKAGE_TEMPLATES).length} templates loaded</span>
              </div>
              <Select value={form.package_template || "none"} onValueChange={applyPackageTemplate}>
                <SelectTrigger><SelectValue placeholder="Choose a template..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choose a template...</SelectItem>
                  {Object.keys(PACKAGE_TEMPLATES).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-7 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-2">Monthly Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-slate-100 items-center">
                  <div className="col-span-5">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      placeholder="Description"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.duration}
                      onChange={(e) => updateLineItem(index, "duration", parseFloat(e.target.value) || 1)}
                      min="1"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.monthly_rate || ""}
                      onChange={(e) => updateLineItem(index, "monthly_rate", parseFloat(e.target.value) || 0)}
                      placeholder="Rate"
                      min="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-slate-700">
                      {item.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{form.currency} {subtotal.toFixed(2)}</span>
              </div>
              {vatRate > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({vatRate * 100}%):</span>
                  <span>{form.currency} {taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-slate-900 text-base pt-1 border-t border-slate-200">
                <span>Total:</span>
                <span>{form.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-1.5">
            <Label>Payment Terms</Label>
            <Textarea
              value={form.payment_terms}
              onChange={(e) => update("payment_terms", e.target.value)}
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Terms & Conditions / Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin h-4 w-4" />}
              {saving ? "Creating…" : "Create Quotation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
