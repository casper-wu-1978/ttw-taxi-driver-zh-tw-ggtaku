
import * as Location from 'expo-location';
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/button";
import { View, Text, StyleSheet, Pressable, Alert, Dimensions, Platform } from "react-native";
import { WebView } from 'react-native-webview';
import { Stack } from "expo-router";
import WebMap from "@/components/WebMap";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

interface RideRequest {
  id: string;
  passengerName: string;
  pickupAddress: string;
  destinationAddress: string;
  distance: string;
  estimatedFare: string;
  estimatedTime: string;
  timestamp: Date;
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
    marginBottom: 12,
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
  },
  requestHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  rideStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  updateButton: {
    marginTop: 12,
  },
});

function TaxiDriverApp() {
  const { user, profile, driver, signOut } = useAuth();
  const webViewRef = useRef<WebView>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<RideRequest | null>(null);
  const [activeRide, setActiveRide] = useState<any>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Mock incoming request for demo
    if (isOnline && !incomingRequest && !activeRide) {
      const timer = setTimeout(() => {
        setIncomingRequest({
          id: '1',
          passengerName: '王小明',
          pickupAddress: '台北車站',
          destinationAddress: '松山機場',
          distance: '12.5 公里',
          estimatedFare: 'NT$ 350',
          estimatedTime: '25 分鐘',
          timestamp: new Date(),
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, incomingRequest, activeRide]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('權限被拒絕', '需要位置權限才能使用此功能');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('錯誤', '無法獲取當前位置');
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (isOnline) {
      setIncomingRequest(null);
      setActiveRide(null);
    }
  };

  const acceptRideRequest = () => {
    if (incomingRequest) {
      setActiveRide({
        ...incomingRequest,
        status: 'accepted',
        acceptedAt: new Date(),
      });
      setIncomingRequest(null);
    }
  };

  const rejectRideRequest = () => {
    setIncomingRequest(null);
  };

  const updateRideStatus = () => {
    if (activeRide) {
      const statusFlow = ['accepted', 'picking_up', 'arrived', 'in_progress', 'completed'];
      const currentIndex = statusFlow.indexOf(activeRide.status);
      const nextStatus = statusFlow[currentIndex + 1];
      
      if (nextStatus) {
        setActiveRide({ ...activeRide, status: nextStatus });
      } else {
        setActiveRide(null);
      }
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      '登出',
      '確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
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

  const renderStatusCard = () => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
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
        <Text style={styles.requestHeader}>新的叫車請求</Text>
        
        <View style={styles.requestInfo}>
          <Text style={styles.requestLabel}>乘客</Text>
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
          <Text style={styles.requestLabel}>距離 / 預估車資 / 預估時間</Text>
          <Text style={styles.requestValue}>
            {incomingRequest.distance} / {incomingRequest.estimatedFare} / {incomingRequest.estimatedTime}
          </Text>
        </View>

        <View style={styles.requestActions}>
          <Button
            onPress={acceptRideRequest}
            style={styles.acceptButton}
          >
            接受
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
        case 'arrived': return '已到達上車點';
        case 'in_progress': return '行程進行中';
        case 'completed': return '行程已完成';
        default: return status;
      }
    };

    const getNextAction = (status: string) => {
      switch (status) {
        case 'accepted': return '開始前往';
        case 'picking_up': return '已到達';
        case 'arrived': return '開始行程';
        case 'in_progress': return '完成行程';
        default: return '下一步';
      }
    };

    return (
      <View style={styles.rideCard}>
        <Text style={styles.rideHeader}>當前行程</Text>
        <Text style={styles.rideStatus}>{getStatusText(activeRide.status)}</Text>
        
        <View style={styles.requestInfo}>
          <Text style={styles.requestLabel}>乘客</Text>
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

        {activeRide.status !== 'completed' && (
          <Button
            onPress={updateRideStatus}
            style={styles.updateButton}
          >
            {getNextAction(activeRide.status)}
          </Button>
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
        <title>Ttw-Taxi</title>
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
              const marker = new mapboxgl.Marker({ color: '#007AFF' })
                .setLngLat([${currentLocation.lng}, ${currentLocation.lat}])
                .addTo(map);
              
              map.setCenter([${currentLocation.lng}, ${currentLocation.lat}]);
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
          isOnline={isOnline}
        />
      );
    }
    return renderWebMapView();
  };

  const renderMapView = () => {
    return renderMobileMapView();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TTW-TAXI</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {profile?.display_name || user?.email || '用戶'}
          </Text>
          <Text style={styles.userType}>
            {profile?.user_type === 'driver' ? '司機' : '乘客'}
          </Text>
          <Pressable onPress={handleSignOut}>
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
