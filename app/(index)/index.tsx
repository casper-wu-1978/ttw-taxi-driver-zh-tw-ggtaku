
import * as Location from 'expo-location';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/button";
import { View, Text, StyleSheet, Pressable, Alert, Dimensions, Platform, ScrollView } from "react-native";
import { WebView } from 'react-native-webview';
import { Stack } from "expo-router";
import WebMap from "@/components/WebMap";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";

interface RideRequest {
  id: string;
  passengerName: string;
  pickupAddress: string;
  destinationAddress: string;
  distance: string;
  estimatedFare: string;
  estimatedTime: string;
  timestamp: Date;
  pickupLatitude?: number;
  pickupLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
}

interface DriverStats {
  todayEarnings: number;
  todayRides: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  rating: number;
  totalRides: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  userType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  signOutButton: {
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
  },
  statusCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...commonStyles.shadow,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  toggleButton: {
    marginTop: 12,
  },
  requestCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...commonStyles.shadow,
    maxHeight: '60%',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  requestTimer: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  requestScrollView: {
    maxHeight: 200,
  },
  requestInfo: {
    marginBottom: 8,
  },
  requestLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  requestValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  fareHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.success,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.error,
  },
  rideCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...commonStyles.shadow,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  rideStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  updateButton: {
    marginTop: 12,
  },
  emergencyButton: {
    backgroundColor: colors.error,
    marginTop: 8,
  },
  contactButton: {
    backgroundColor: colors.secondary,
    marginTop: 8,
  },
  navigationButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  offlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 18,
    color: colors.surface,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
});

function TaxiDriverApp() {
  const { user, profile, driver, signOut } = useAuth();
  const webViewRef = useRef<WebView>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<RideRequest | null>(null);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [driverStats, setDriverStats] = useState<DriverStats>({
    todayEarnings: 0,
    todayRides: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    rating: 5.0,
    totalRides: 0,
  });
  const [requestTimer, setRequestTimer] = useState(30);

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('權限被拒絕', '需要位置權限才能使用此功能');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setCurrentLocation(coords);

      // 更新司機位置到資料庫
      if (driver?.id) {
        await updateDriverLocation(coords);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('錯誤', '無法獲取當前位置');
    }
  }, [driver?.id]);

  const updateDriverLocation = async (coords: { lat: number; lng: number }) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          current_latitude: coords.lat,
          current_longitude: coords.lng,
          last_location_update: new Date().toISOString(),
        })
        .eq('id', driver?.id);

      if (error) {
        console.error('Error updating driver location:', error);
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  };

  const loadDriverStats = useCallback(async () => {
    try {
      if (!driver?.id) return;

      // 獲取今日收益和行程數
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('driver_financial_records')
        .select('amount')
        .eq('driver_id', driver.id)
        .gte('created_at', today + 'T00:00:00')
        .lt('created_at', today + 'T23:59:59');

      const todayEarnings = todayData?.reduce((sum, record) => sum + record.amount, 0) || 0;

      const { data: todayRides } = await supabase
        .from('bookings')
        .select('id')
        .eq('driver_id', driver.id)
        .eq('status', 'completed')
        .gte('completed_at', today + 'T00:00:00')
        .lt('completed_at', today + 'T23:59:59');

      // 獲取司機評分和總行程數
      const { data: driverData } = await supabase
        .from('drivers')
        .select('rating, total_rides')
        .eq('id', driver.id)
        .single();

      setDriverStats({
        todayEarnings,
        todayRides: todayRides?.length || 0,
        weeklyEarnings: 0, // 可以進一步實現
        monthlyEarnings: 0, // 可以進一步實現
        rating: driverData?.rating || 5.0,
        totalRides: driverData?.total_rides || 0,
      });
    } catch (error) {
      console.error('Error loading driver stats:', error);
    }
  }, [driver?.id]);

  useEffect(() => {
    getCurrentLocation();
    loadDriverStats();
  }, [getCurrentLocation, loadDriverStats]);

  useEffect(() => {
    // 模擬接收叫車請求
    if (isOnline && !incomingRequest && !activeRide) {
      const timer = setTimeout(() => {
        setIncomingRequest({
          id: '1',
          passengerName: '王小明',
          pickupAddress: '台北車站 1號出口',
          destinationAddress: '松山機場 第一航廈',
          distance: '12.5 公里',
          estimatedFare: 'NT$ 350',
          estimatedTime: '25 分鐘',
          timestamp: new Date(),
          pickupLatitude: 25.0478,
          pickupLongitude: 121.5170,
          destinationLatitude: 25.0697,
          destinationLongitude: 121.5514,
        });
        setRequestTimer(30);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, incomingRequest, activeRide]);

  useEffect(() => {
    // 請求倒計時
    if (incomingRequest && requestTimer > 0) {
      const timer = setTimeout(() => {
        setRequestTimer(requestTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (incomingRequest && requestTimer === 0) {
      // 自動拒絕超時請求
      setIncomingRequest(null);
      Alert.alert('請求超時', '叫車請求已超時，自動拒絕');
    }
  }, [incomingRequest, requestTimer]);

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = isOnline ? 'offline' : 'online';
      
      if (driver?.id) {
        const { error } = await supabase
          .from('drivers')
          .update({ status: newStatus })
          .eq('id', driver.id);

        if (error) {
          console.error('Error updating driver status:', error);
          Alert.alert('錯誤', '無法更新狀態，請稍後再試');
          return;
        }
      }

      setIsOnline(!isOnline);
      if (isOnline) {
        setIncomingRequest(null);
        setActiveRide(null);
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      Alert.alert('錯誤', '無法更新狀態，請稍後再試');
    }
  };

  const acceptRideRequest = async () => {
    if (incomingRequest && driver?.id) {
      try {
        // 在實際應用中，這裡會更新資料庫中的訂單狀態
        const { error } = await supabase
          .from('bookings')
          .update({
            driver_id: driver.id,
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .eq('id', incomingRequest.id);

        if (error) {
          console.error('Error accepting ride:', error);
          Alert.alert('錯誤', '接受訂單失敗，請稍後再試');
          return;
        }

        setActiveRide({
          ...incomingRequest,
          status: 'accepted',
          acceptedAt: new Date(),
        });
        setIncomingRequest(null);
        Alert.alert('成功', '已接受叫車請求');
      } catch (error) {
        console.error('Error accepting ride:', error);
        Alert.alert('錯誤', '接受訂單失敗，請稍後再試');
      }
    }
  };

  const rejectRideRequest = () => {
    setIncomingRequest(null);
    Alert.alert('已拒絕', '已拒絕此叫車請求');
  };

  const updateRideStatus = async () => {
    if (activeRide) {
      const statusFlow = ['accepted', 'picking_up', 'driver_arrived', 'passenger_on_board', 'completed'];
      const currentIndex = statusFlow.indexOf(activeRide.status);
      const nextStatus = statusFlow[currentIndex + 1];
      
      if (nextStatus) {
        try {
          // 更新資料庫中的訂單狀態
          const updateData: any = { status: nextStatus };
          
          if (nextStatus === 'driver_arrived') {
            updateData.driver_arrived_at = new Date().toISOString();
          } else if (nextStatus === 'passenger_on_board') {
            updateData.pickup_at = new Date().toISOString();
          } else if (nextStatus === 'completed') {
            updateData.completed_at = new Date().toISOString();
          }

          const { error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', activeRide.id);

          if (error) {
            console.error('Error updating ride status:', error);
            Alert.alert('錯誤', '更新狀態失敗，請稍後再試');
            return;
          }

          setActiveRide({ ...activeRide, status: nextStatus });
          
          if (nextStatus === 'completed') {
            Alert.alert('行程完成', '行程已完成，感謝您的服務！');
            loadDriverStats(); // 重新載入統計數據
            setTimeout(() => setActiveRide(null), 2000);
          }
        } catch (error) {
          console.error('Error updating ride status:', error);
          Alert.alert('錯誤', '更新狀態失敗，請稍後再試');
        }
      }
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      '緊急求助',
      '確定要發送緊急求助嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            // 在實際應用中，這裡會發送緊急求助信號
            Alert.alert('已發送', '緊急求助信號已發送，客服將盡快聯繫您');
          },
        },
      ]
    );
  };

  const handleContactPassenger = () => {
    Alert.alert('聯繫乘客', '功能開發中，敬請期待');
  };

  const handleNavigation = () => {
    Alert.alert('導航', '功能開發中，敬請期待');
  };

  const handleSignOut = async () => {
    Alert.alert(
      '登出',
      '確定要登出嗎？登出後將自動下線。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            // 先下線
            if (isOnline && driver?.id) {
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

  const renderStatusCard = () => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? colors.success : colors.error },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? '線上接單中' : '離線'}
          </Text>
        </View>
        <Text style={styles.statValue}>
          ⭐ {driverStats.rating.toFixed(1)}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>NT$ {driverStats.todayEarnings}</Text>
          <Text style={styles.statLabel}>今日收益</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driverStats.todayRides}</Text>
          <Text style={styles.statLabel}>今日行程</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driverStats.totalRides}</Text>
          <Text style={styles.statLabel}>總行程</Text>
        </View>
      </View>

      <Button
        onPress={toggleOnlineStatus}
        variant={isOnline ? "secondary" : "primary"}
        style={styles.toggleButton}
      >
        {isOnline ? '下線' : '上線'}
      </Button>
    </View>
  );

  const renderIncomingRequest = () => {
    if (!incomingRequest) return null;

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>新的叫車請求</Text>
          <Text style={styles.requestTimer}>{requestTimer}秒</Text>
        </View>
        
        <ScrollView style={styles.requestScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.requestInfo}>
            <Text style={styles.requestLabel}>乘客姓名</Text>
            <Text style={styles.requestValue}>{incomingRequest.passengerName}</Text>
          </View>
          
          <View style={styles.requestInfo}>
            <Text style={styles.requestLabel}>上車地點</Text>
            <Text style={styles.requestValue}>{incomingRequest.pickupAddress}</Text>
          </View>
          
          <View style={styles.requestInfo}>
            <Text style={styles.requestLabel}>目的地</Text>
            <Text style={styles.requestValue}>{incomingRequest.destinationAddress}</Text>
          </View>
          
          <View style={styles.requestInfo}>
            <Text style={styles.requestLabel}>距離</Text>
            <Text style={styles.requestValue}>{incomingRequest.distance}</Text>
          </View>

          <View style={styles.requestInfo}>
            <Text style={styles.requestLabel}>預估車資</Text>
            <Text style={[styles.requestValue, styles.fareHighlight]}>
              {incomingRequest.estimatedFare}
            </Text>
          </View>
          
          <View style={styles.requestInfo}>
            <Text style={styles.requestLabel}>預估時間</Text>
            <Text style={styles.requestValue}>{incomingRequest.estimatedTime}</Text>
          </View>
        </ScrollView>

        <View style={styles.requestActions}>
          <Button
            onPress={acceptRideRequest}
            style={styles.acceptButton}
          >
            接受訂單
          </Button>
          <Button
            onPress={rejectRideRequest}
            variant="secondary"
            style={styles.rejectButton}
          >
            拒絕
          </Button>
        </View>
      </View>
    );
  };

  const renderActiveRide = () => {
    if (!activeRide) return null;

    const getStatusText = (status: string) => {
      switch (status) {
        case 'accepted': return '已接受訂單';
        case 'picking_up': return '前往接客';
        case 'driver_arrived': return '已到達上車點';
        case 'passenger_on_board': return '行程進行中';
        case 'completed': return '行程已完成';
        default: return status;
      }
    };

    const getNextAction = (status: string) => {
      switch (status) {
        case 'accepted': return '開始前往';
        case 'picking_up': return '已到達上車點';
        case 'driver_arrived': return '乘客已上車';
        case 'passenger_on_board': return '完成行程';
        default: return '下一步';
      }
    };

    return (
      <View style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <Text style={styles.rideTitle}>當前行程</Text>
          <Text style={styles.rideStatus}>{getStatusText(activeRide.status)}</Text>
        </View>
        
        <View style={styles.requestInfo}>
          <Text style={styles.requestLabel}>乘客姓名</Text>
          <Text style={styles.requestValue}>{activeRide.passengerName}</Text>
        </View>
        
        <View style={styles.requestInfo}>
          <Text style={styles.requestLabel}>上車地點</Text>
          <Text style={styles.requestValue}>{activeRide.pickupAddress}</Text>
        </View>
        
        <View style={styles.requestInfo}>
          <Text style={styles.requestLabel}>目的地</Text>
          <Text style={styles.requestValue}>{activeRide.destinationAddress}</Text>
        </View>

        <View style={styles.requestInfo}>
          <Text style={styles.requestLabel}>預估車資</Text>
          <Text style={[styles.requestValue, styles.fareHighlight]}>
            {activeRide.estimatedFare}
          </Text>
        </View>

        {activeRide.status !== 'completed' && (
          <>
            <Button
              onPress={updateRideStatus}
              style={styles.updateButton}
            >
              {getNextAction(activeRide.status)}
            </Button>
            
            <Button
              onPress={handleNavigation}
              variant="secondary"
              style={styles.navigationButton}
            >
              📍 開啟導航
            </Button>
            
            <Button
              onPress={handleContactPassenger}
              variant="secondary"
              style={styles.contactButton}
            >
              📞 聯繫乘客
            </Button>
            
            <Button
              onPress={handleEmergency}
              variant="secondary"
              style={styles.emergencyButton}
            >
              🚨 緊急求助
            </Button>
          </>
        )}
      </View>
    );
  };

  const renderWebMapView = () => {
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TTW-TAXI 司機端</title>
        <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          mapboxgl.accessToken = 'pk.eyJ1IjoiY2FzcGVyNjciLCJhIjoiY205Y2FoMDIyMHNpYjJ5b2V5dGE2MmJnbyJ9.yzckI6SXN3-Fl_5-llEYzQ';
          
          const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [121.5654, 25.0330],
            zoom: 13
          });

          map.on('load', () => {
            ${currentLocation ? `
              // 司機位置標記
              const driverMarker = new mapboxgl.Marker({ 
                color: '${isOnline ? '#34C759' : '#FF3B30'}',
                scale: 1.2
              })
                .setLngLat([${currentLocation.lng}, ${currentLocation.lat}])
                .addTo(map);
              
              map.setCenter([${currentLocation.lng}, ${currentLocation.lat}]);
            ` : ''}

            ${activeRide && activeRide.pickupLatitude && activeRide.pickupLongitude ? `
              // 上車點標記
              const pickupMarker = new mapboxgl.Marker({ color: '#007AFF' })
                .setLngLat([${activeRide.pickupLongitude}, ${activeRide.pickupLatitude}])
                .addTo(map);
            ` : ''}

            ${activeRide && activeRide.destinationLatitude && activeRide.destinationLongitude ? `
              // 目的地標記
              const destMarker = new mapboxgl.Marker({ color: '#FF9500' })
                .setLngLat([${activeRide.destinationLongitude}, ${activeRide.destinationLatitude}])
                .addTo(map);
            ` : ''}
          });
        </script>
      </body>
      </html>
    `;

    return (
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
        }}
      />
    );
  };

  const renderMobileMapView = () => {
    if (Platform.OS === 'web') {
      return (
        <WebMap
          currentCoords={currentLocation}
          pickupLocation={activeRide?.pickupLatitude && activeRide?.pickupLongitude ? {
            lat: activeRide.pickupLatitude,
            lng: activeRide.pickupLongitude
          } : null}
          destinationLocation={activeRide?.destinationLatitude && activeRide?.destinationLongitude ? {
            lat: activeRide.destinationLatitude,
            lng: activeRide.destinationLongitude
          } : null}
          isOnline={isOnline}
        />
      );
    }
    return renderWebMapView();
  };

  const renderMapView = () => {
    return (
      <>
        {renderMobileMapView()}
        {!isOnline && (
          <View style={styles.offlineOverlay}>
            <Text style={styles.offlineText}>
              您目前處於離線狀態{'\n'}點擊上線開始接單
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TTW-TAXI 司機端</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {driver?.display_name || profile?.display_name || user?.email || '司機'}
          </Text>
          <Text style={styles.userType}>
            {driver?.vehicle_type || '計程車司機'}
          </Text>
          <Pressable onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="power" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {renderMapView()}
        {renderStatusCard()}
        {renderIncomingRequest()}
        {renderActiveRide()}
      </View>
    </View>
  );
}

export default function ProtectedTaxiDriverApp() {
  return (
    <AuthGuard>
      <TaxiDriverApp />
    </AuthGuard>
  );
}
