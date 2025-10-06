
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Profile, Driver } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  driver: Driver | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setDriver(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      
      // Try to load profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else if (profileData) {
        console.log('Profile loaded:', profileData);
        setProfile(profileData);
        
        // If user is a driver, also load driver data
        if (profileData.user_type === 'driver') {
          const { data: driverData, error: driverError } = await supabase
            .from('drivers')
            .select('*')
            .eq('auth_user_id', userId)
            .single();

          if (driverError && driverError.code !== 'PGRST116') {
            console.error('Error loading driver data:', driverError);
          } else if (driverData) {
            console.log('Driver data loaded:', driverData);
            setDriver(driverData);
          }
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      setLoading(true);
      console.log('Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            display_name: userData.display_name,
            user_type: userData.user_type || 'passenger',
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Sign up successful:', data);

      // If user is created, create profile
      if (data.user && !error) {
        const profileData: Partial<Profile> = {
          auth_user_id: data.user.id,
          email: email,
          display_name: userData.display_name,
          user_type: userData.user_type || 'passenger',
          phone: userData.phone,
          status: 'active',
          notifications_enabled: true,
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }

        // If user type is driver, also create driver record
        if (userData.user_type === 'driver') {
          const driverData: Partial<Driver> = {
            auth_user_id: data.user.id,
            line_user_id: data.user.id, // Use auth user id as fallback
            display_name: userData.display_name,
            phone: userData.phone,
            status: 'offline',
            rating: 5.0,
            total_rides: 0,
          };

          const { error: driverError } = await supabase
            .from('drivers')
            .insert([driverData]);

          if (driverError) {
            console.error('Error creating driver record:', driverError);
            return { error: driverError };
          }
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error in signUp:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data);
      return { error: null };
    } catch (error) {
      console.error('Unexpected error in signIn:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      console.log('Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error in signOut:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user || !profile) {
        return { error: new Error('No user logged in') };
      }

      console.log('Updating profile:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('auth_user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { error };
      }

      // Reload profile data
      await loadUserProfile(user.id);
      
      console.log('Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error in updateProfile:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    profile,
    driver,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
