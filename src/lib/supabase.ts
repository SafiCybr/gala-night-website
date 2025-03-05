
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for our database tables
export type Tables = {
  users: User;
  payments: Payment;
  tickets: Ticket;
};

export type User = {
  id: string;
  name: string;
  email: string;
  matric_number?: string; // Added matric_number as optional property
  role: 'user' | 'admin';
  created_at?: string;
};

export type Payment = {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'rejected';
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type Ticket = {
  id: string;
  user_id: string;
  table_type: 'Standard' | 'Premium' | 'VIP';
  table_number: string;
  seat_number: string;
  created_at?: string;
};
