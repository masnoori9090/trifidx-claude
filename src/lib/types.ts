export type UserRole = "admin" | "manager" | "salesperson";
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";
export type LeadSource =
  | "inbound"
  | "outbound"
  | "referral"
  | "website"
  | "social_media"
  | "other";
export type LeadType = "hot" | "warm" | "cold";
export type DealStage =
  | "new_lead"
  | "attempting_contact"
  | "contacted"
  | "qualified"
  | "meeting_booked"
  | "meeting_completed"
  | "proposal_sent"
  | "negotiation"
  | "closed_won"
  | "closed_lost";
export type EventType = "meeting" | "phone_call" | "follow_up" | "demo" | "other";
export type EventStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type QuotationStatus = "draft" | "approved" | "rejected" | "sent";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  business_name: string;
  instagram_handle?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  website?: string | null;
  lead_source: LeadSource;
  industry?: string | null;
  country?: string | null;
  status: LeadStatus;
  lead_type?: LeadType | null;
  owner_id?: string | null;
  claimed_at?: string | null;
  expires_at?: string | null;
  notes?: string | null;
  last_contact_date?: string | null;
  do_not_approach: boolean;
  dna_reason?: string | null;
  dna_notes?: string | null;
  dna_flagged_by?: string | null;
  dna_flagged_at?: string | null;
  is_client: boolean;
  client_id?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  owner?: User | null;
}

export interface Contact {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_e164?: string | null;
  company_name?: string | null;
  company_id?: string | null;
  job_title?: string | null;
  lead_status?: string | null;
  lead_source?: string | null;
  industry?: string | null;
  notes?: string | null;
  owner_email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  title: string;
  lead_id?: string | null;
  client_id?: string | null;
  company_id?: string | null;
  company_name?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  country?: string | null;
  service?: string | null;
  stage: DealStage;
  value?: number | null;
  currency: string;
  probability: number;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  lost_reason?: string | null;
  owner_id?: string | null;
  notes?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  owner?: User | null;
  company?: Company | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  start_at: string;
  end_at: string;
  status: EventStatus;
  location?: string | null;
  meeting_link?: string | null;
  description?: string | null;
  meeting_notes?: string | null;
  completed_at?: string | null;
  participants?: string[] | null;
  visibility: "everyone" | "private";
  related_lead_id?: string | null;
  related_deal_id?: string | null;
  related_client_id?: string | null;
  assigned_to?: string | null;
  calendar_country: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  assigned_user?: User | null;
}

export interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value?: string | null;
  new_value?: string | null;
  performed_by?: string | null;
  created_at: string;
  // Joined
  performer?: User | null;
}

export interface QuotationLineItem {
  id: string;
  quotation_id: string;
  description?: string | null;
  duration: number;
  monthly_rate: number;
  amount: number;
  sort_order: number;
  created_at: string;
}

export interface Quotation {
  id: string;
  quote_number: string;
  template: string;
  status: QuotationStatus;
  client_name?: string | null;
  country?: string | null;
  currency: string;
  vat_option: string;
  quote_date: string;
  valid_until?: string | null;
  payment_terms?: string | null;
  notes?: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_by?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  creator?: User | null;
  line_items?: QuotationLineItem[];
}

// Supabase Database type (simplified)
export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      leads: { Row: Lead; Insert: Partial<Lead>; Update: Partial<Lead> };
      contacts: { Row: Contact; Insert: Partial<Contact>; Update: Partial<Contact> };
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> };
      deals: { Row: Deal; Insert: Partial<Deal>; Update: Partial<Deal> };
      calendar_events: { Row: CalendarEvent; Insert: Partial<CalendarEvent>; Update: Partial<CalendarEvent> };
      activity_log: { Row: ActivityLog; Insert: Partial<ActivityLog>; Update: Partial<ActivityLog> };
      quotations: { Row: Quotation; Insert: Partial<Quotation>; Update: Partial<Quotation> };
      quotation_line_items: { Row: QuotationLineItem; Insert: Partial<QuotationLineItem>; Update: Partial<QuotationLineItem> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
