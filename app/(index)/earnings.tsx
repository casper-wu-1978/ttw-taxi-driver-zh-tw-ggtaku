
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

interface EarningsData {
  today: number;
  week: number;
  month: number;
  totalRides: number;
  averageRating: number;
  completionRate: number;
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.surface,
  },
  earningsCard: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...commonStyles.shadow,
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
  historySection: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    ...commonStyles.shadow,
  },
  historyHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  historyFare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  historyRoute: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

function EarningsScreen() {
  const { profile, driver } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Mock data - in real app, this would come from the database
  const earningsData: EarningsData = {
    today: 1250,
    week: 8750,
    month: 32500,
    totalRides: driver?.total_rides || 0,
    averageRating: driver?.rating || 5.0,
    completionRate: 95.2,
  };

  const rideHistory: RideHistory[] = [
    {
      id: '1',
      date: '今天',
      time: '14:30',
      from: '台北車站',
      to: '松山機場',
      fare: 350,
      distance: '12.5km',
      duration: '25分鐘',
    },
    {
      id: '2',
      date: '今天',
      time: '12:15',
      from: '信義區',
      to: '中山區',
      fare: 180,
      distance: '6.2km',
      duration: '15分鐘',
    },
    {
      id: '3',
      date: '昨天',
      time: '18:45',
      from: '西門町',
      to: '士林夜市',
      fare: 220,
      distance: '8.1km',
      duration: '20分鐘',
    },
    {
      id: '4',
      date: '昨天',
      time: '16:20',
      from: '板橋車站',
      to: '台北101',
      fare: 280,
      distance: '15.3km',
      duration: '30分鐘',
    },
    {
      id: '5',
      date: '昨天',
      time: '10:30',
      from: '淡水',
      to: '台北車站',
      fare: 420,
      distance: '25.8km',
      duration: '45分鐘',
    },
  ];

  const getCurrentEarnings = () => {
    return earningsData[selectedPeriod];
  };

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'today': return '今日收入';
      case 'week': return '本週收入';
      case 'month': return '本月收入';
      default: return '收入';
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
      <Text style={styles.earningsAmount}>NT$ {getCurrentEarnings().toLocaleString()}</Text>
      <Text style={styles.earningsLabel}>{getPeriodText()}</Text>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
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
    </View>
  );

  const renderRideHistory = () => (
    <View style={styles.historySection}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>最近行程</Text>
      </View>
      {rideHistory.map((ride, index) => (
        <View
          key={ride.id}
          style={[
            styles.historyItem,
            index === rideHistory.length - 1 && styles.historyItemLast,
          ]}
        >
          <View style={styles.historyItemHeader}>
            <Text style={styles.historyDate}>{ride.date} {ride.time}</Text>
            <Text style={styles.historyFare}>NT$ {ride.fare}</Text>
          </View>
          <Text style={styles.historyRoute}>
            {ride.from} → {ride.to}
          </Text>
          <View style={styles.historyDetails}>
            <Text style={styles.historyDetail}>{ride.distance}</Text>
            <Text style={styles.historyDetail}>{ride.duration}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>收入統計</Text>
        <Text style={styles.headerSubtitle}>
          {profile?.display_name || '司機'} 的收入報表
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {renderPeriodSelector()}
        {renderEarningsCard()}
        {renderStatsCards()}
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
