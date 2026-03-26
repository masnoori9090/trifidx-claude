import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatCurrency(
  value: number | null | undefined,
  currency = "AED"
): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Won",
  closed_lost: "Lost",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "bg-zinc-100 text-zinc-700",
  contacted: "bg-zinc-200 text-zinc-800",
  qualified: "bg-zinc-800 text-zinc-100",
  proposal: "bg-zinc-700 text-zinc-100",
  negotiation: "bg-zinc-900 text-white",
  closed_won: "bg-black text-white",
  closed_lost: "bg-zinc-400 text-white",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  inbound: "Inbound",
  outbound: "Outbound",
  referral: "Referral",
  website: "Website",
  social_media: "Social Media",
  other: "Other",
};

export const LEAD_SOURCE_COLORS: Record<string, string> = {
  inbound: "bg-zinc-900 text-white",
  outbound: "bg-zinc-800 text-zinc-100",
  referral: "bg-zinc-700 text-zinc-100",
  website: "bg-zinc-600 text-white",
  social_media: "bg-zinc-500 text-white",
  other: "bg-zinc-100 text-zinc-600",
};

export const DEAL_STAGE_LABELS: Record<string, string> = {
  new_lead: "New Lead",
  attempting_contact: "Attempting Contact",
  contacted: "Contacted",
  qualified: "Qualified",
  meeting_booked: "Meeting Booked",
  meeting_completed: "Meeting Completed",
  proposal_sent: "Proposal / Quote Sent",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export const DEAL_STAGE_COLORS: Record<string, string> = {
  new_lead: "text-zinc-600 bg-zinc-100",
  attempting_contact: "text-zinc-700 bg-zinc-200",
  contacted: "text-zinc-700 bg-zinc-200",
  qualified: "text-zinc-100 bg-zinc-700",
  meeting_booked: "text-zinc-100 bg-zinc-700",
  meeting_completed: "text-white bg-zinc-800",
  proposal_sent: "text-white bg-zinc-800",
  negotiation: "text-white bg-zinc-900",
  closed_won: "text-white bg-black",
  closed_lost: "text-white bg-zinc-400",
};

export const DEAL_STAGE_DOT_COLORS: Record<string, string> = {
  new_lead: "bg-zinc-300",
  attempting_contact: "bg-zinc-400",
  contacted: "bg-zinc-500",
  qualified: "bg-zinc-600",
  meeting_booked: "bg-zinc-600",
  meeting_completed: "bg-zinc-700",
  proposal_sent: "bg-zinc-700",
  negotiation: "bg-zinc-900",
  closed_won: "bg-black",
  closed_lost: "bg-zinc-400",
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: "bg-zinc-900",
  phone_call: "bg-zinc-600",
  follow_up: "bg-zinc-500",
  demo: "bg-zinc-700",
  other: "bg-slate-500",
};

export const SERVICES = [
  "Social Media Management",
  "Website Development",
  "SEO Package",
  "Content Production",
  "Full Service Package",
  "Photography",
  "Videography",
  "Branding",
  "Paid Ads",
  "Email Marketing",
  "Other",
];

export const COUNTRIES = [
  "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman",
  "Jordan", "Lebanon", "Egypt", "Iraq", "Syria", "Palestine",
  "USA", "UK", "Canada", "Australia", "Germany", "France",
  "India", "Pakistan", "Philippines", "Other",
];

export const COUNTRY_CODES: Record<string, string> = {
  UAE: "+971", "Saudi Arabia": "+966", Qatar: "+974", Kuwait: "+965",
  Bahrain: "+973", Oman: "+968", Jordan: "+962", Lebanon: "+961",
  Egypt: "+20", USA: "+1", UK: "+44", Canada: "+1", India: "+91",
  Pakistan: "+92", Other: "+",
};

export const QUOTATION_TEMPLATES = [
  "Trifid Media",
  "Trifid UAE",
  "Trifid KSA",
  "Trifid QA",
];

export const PACKAGE_TEMPLATES: Record<string, { description: string; monthly_rate: number }[]> = {
  "Social Media Management": [
    { description: "Social Media Management (Instagram, TikTok, LinkedIn)", monthly_rate: 3000 },
    { description: "Content Creation (12 posts/month)", monthly_rate: 1500 },
    { description: "Community Management", monthly_rate: 500 },
  ],
  "Website Development": [
    { description: "Website Design & Development", monthly_rate: 8000 },
    { description: "SEO Setup & Optimization", monthly_rate: 1500 },
    { description: "Monthly Maintenance", monthly_rate: 500 },
  ],
  "SEO Package": [
    { description: "On-Page SEO Optimization", monthly_rate: 2000 },
    { description: "Off-Page SEO & Link Building", monthly_rate: 1500 },
    { description: "Monthly SEO Report", monthly_rate: 500 },
  ],
  "Content Production": [
    { description: "Monthly Content Strategy", monthly_rate: 1000 },
    { description: "Video Production (4 videos/month)", monthly_rate: 4000 },
    { description: "Photography Session", monthly_rate: 1500 },
  ],
  "Full Service Package": [
    { description: "Social Media Management", monthly_rate: 3000 },
    { description: "Content Creation", monthly_rate: 2000 },
    { description: "Website Maintenance", monthly_rate: 500 },
    { description: "Paid Ads Management", monthly_rate: 1500 },
    { description: "Monthly Reporting", monthly_rate: 500 },
  ],
};
