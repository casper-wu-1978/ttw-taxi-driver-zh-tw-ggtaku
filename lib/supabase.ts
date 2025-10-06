
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krindotmlijnfxmabeam.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyaW5kb3RtbGlqbmZ4bWFiZWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDcxNjAsImV4cCI6MjA2NzA4MzE2MH0.ZtzZ0aeAA71H12PUUawLWQY1NztBZjL2gkoU_AnxKI4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on existing schema
export interface Profile {
  id: string;
  line_user_id?: string;
  display_name?: string;
  avatar_url?: string;
  user_type: 'driver' | 'passenger';
  status: string;
  created_at: string;
  updated_at: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  gender?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_payment_method?: string;
  notifications_enabled: boolean;
  auth_user_id?: string;
  manual_line_id?: string;
  verification_code?: string;
  verification_expires_at?: string;
  is_manually_verified?: boolean;
  referral_code?: string;
}

export interface Driver {
  id: string;
  line_user_id: string;
  auth_user_id?: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  license_number?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  rating?: number;
  total_rides?: number;
  status: 'online' | 'offline' | 'busy' | 'suspended';
  current_latitude?: number;
  current_longitude?: number;
  last_location_update?: string;
  created_at: string;
  updated_at: string;
  vehicle_photo_front?: string;
  vehicle_photo_back?: string;
  vehicle_photo_left?: string;
  vehicle_photo_right?: string;
  id_card_front?: string;
  id_card_back?: string;
  drivers_license_front?: string;
  drivers_license_back?: string;
  push_token?: string;
  vehicle_color?: string;
}
