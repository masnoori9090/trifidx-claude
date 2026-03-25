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
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-cyan-100 text-cyan-700",
  proposal: "bg-violet-100 text-violet-700",
  negotiation: "bg-amber-100 text-amber-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
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
  inbound: "bg-green-100 text-green-700",
  outbound: "bg-indigo-100 text-indigo-700",
  referral: "bg-purple-100 text-purple-700",
  website: "bg-blue-100 text-blue-700",
  social_media: "bg-pink-100 text-pink-700",
  other: "bg-slate-100 text-slate-600",
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
  new_lead: "text-slate-600 bg-slate-100",
  attempting_contact: "text-blue-600 bg-blue-100",
  contacted: "text-blue-700 bg-blue-100",
  qualified: "text-violet-700 bg-violet-100",
  meeting_booked: "text-amber-700 bg-amber-100",
  meeting_completed: "text-orange-700 bg-orange-100",
  proposal_sent: "text-orange-700 bg-orange-100",
  negotiation: "text-red-700 bg-red-100",
  closed_won: "text-green-700 bg-green-100",
  closed_lost: "text-red-700 bg-red-100",
};

export const DEAL_STAGE_DOT_COLORS: Record<string, string> = {
  new_lead: "bg-slate-400",
  attempting_contact: "bg-blue-400",
  contacted: "bg-blue-500",
  qualified: "bg-violet-500",
  meeting_booked: "bg-amber-400",
  meeting_completed: "bg-orange-500",
  proposal_sent: "bg-orange-500",
  negotiation: "bg-red-500",
  closed_won: "bg-green-500",
  closed_lost: "bg-red-700",
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: "bg-indigo-500",
  phone_call: "bg-green-500",
  follow_up: "bg-amber-500",
  demo: "bg-purple-500",
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
