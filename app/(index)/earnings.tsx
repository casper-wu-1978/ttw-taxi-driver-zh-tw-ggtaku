
import React, { useState } from "react";
import { Stack } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";

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

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const earningsData: EarningsData = {
    today: 1250,
    week: 8750,
    month: 35200,
    totalRides: 156,
    averageRating: 4.8,
    completionRate: 98.5
  };

  const rideHistory: RideHistory[] = [
    {
      id: "R001",
      date: "2024-01-15",
      time: "14:30",
      from: "台北車站",
      to: "信義區",
      fare: 180,
      distance: "3.2km",
      duration: "15分鐘"
    },
    {
      id: "R002", 
      date: "2024-01-15",
      time: "13:45",
      from: "松山機場",
      to: "大安區",
      fare: 220,
      distance: "4.1km",
      duration: "18分鐘"
    },
    {
      id: "R003",
      date: "2024-01-15", 
      time: "12:20",
      from: "西門町",
      to: "中山區",
      fare: 150,
      distance: "2.8km",
      duration: "12分鐘"
    }
  ];

  const getCurrentEarnings = () => {
    switch (selectedPeriod) {
      case 'today':
        return earningsData.today;
      case 'week':
        return earningsData.week;
      case 'month':
        return earningsData.month;
      default:
        return earningsData.today;
    }
  };

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'today':
        return '今日收入';
      case 'week':
        return '本週收入';
      case 'month':
        return '本月收入';
      default:
        return '今日收入';
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['today', 'week', 'month'] as const).map((period) => (
        <Pressable
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period === 'today' ? '今日' : period === 'week' ? '本週' : '本月'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderEarningsCard = () => (
    <View style={styles.earningsCard}>
      <Text style={styles.earningsLabel}>{getPeriodText()}</Text>
      <Text style={styles.earningsAmount}>NT${getCurrentEarnings().toLocaleString()}</Text>
      <View style={styles.earningsDetails}>
        <View style={styles.earningsDetailItem}>
          <IconSymbol name="car" size={16} color={colors.primary} />
          <Text style={styles.earningsDetailText}>
            {selectedPeriod === 'today' ? '12' : selectedPeriod === 'week' ? '85' : '342'} 趟
          </Text>
        </View>
        <View style={styles.earningsDetailItem}>
          <IconSymbol name="clock" size={16} color={colors.primary} />
          <Text style={styles.earningsDetailText}>
            {selectedPeriod === 'today' ? '8.5' : selectedPeriod === 'week' ? '42' : '168'} 小時
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <IconSymbol name="star.fill" size={24} color="#FFD700" />
        <Text style={styles.statValue}>{earningsData.averageRating}</Text>
        <Text style={styles.statLabel}>平均評分</Text>
      </View>
      <View style={styles.statCard}>
        <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
        <Text style={styles.statValue}>{earningsData.completionRate}%</Text>
        <Text style={styles.statLabel}>完成率</Text>
      </View>
      <View style={styles.statCard}>
        <IconSymbol name="car.fill" size={24} color={colors.primary} />
        <Text style={styles.statValue}>{earningsData.totalRides}</Text>
        <Text style={styles.statLabel}>總趟數</Text>
      </View>
    </View>
  );

  const renderRideHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>最近行程</Text>
      {rideHistory.map((ride) => (
        <View key={ride.id} style={styles.historyItem}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTime}>{ride.time}</Text>
            <Text style={styles.historyFare}>NT${ride.fare}</Text>
          </View>
          <View style={styles.historyRoute}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
              <Text style={styles.routeText}>{ride.from}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
              <Text style={styles.routeText}>{ride.to}</Text>
            </View>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyDetailText}>{ride.distance} • {ride.duration}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "收入統計",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderPeriodSelector()}
        {renderEarningsCard()}
        {renderStatsCards()}
        {renderRideHistory()}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  earningsCard: {
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  earningsLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 16,
  },
  earningsDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  earningsDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  historyContainer: {
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    ...commonStyles.shadow,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyFare: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  historyRoute: {
    marginBottom: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeLine: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
  },
  historyDetails: {
    alignItems: 'flex-end',
  },
  historyDetailText: {
    fontSize: 12,
    color: colors.textLight,
  },
});
