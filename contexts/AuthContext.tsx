
import { supabase, Profile, Driver } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
  updateDriver: (updates: Partial<Driver>) => Promise<{ error: any }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 獲取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setDriver(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // 載入用戶資料
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
        
        // 如果是司機，載入司機資料
        if (profileData.user_type === 'driver') {
          await loadDriverProfile(userId, profileData.line_user_id);
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDriverProfile = async (authUserId: string, lineUserId?: string) => {
    try {
      let query = supabase.from('drivers').select('*');
      
      // 優先使用 auth_user_id 查詢，如果沒有則使用 line_user_id
      if (authUserId) {
        query = query.eq('auth_user_id', authUserId);
      } else if (lineUserId) {
        query = query.eq('line_user_id', lineUserId);
      } else {
        return;
      }

      const { data: driverData, error: driverError } = await query.single();

      if (driverError && driverError.code !== 'PGRST116') {
        console.error('Error loading driver profile:', driverError);
      } else if (driverData) {
        setDriver(driverData);
      }
    } catch (error) {
      console.error('Error in loadDriverProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        return { error };
      }

      // 如果註冊成功且有用戶 ID，創建 profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              auth_user_id: data.user.id,
              email: email,
              user_type: userData.user_type || 'driver',
              display_name: userData.display_name,
              phone: userData.phone,
              ...userData,
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // 如果是司機，創建司機資料
        if (userData.user_type === 'driver') {
          const { error: driverError } = await supabase
            .from('drivers')
            .insert([
              {
                auth_user_id: data.user.id,
                display_name: userData.display_name,
                phone: userData.phone,
                status: 'offline',
              },
            ]);

          if (driverError) {
            console.error('Error creating driver profile:', driverError);
          }
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // 如果是司機，先設為離線狀態
      if (driver?.id) {
        await supabase
          .from('drivers')
          .update({ status: 'offline' })
          .eq('id', driver.id);
      }

      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setDriver(null);
      }
      
      return { error };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user?.id) {
        return { error: new Error('No user logged in') };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('auth_user_id', user.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { error };
    }
  };

  const updateDriver = async (updates: Partial<Driver>) => {
    try {
      if (!driver?.id) {
        return { error: new Error('No driver profile found') };
      }

      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', driver.id);

      if (!error) {
        setDriver(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error };
    } catch (error) {
      console.error('Error in updateDriver:', error);
      return { error };
    }
  };

  const refreshUserData = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    driver,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateDriver,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
