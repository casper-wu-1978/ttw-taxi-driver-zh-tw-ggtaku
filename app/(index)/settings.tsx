
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from "react-native";
import { Button } from "@/components/button";
import React, { useState } from "react";
import { Stack } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

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
  profileSection: {
    padding: 20,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  profileType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  settingAction: {
    marginLeft: 8,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: colors.error,
  },
});

function SettingsScreen() {
  const { user, profile, driver, signOut, updateProfile } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notifications_enabled ?? true
  );
  const [locationSharing, setLocationSharing] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      '登出確認',
      '確定要登出嗎？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('錯誤', '登出失敗，請稍後再試');
            }
          },
        },
      ]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (updateProfile) {
      const { error } = await updateProfile({ notifications_enabled: value });
      if (error) {
        console.error('Error updating notifications setting:', error);
        setNotificationsEnabled(!value); // Revert on error
        Alert.alert('錯誤', '更新設定失敗');
      }
    }
  };

  const renderDriverProfile = () => {
    const displayName = profile?.display_name || user?.email || '用戶';
    const initials = displayName.charAt(0).toUpperCase();

    return (
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileType}>
              {profile?.user_type === 'driver' ? '司機' : '乘客'}
            </Text>
          </View>
        </View>
        
        {profile?.user_type === 'driver' && driver && (
          <View>
            <Text style={styles.settingSubtitle}>
              評分: {driver.rating?.toFixed(1) || '5.0'} ⭐ | 
              總行程: {driver.total_rides || 0} | 
              狀態: {driver.status === 'online' ? '線上' : '離線'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    action?: React.ReactNode,
    onPress?: () => void,
    isLast?: boolean
  ) => (
    <Pressable
      style={[styles.settingItem, isLast && styles.settingItemLast]}
      onPress={onPress}
      disabled={!onPress}
    >
      <IconSymbol name={icon} size={20} color={colors.primary} style={styles.settingIcon} />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {action && <View style={styles.settingAction}>{action}</View>}
      {onPress && !action && (
        <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
        <Text style={styles.headerSubtitle}>管理您的帳號和應用程式設定</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderDriverProfile()}

        {renderSettingsSection(
          '通知設定',
          <>
            {renderSettingItem(
              'bell',
              '推播通知',
              '接收新訂單和重要訊息',
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />,
              undefined,
              false
            )}
            {renderSettingItem(
              'location',
              '位置分享',
              '允許乘客查看您的位置',
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />,
              undefined,
              true
            )}
          </>
        )}

        {renderSettingsSection(
          '帳號管理',
          <>
            {renderSettingItem(
              'person.circle',
              '個人資料',
              '編輯您的個人資訊',
              undefined,
              () => Alert.alert('功能開發中', '此功能正在開發中'),
              false
            )}
            {renderSettingItem(
              'key',
              '更改密碼',
              '更新您的登入密碼',
              undefined,
              () => Alert.alert('功能開發中', '此功能正在開發中'),
              false
            )}
            {renderSettingItem(
              'creditcard',
              '付款方式',
              '管理您的付款資訊',
              undefined,
              () => Alert.alert('功能開發中', '此功能正在開發中'),
              true
            )}
          </>
        )}

        {profile?.user_type === 'driver' && renderSettingsSection(
          '司機設定',
          <>
            {renderSettingItem(
              'car',
              '車輛資訊',
              '管理您的車輛資料',
              undefined,
              () => Alert.alert('功能開發中', '此功能正在開發中'),
              false
            )}
            {renderSettingItem(
              'doc.text',
              '證件管理',
              '上傳和管理駕照等證件',
              undefined,
              () => Alert.alert('功能開發中', '此功能正在開發中'),
              true
            )}
          </>
        )}

        {renderSettingsSection(
          '應用程式',
          <>
            {renderSettingItem(
              'questionmark.circle',
              '幫助與支援',
              '常見問題和客服聯絡',
              undefined,
              () => Alert.alert('功能開發中', '此功能正在開發中'),
              false
            )}
            {renderSettingItem(
              'info.circle',
              '關於應用程式',
              '版本資訊和使用條款',
              undefined,
              () => Alert.alert('關於', 'TTW-TAXI v1.0.0\n司機端應用程式'),
              false
            )}
            {renderSettingItem(
              'star',
              '評價應用程式',
              '在應用程式商店給我們評分',
              undefined,
              () => Alert.alert('功能開發中', '此功能正在開發中'),
              true
            )}
          </>
        )}

        <Button
          onPress={handleLogout}
          style={styles.logoutButton}
          variant="primary"
        >
          登出
        </Button>
      </ScrollView>
    </View>
  );
}

export default function ProtectedSettingsScreen() {
  return (
    <AuthGuard>
      <SettingsScreen />
    </AuthGuard>
  );
}
