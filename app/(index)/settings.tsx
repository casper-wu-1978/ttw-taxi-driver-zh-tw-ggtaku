
import React, { useState } from "react";
import { Stack } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { Button } from "@/components/button";
import { colors, commonStyles } from "@/styles/commonStyles";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const driverInfo = {
    name: "張志明",
    licenseNumber: "TXI-2024-001",
    vehicleModel: "Toyota Camry",
    plateNumber: "ABC-1234",
    rating: 4.8,
    totalTrips: 1256,
    joinDate: "2023年3月"
  };

  const handleLogout = () => {
    Alert.alert(
      "確認登出",
      "您確定要登出嗎？",
      [
        { text: "取消", style: "cancel" },
        { text: "登出", style: "destructive", onPress: () => console.log("Logged out") }
      ]
    );
  };

  const renderDriverProfile = () => (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <IconSymbol name="person.circle.fill" size={60} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.driverName}>{driverInfo.name}</Text>
          <Text style={styles.licenseNumber}>執照號碼：{driverInfo.licenseNumber}</Text>
          <View style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{driverInfo.rating}</Text>
            <Text style={styles.tripCount}>({driverInfo.totalTrips} 趟)</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleTitle}>車輛資訊</Text>
        <Text style={styles.vehicleDetail}>{driverInfo.vehicleModel}</Text>
        <Text style={styles.vehicleDetail}>車牌：{driverInfo.plateNumber}</Text>
        <Text style={styles.joinDate}>加入時間：{driverInfo.joinDate}</Text>
      </View>
    </View>
  );

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    rightComponent?: React.ReactNode,
    onPress?: () => void
  ) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <IconSymbol name={icon as any} size={20} color={colors.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent && (
        <View style={styles.settingRight}>
          {rightComponent}
        </View>
      )}
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "設定",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderDriverProfile()}

        {renderSettingsSection("通知設定", (
          <>
            {renderSettingItem(
              "bell",
              "推播通知",
              "接收新訂單和系統通知",
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              "speaker.wave.2",
              "聲音提醒",
              "新訂單聲音提醒",
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              "iphone.radiowaves.left.and.right",
              "震動提醒",
              "新訂單震動提醒",
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            )}
          </>
        ))}

        {renderSettingsSection("接單設定", (
          <>
            {renderSettingItem(
              "checkmark.circle",
              "自動接單",
              "符合條件的訂單自動接受",
              <Switch
                value={autoAccept}
                onValueChange={setAutoAccept}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              "slider.horizontal.3",
              "接單範圍",
              "目前設定：3公里",
              <IconSymbol name="chevron.right" size={16} color={colors.textLight} />,
              () => Alert.alert("設定接單範圍", "此功能開發中")
            )}
            {renderSettingItem(
              "clock",
              "工作時間",
              "設定偏好的工作時段",
              <IconSymbol name="chevron.right" size={16} color={colors.textLight} />,
              () => Alert.alert("設定工作時間", "此功能開發中")
            )}
          </>
        ))}

        {renderSettingsSection("帳戶管理", (
          <>
            {renderSettingItem(
              "person.crop.circle",
              "個人資料",
              "編輯個人和車輛資訊",
              <IconSymbol name="chevron.right" size={16} color={colors.textLight} />,
              () => Alert.alert("個人資料", "此功能開發中")
            )}
            {renderSettingItem(
              "creditcard",
              "收款設定",
              "管理收款方式",
              <IconSymbol name="chevron.right" size={16} color={colors.textLight} />,
              () => Alert.alert("收款設定", "此功能開發中")
            )}
            {renderSettingItem(
              "doc.text",
              "證件管理",
              "上傳和更新證件",
              <IconSymbol name="chevron.right" size={16} color={colors.textLight} />,
              () => Alert.alert("證件管理", "此功能開發中")
            )}
          </>
        ))}

        {renderSettingsSection("其他", (
          <>
            {renderSettingItem(
              "questionmark.circle",
              "幫助中心",
              "常見問題和客服聯絡",
              <IconSymbol name="chevron.right" size={16} color={colors.textLight} />,
              () => Alert.alert("幫助中心", "此功能開發中")
            )}
            {renderSettingItem(
              "info.circle",
              "關於我們",
              "版本資訊和服務條款",
              <IconSymbol name="chevron.right" size={16} color={colors.textLight} />,
              () => Alert.alert("關於我們", "TTW-TAXI 司機端 v1.0.0")
            )}
          </>
        ))}

        <View style={styles.logoutContainer}>
          <Button
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          >
            登出
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    ...commonStyles.shadow,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  licenseNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
    marginRight: 8,
  },
  tripCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  vehicleInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  vehicleDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
  },
  settingsSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...commonStyles.shadow,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  settingRight: {
    marginLeft: 16,
  },
  logoutContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
