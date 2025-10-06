
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import AuthGuard from "@/components/AuthGuard";
import { Stack } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { supabase } from "@/lib/supabase";

interface EarningsData {
  today: number;
  week: number;
  month: number;
  totalRides: number;
  averageRating: number;
  completionRate: number;
  totalEarnings: number;
}

interface RideHistory {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  fare: number;
  distance: string;
  duration: string;
  status: string;
  passengerRating?: number;
}

interface FinancialRecord {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  booking_id?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.surface,
  },
  earningsCard: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    ...commonStyles.shadow,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  rideCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    ...commonStyles.shadow,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rideDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rideFare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  rideRoute: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideInfo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rideRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  refreshButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: 20,
  },
});

function EarningsScreen() {
  const { driver } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [earningsData, setEarningsData] = useState<EarningsData>({
    today: 0,
    week: 0,
    month: 0,
    totalRides: 0,
    averageRating: 5.0,
    completionRate: 100,
    totalEarnings: 0,
  });
  const [rideHistory, setRideHistory] = useState<RideHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFinancialData = useCallback(async () => {
    if (!driver?.id) return;

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 獲取今日收益
      const { data: todayData } = await supabase
        .from('driver_financial_records')
        .select('amount')
        .eq('driver_id', driver.id)
        .eq('transaction_type', 'earning')
        .gte('created_at', today.toISOString());

      const todayEarnings = todayData?.reduce((sum, record) => sum + record.amount, 0) || 0;

      // 獲取本週收益
      const { data: weekData } = await supabase
        .from('driver_financial_records')
        .select('amount')
        .eq('driver_id', driver.id)
        .eq('transaction_type', 'earning')
        .gte('created_at', weekStart.toISOString());

      const weekEarnings = weekData?.reduce((sum, record) => sum + record.amount, 0) || 0;

      // 獲取本月收益
      const { data: monthData } = await supabase
        .from('driver_financial_records')
        .select('amount')
        .eq('driver_id', driver.id)
        .eq('transaction_type', 'earning')
        .gte('created_at', monthStart.toISOString());

      const monthEarnings = monthData?.reduce((sum, record) => sum + record.amount, 0) || 0;

      // 獲取總收益
      const { data: totalData } = await supabase
        .from('driver_financial_records')
        .select('amount')
        .eq('driver_id', driver.id)
        .eq('transaction_type', 'earning');

      const totalEarnings = totalData?.reduce((sum, record) => sum + record.amount, 0) || 0;

      setEarningsData(prev => ({
        ...prev,
        today: todayEarnings,
        week: weekEarnings,
        month: monthEarnings,
        totalEarnings,
      }));
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  }, [driver?.id]);

  const loadRideHistory = useCallback(async () => {
    if (!driver?.id) return;

    try {
      let dateFilter = new Date();
      
      if (selectedPeriod === 'today') {
        dateFilter = new Date(dateFilter.getFullYear(), dateFilter.getMonth(), dateFilter.getDate());
      } else if (selectedPeriod === 'week') {
        dateFilter.setDate(dateFilter.getDate() - dateFilter.getDay());
      } else if (selectedPeriod === 'month') {
        dateFilter = new Date(dateFilter.getFullYear(), dateFilter.getMonth(), 1);
      }

      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          pickup_address,
          destination_address,
          final_fare,
          estimated_fare,
          final_distance_km,
          distance_km,
          status,
          completed_at,
          created_at,
          driver_ratings (rating)
        `)
        .eq('driver_id', driver.id)
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      const history: RideHistory[] = bookings?.map(booking => ({
        id: booking.id,
        date: new Date(booking.completed_at || booking.created_at).toLocaleDateString('zh-TW'),
        time: new Date(booking.completed_at || booking.created_at).toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        from: booking.pickup_address || '未知地點',
        to: booking.destination_address || '未知地點',
        fare: booking.final_fare || booking.estimated_fare || 0,
        distance: `${booking.final_distance_km || booking.distance_km || 0} 公里`,
        duration: '25 分鐘', // 可以根據實際數據計算
        status: booking.status,
        passengerRating: booking.driver_ratings?.[0]?.rating,
      })) || [];

      setRideHistory(history);
    } catch (error) {
      console.error('Error loading ride history:', error);
    }
  }, [driver?.id, selectedPeriod]);

  const loadDriverStats = useCallback(async () => {
    if (!driver?.id) return;

    try {
      // 獲取司機統計數據
      const { data: driverData } = await supabase
        .from('drivers')
        .select('rating, total_rides')
        .eq('id', driver.id)
        .single();

      // 計算完成率（這裡簡化處理）
      const { data: completedRides } = await supabase
        .from('bookings')
        .select('id')
        .eq('driver_id', driver.id)
        .eq('status', 'completed');

      const { data: totalBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('driver_id', driver.id);

      const completionRate = totalBookings?.length > 0 
        ? Math.round((completedRides?.length || 0) / totalBookings.length * 100)
        : 100;

      setEarningsData(prev => ({
        ...prev,
        totalRides: driverData?.total_rides || 0,
        averageRating: driverData?.rating || 5.0,
        completionRate,
      }));
    } catch (error) {
      console.error('Error loading driver stats:', error);
    }
  }, [driver?.id]);

  const loadEarningsData = useCallback(async () => {
    if (!driver?.id) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadFinancialData(),
        loadRideHistory(),
        loadDriverStats(),
      ]);
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
    }
  }, [driver?.id, loadFinancialData, loadRideHistory, loadDriverStats]);

  useEffect(() => {
    loadEarningsData();
  }, [loadEarningsData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEarningsData();
    setRefreshing(false);
  };

  const getCurrentEarnings = () => {
    switch (selectedPeriod) {
      case 'today': return earningsData.today;
      case 'week': return earningsData.week;
      case 'month': return earningsData.month;
      default: return earningsData.today;
    }
  };

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'today': return '今日收益';
      case 'week': return '本週收益';
      case 'month': return '本月收益';
      default: return '今日收益';
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['today', 'week', 'month'] as const).map((period) => (
        <Pressable
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive,
            ]}
          >
            {period === 'today' ? '今日' : period === 'week' ? '本週' : '本月'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderEarningsCard = () => (
    <View style={styles.earningsCard}>
      <Text style={styles.earningsAmount}>
        NT$ {getCurrentEarnings().toLocaleString()}
      </Text>
      <Text style={styles.earningsLabel}>{getPeriodText()}</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{earningsData.totalRides}</Text>
          <Text style={styles.statLabel}>總行程數</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{earningsData.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>平均評分</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{earningsData.completionRate}%</Text>
          <Text style={styles.statLabel}>完成率</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>NT$ {earningsData.totalEarnings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>總收益</Text>
        </View>
      </View>
    </View>
  );

  const renderRideHistory = () => {
    if (loading) {
      return <Text style={styles.loadingText}>載入中...</Text>;
    }

    if (rideHistory.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconSymbol name="car" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            {selectedPeriod === 'today' ? '今日' : selectedPeriod === 'week' ? '本週' : '本月'}
            還沒有完成的行程
          </Text>
          <Pressable style={styles.refreshButton} onPress={loadEarningsData}>
            <Text style={styles.refreshButtonText}>重新載入</Text>
          </Pressable>
        </View>
      );
    }

    return rideHistory.map((ride) => (
      <View key={ride.id} style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <Text style={styles.rideDate}>{ride.date} {ride.time}</Text>
          <Text style={styles.rideFare}>NT$ {ride.fare}</Text>
        </View>
        
        <Text style={styles.rideRoute}>
          {ride.from} → {ride.to}
        </Text>
        
        <View style={styles.rideDetails}>
          <Text style={styles.rideInfo}>
            {ride.distance} • {ride.duration}
          </Text>
          {ride.passengerRating && (
            <View style={styles.rideRating}>
              <IconSymbol name="star.fill" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{ride.passengerRating}</Text>
            </View>
          )}
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>收益統計</Text>
        {renderPeriodSelector()}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderEarningsCard()}
        
        <Text style={styles.sectionTitle}>行程記錄</Text>
        {renderRideHistory()}
      </ScrollView>
    </View>
  );
}

export default function ProtectedEarningsScreen() {
  return (
    <AuthGuard>
      <EarningsScreen />
    </AuthGuard>
  );
}
