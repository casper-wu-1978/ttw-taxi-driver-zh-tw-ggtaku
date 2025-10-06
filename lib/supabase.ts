
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

export interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  line_user_id: string;
  pickup_address: string;
  destination_address: string;
  passenger_count: number;
  vehicle_type: string;
  booking_type: string;
  scheduled_at?: string;
  distance_km?: number;
  duration_min?: number;
  fare_min?: number;
  fare_max?: number;
  status: 'pending' | 'driver_accepted_pending_passenger' | 'accepted' | 'picking_up' | 'driver_arrived' | 'passenger_on_board' | 'completed' | 'cancelled';
  driver_id?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  destination_latitude?: number;
  destination_longitude?: number;
  accepted_at?: string;
  pickup_at?: string;
  completed_at?: string;
  coupon_id?: string;
  discount_amount?: number;
  original_fare?: number;
  luggage_requirements?: string;
  notes?: string;
  estimated_fare?: number;
  final_fare?: number;
  final_distance_km?: number;
  driver_arrived_at?: string;
}

export interface DriverFinancialRecord {
  id: string;
  driver_id: string;
  booking_id?: string;
  transaction_type: string;
  amount: number;
  description?: string;
  week_start_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverRating {
  id: string;
  booking_id: string;
  line_user_id: string;
  driver_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
