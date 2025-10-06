
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, TextInput, RefreshControl } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/button";
import React, { useState, useEffect, useCallback } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Stack } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { supabase } from "@/lib/supabase";

interface DriverProfile {
  display_name: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate: string;
  vehicle_model: string;
  vehicle_color: string;
  license_number: string;
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
  profileSection: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    ...commonStyles.shadow,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    ...commonStyles.shadow,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  settingValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.error,
    margin: 20,
    borderRadius: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  statsCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

function SettingsScreen() {
  const { user, profile, driver, signOut, updateProfile, refreshUserData } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<DriverProfile>({
    display_name: '',
    phone: '',
    vehicle_type: '',
    vehicle_plate: '',
    vehicle_model: '',
    vehicle_color: '',
    license_number: '',
  });
  const [driverStats, setDriverStats] = useState({
    rating: 5.0,
    totalRides: 0,
    completionRate: 100,
    totalEarnings: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadDriverData = useCallback(() => {
    console.log('Loading driver data:', {
      hasDriver: !!driver,
      driverName: driver?.display_name,
      driverPhone: driver?.phone,
      vehicleInfo: {
        type: driver?.vehicle_type,
        plate: driver?.vehicle_plate,
        model: driver?.vehicle_model,
        color: driver?.vehicle_color
      }
    });

    if (driver) {
      setEditingProfile({
        display_name: driver.display_name || '',
        phone: driver.phone || '',
        vehicle_type: driver.vehicle_type || '',
        vehicle_plate: driver.vehicle_plate || '',
        vehicle_model: driver.vehicle_model || '',
        vehicle_color: driver.vehicle_color || '',
        license_number: driver.license_number || '',
      });
    }
    
    if (profile) {
      setNotificationsEnabled(profile.notifications_enabled);
    }
  }, [driver, profile]);

  const loadDriverStats = useCallback(async () => {
    if (!driver?.id) return;

    try {
      // 獲取司機統計數據
      const { data: driverData } = await supabase
        .from('drivers')
        .select('rating, total_rides')
        .eq('id', driver.id)
        .single();

      // 獲取總收益
      const { data: earningsData } = await supabase
        .from('driver_financial_records')
        .select('amount')
        .eq('driver_id', driver.id)
        .eq('transaction_type', 'earning');

      const totalEarnings = earningsData?.reduce((sum, record) => sum + record.amount, 0) || 0;

      // 計算完成率
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

      setDriverStats({
        rating: driverData?.rating || 5.0,
        totalRides: driverData?.total_rides || 0,
        completionRate,
        totalEarnings,
      });
    } catch (error) {
      console.error('Error loading driver stats:', error);
    }
  }, [driver?.id]);

  useEffect(() => {
    loadDriverData();
    loadDriverStats();
  }, [loadDriverData, loadDriverStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
      await loadDriverStats();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData, loadDriverStats]);

  const handleLogout = () => {
    Alert.alert(
      '登出確認',
      '確定要登出嗎？登出後將自動下線。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            // 先將司機狀態設為離線
            if (driver?.id) {
              await supabase
                .from('drivers')
                .update({ status: 'offline' })
                .eq('id', driver.id);
            }
            
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
    
    if (profile) {
      const { error } = await updateProfile({
        notifications_enabled: value,
      });
      
      if (error) {
        Alert.alert('錯誤', '更新設定失敗');
        setNotificationsEnabled(!value); // 回復原狀態
      }
    }
  };

  const handleAutoAcceptToggle = (value: boolean) => {
    setAutoAcceptEnabled(value);
    // 這裡可以保存到本地存儲或資料庫
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (driver?.id) {
        // 更新現有司機資料
        console.log('Updating driver profile with data:', editingProfile);
        
        const { error } = await supabase
          .from('drivers')
          .update({
            display_name: editingProfile.display_name,
            phone: editingProfile.phone,
            vehicle_type: editingProfile.vehicle_type,
            vehicle_plate: editingProfile.vehicle_plate,
            vehicle_model: editingProfile.vehicle_model,
            vehicle_color: editingProfile.vehicle_color,
            license_number: editingProfile.license_number,
            updated_at: new Date().toISOString(),
          })
          .eq('id', driver.id);

        if (error) {
          console.error('Database update error:', error);
          Alert.alert('錯誤', '更新資料失敗，請稍後再試');
          return;
        }

        // 重新載入用戶資料以反映更新
        await refreshUserData();
        
        Alert.alert('成功', '個人資料已更新');
        setShowEditModal(false);
      } else if (user?.id) {
        // 創建新的司機資料
        console.log('Creating new driver profile with data:', editingProfile);
        
        const { error } = await supabase
          .from('drivers')
          .insert([{
            auth_user_id: user.id,
            line_user_id: `driver_${user.id}`,
            display_name: editingProfile.display_name,
            phone: editingProfile.phone,
            vehicle_type: editingProfile.vehicle_type,
            vehicle_plate: editingProfile.vehicle_plate,
            vehicle_model: editingProfile.vehicle_model,
            vehicle_color: editingProfile.vehicle_color,
            license_number: editingProfile.license_number,
            status: 'offline',
            rating: 5.0,
            total_rides: 0,
          }]);

        if (error) {
          console.error('Database insert error:', error);
          Alert.alert('錯誤', '創建司機資料失敗，請稍後再試');
          return;
        }

        // 重新載入用戶資料以反映更新
        await refreshUserData();
        
        Alert.alert('成功', '司機資料已創建');
        setShowEditModal(false);
      } else {
        Alert.alert('錯誤', '找不到用戶資料');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('錯誤', '儲存資料失敗，請稍後再試');
    }
  };

  const renderDriverProfile = () => {
    if (!driver) {
      return (
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.display_name || '司機')[0]}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.display_name || '未設定姓名'}
              </Text>
              <Text style={styles.profileDetails}>
                司機資料尚未建立
              </Text>
              <Text style={styles.profileDetails}>
                請點擊編輯按鈕完善個人資料
              </Text>
            </View>
            <Pressable style={styles.editButton} onPress={handleEditProfile}>
              <Text style={styles.editButtonText}>編輯</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(driver?.display_name || profile?.display_name || '司機')[0]}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {driver?.display_name || profile?.display_name || '未設定姓名'}
            </Text>
            <Text style={styles.profileDetails}>
              電話: {driver?.phone || '未設定'}
            </Text>
            <Text style={styles.profileDetails}>
              {driver?.vehicle_type || '計程車'} • {driver?.vehicle_plate || '未設定車牌'}
            </Text>
            <Text style={styles.profileDetails}>
              {driver?.vehicle_model || '未設定車型'} • {driver?.vehicle_color || '未設定顏色'}
            </Text>
            <Text style={styles.profileDetails}>
              評分: ⭐ {driverStats.rating.toFixed(1)} • 總行程: {driverStats.totalRides}
            </Text>
          </View>
          <Pressable style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>編輯</Text>
          </Pressable>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>完成率</Text>
            <Text style={styles.statsValue}>{driverStats.completionRate}%</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>總收益</Text>
            <Text style={styles.statsValue}>NT$ {driverStats.totalEarnings.toLocaleString()}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>駕照號碼</Text>
            <Text style={styles.statsValue}>{driver?.license_number || '未設定'}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>車輛資訊</Text>
            <Text style={styles.statsValue}>
              {driver?.vehicle_type || '未設定'} - {driver?.vehicle_plate || '未設定車牌'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    value?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    isLast?: boolean
  ) => (
    <Pressable
      style={[styles.settingItem, isLast && styles.settingItemLast]}
      onPress={onPress}
    >
      <IconSymbol name={icon} size={20} color={colors.primary} style={styles.settingIcon} />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {rightComponent}
    </Pressable>
  );

  const renderEditModal = () => {
    if (!showEditModal) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>編輯個人資料</Text>
          
          <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>姓名</Text>
              <TextInput
                style={styles.input}
                value={editingProfile.display_name}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, display_name: text }))}
                placeholder="請輸入姓名"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>電話</Text>
              <TextInput
                style={styles.input}
                value={editingProfile.phone}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, phone: text }))}
                placeholder="請輸入電話號碼"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>車輛類型</Text>
              <TextInput
                style={styles.input}
                value={editingProfile.vehicle_type}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, vehicle_type: text }))}
                placeholder="例如：計程車、轎車"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>車牌號碼</Text>
              <TextInput
                style={styles.input}
                value={editingProfile.vehicle_plate}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, vehicle_plate: text }))}
                placeholder="請輸入車牌號碼"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>車輛型號</Text>
              <TextInput
                style={styles.input}
                value={editingProfile.vehicle_model}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, vehicle_model: text }))}
                placeholder="例如：Toyota Camry"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>車輛顏色</Text>
              <TextInput
                style={styles.input}
                value={editingProfile.vehicle_color}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, vehicle_color: text }))}
                placeholder="例如：白色、黑色"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>駕照號碼</Text>
              <TextInput
                style={styles.input}
                value={editingProfile.license_number}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, license_number: text }))}
                placeholder="請輸入駕照號碼"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              onPress={() => setShowEditModal(false)}
              variant="secondary"
              style={styles.cancelButton}
            >
              取消
            </Button>
            <Button
              onPress={handleSaveProfile}
              style={styles.saveButton}
            >
              儲存
            </Button>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderDriverProfile()}

        {renderSettingsSection(
          '通知設定',
          <>
            {renderSettingItem(
              'bell',
              '推播通知',
              '接收新訂單和重要訊息通知',
              undefined,
              undefined,
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            )}
            {renderSettingItem(
              'checkmark.circle',
              '自動接單',
              '符合條件的訂單自動接受',
              undefined,
              undefined,
              <Switch
                value={autoAcceptEnabled}
                onValueChange={handleAutoAcceptToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />,
              true
            )}
          </>
        )}

        {renderSettingsSection(
          '司機資料總覽',
          <>
            {renderSettingItem(
              'person.circle',
              '姓名',
              '司機姓名',
              driver?.display_name || '未設定'
            )}
            {renderSettingItem(
              'phone',
              '電話',
              '聯絡電話',
              driver?.phone || '未設定'
            )}
            {renderSettingItem(
              'car',
              '車輛類型',
              '車輛種類',
              driver?.vehicle_type || '未設定'
            )}
            {renderSettingItem(
              'number',
              '車牌號碼',
              '車輛牌照',
              driver?.vehicle_plate || '未設定'
            )}
            {renderSettingItem(
              'car.fill',
              '車輛型號',
              '車輛品牌型號',
              driver?.vehicle_model || '未設定'
            )}
            {renderSettingItem(
              'paintbrush',
              '車輛顏色',
              '車身顏色',
              driver?.vehicle_color || '未設定'
            )}
            {renderSettingItem(
              'doc.text',
              '駕照號碼',
              '駕駛執照編號',
              driver?.license_number || '未設定',
              undefined,
              undefined,
              true
            )}
          </>
        )}

        {renderSettingsSection(
          '帳戶管理',
          <>
            {renderSettingItem(
              'person.circle',
              '編輯個人資料',
              '修改個人和車輛資訊',
              undefined,
              handleEditProfile
            )}
            {renderSettingItem(
              'creditcard',
              '收款設定',
              '設定收款方式和帳戶',
              undefined,
              () => Alert.alert('功能開發中', '此功能正在開發中，敬請期待')
            )}
            {renderSettingItem(
              'doc.text',
              '服務條款',
              '查看使用條款和隱私政策',
              undefined,
              () => Alert.alert('服務條款', '功能開發中，敬請期待'),
              undefined,
              true
            )}
          </>
        )}

        {renderSettingsSection(
          '支援與回饋',
          <>
            {renderSettingItem(
              'questionmark.circle',
              '幫助中心',
              '常見問題和使用說明',
              undefined,
              () => Alert.alert('幫助中心', '功能開發中，敬請期待')
            )}
            {renderSettingItem(
              'phone',
              '聯繫客服',
              '24小時客服熱線',
              '0800-123-456',
              () => Alert.alert('客服電話', '0800-123-456\n\n服務時間：24小時')
            )}
            {renderSettingItem(
              'star',
              '評價應用',
              '給我們評分和建議',
              undefined,
              () => Alert.alert('評價應用', '感謝您的支持！'),
              undefined,
              true
            )}
          </>
        )}

        <Button
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          登出
        </Button>
      </ScrollView>

      {renderEditModal()}
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
