
import React, { useState, useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { View, Text, StyleSheet, Pressable, Alert, Dimensions } from "react-native";
import { WebView } from 'react-native-webview';
import { IconSymbol } from "@/components/IconSymbol";
import { Button } from "@/components/button";
import { colors, commonStyles } from "@/styles/commonStyles";
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

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

export default function TaxiDriverApp() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("正在定位中...");
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<RideRequest | null>(null);
  const [rideStatus, setRideStatus] = useState<'idle' | 'heading_to_pickup' | 'passenger_onboard' | 'completed'>('idle');
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Mock ride request for demo
  const mockRideRequest: RideRequest = {
    id: "R001",
    passengerName: "王小明",
    pickupAddress: "台北市信義區信義路五段7號",
    destinationAddress: "台北市大安區敦化南路二段216號",
    distance: "3.2公里",
    estimatedFare: "NT$180",
    estimatedTime: "12分鐘",
    timestamp: new Date()
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Simulate incoming ride request when online
    if (isOnline && !incomingRequest && !activeRide) {
      const timer = setTimeout(() => {
        setIncomingRequest(mockRideRequest);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, incomingRequest, activeRide]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation("無法取得位置權限");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };
      setCurrentCoords(coords);
      
      // Update map center when location is obtained
      if (webViewRef.current) {
        const updateMapScript = `
          if (window.map) {
            window.map.setCenter([${coords.lng}, ${coords.lat}]);
            if (window.driverMarker) {
              window.driverMarker.setLngLat([${coords.lng}, ${coords.lat}]);
            } else {
              window.driverMarker = new mapboxgl.Marker({ color: '#2196F3' })
                .setLngLat([${coords.lng}, ${coords.lat}])
                .addTo(window.map);
            }
          }
          true;
        `;
        webViewRef.current.injectJavaScript(updateMapScript);
      }
      
      // Mock address for demo - in real app, you'd reverse geocode
      setCurrentLocation("台北市中正區重慶南路一段122號");
    } catch (error) {
      console.log('Location error:', error);
      setCurrentLocation("定位失敗");
      // Default to Taipei coordinates
      setCurrentCoords({ lat: 25.0330, lng: 121.5654 });
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (isOnline) {
      setIncomingRequest(null);
      setActiveRide(null);
      setRideStatus('idle');
      
      // Clear markers when going offline
      if (webViewRef.current) {
        const clearMarkersScript = `
          if (window.clearRideMarkers) {
            window.clearRideMarkers();
          }
          true;
        `;
        webViewRef.current.injectJavaScript(clearMarkersScript);
      }
    }
  };

  const acceptRideRequest = () => {
    if (incomingRequest) {
      setActiveRide(incomingRequest);
      setIncomingRequest(null);
      setRideStatus('heading_to_pickup');
      
      // Add ride markers to map
      if (webViewRef.current) {
        // Mock coordinates for demo - in real app, you'd geocode the addresses
        const pickupLat = 25.0340; // Mock pickup coordinates
        const pickupLng = 121.5645;
        const destLat = 25.0280; // Mock destination coordinates  
        const destLng = 121.5720;
        
        const addMarkersScript = `
          if (window.addRideMarkers) {
            window.addRideMarkers(${pickupLat}, ${pickupLng}, ${destLat}, ${destLng});
          }
          true;
        `;
        webViewRef.current.injectJavaScript(addMarkersScript);
      }
      
      Alert.alert("接單成功", "正在前往接客地點");
    }
  };

  const rejectRideRequest = () => {
    setIncomingRequest(null);
    
    // Clear any potential markers from map
    if (webViewRef.current) {
      const clearMarkersScript = `
        if (window.clearRideMarkers) {
          window.clearRideMarkers();
        }
        true;
      `;
      webViewRef.current.injectJavaScript(clearMarkersScript);
    }
    
    Alert.alert("已拒絕", "訂單已拒絕");
  };

  const updateRideStatus = () => {
    if (rideStatus === 'heading_to_pickup') {
      setRideStatus('passenger_onboard');
      Alert.alert("乘客已上車", "請前往目的地");
    } else if (rideStatus === 'passenger_onboard') {
      setRideStatus('completed');
      Alert.alert("行程完成", "感謝您的服務！");
      
      // Clear ride markers from map
      if (webViewRef.current) {
        const clearMarkersScript = `
          if (window.clearRideMarkers) {
            window.clearRideMarkers();
          }
          true;
        `;
        webViewRef.current.injectJavaScript(clearMarkersScript);
      }
      
      setTimeout(() => {
        setActiveRide(null);
        setRideStatus('idle');
      }, 2000);
    }
  };

  const renderStatusCard = () => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
        <Text style={styles.statusText}>
          {isOnline ? '線上接單中' : '離線狀態'}
        </Text>
      </View>
      <Text style={styles.locationText}>目前位置：{currentLocation}</Text>
      <Button
        onPress={toggleOnlineStatus}
        style={[styles.toggleButton, { backgroundColor: isOnline ? '#F44336' : '#4CAF50' }]}
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
          <IconSymbol name="car" size={24} color="#FF9500" />
          <Text style={styles.requestTitle}>新訂單</Text>
        </View>
        
        <View style={styles.requestDetails}>
          <Text style={styles.passengerName}>乘客：{incomingRequest.passengerName}</Text>
          
          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <IconSymbol name="location" size={16} color="#4CAF50" />
              <Text style={styles.addressLabel}>上車地點：</Text>
            </View>
            <Text style={styles.addressText}>{incomingRequest.pickupAddress}</Text>
          </View>

          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <IconSymbol name="flag" size={16} color="#F44336" />
              <Text style={styles.addressLabel}>目的地：</Text>
            </View>
            <Text style={styles.addressText}>{incomingRequest.destinationAddress}</Text>
          </View>

          <View style={styles.rideInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>距離</Text>
              <Text style={styles.infoValue}>{incomingRequest.distance}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>預估車資</Text>
              <Text style={styles.infoValue}>{incomingRequest.estimatedFare}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>預估時間</Text>
              <Text style={styles.infoValue}>{incomingRequest.estimatedTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.requestActions}>
          <Button
            onPress={rejectRideRequest}
            style={styles.rejectButton}
            textStyle={styles.actionButtonText}
          >
            拒絕
          </Button>
          <Button
            onPress={acceptRideRequest}
            style={styles.acceptButton}
            textStyle={styles.actionButtonText}
          >
            接受
          </Button>
        </View>
      </View>
    );
  };

  const renderActiveRide = () => {
    if (!activeRide) return null;

    const getStatusText = () => {
      switch (rideStatus) {
        case 'heading_to_pickup':
          return '前往接客地點';
        case 'passenger_onboard':
          return '乘客已上車';
        case 'completed':
          return '行程完成';
        default:
          return '';
      }
    };

    const getActionButtonText = () => {
      switch (rideStatus) {
        case 'heading_to_pickup':
          return '已到達接客點';
        case 'passenger_onboard':
          return '完成行程';
        default:
          return '';
      }
    };

    return (
      <View style={styles.activeRideCard}>
        <View style={styles.rideStatusHeader}>
          <IconSymbol name="car.fill" size={24} color="#2196F3" />
          <Text style={styles.rideStatusText}>{getStatusText()}</Text>
        </View>

        <View style={styles.rideDetails}>
          <Text style={styles.passengerName}>乘客：{activeRide.passengerName}</Text>
          
          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <IconSymbol name="location" size={16} color="#4CAF50" />
              <Text style={styles.addressLabel}>上車地點：</Text>
            </View>
            <Text style={styles.addressText}>{activeRide.pickupAddress}</Text>
          </View>

          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <IconSymbol name="flag" size={16} color="#F44336" />
              <Text style={styles.addressLabel}>目的地：</Text>
            </View>
            <Text style={styles.addressText}>{activeRide.destinationAddress}</Text>
          </View>

          <View style={styles.fareInfo}>
            <Text style={styles.fareLabel}>預估車資：</Text>
            <Text style={styles.fareValue}>{activeRide.estimatedFare}</Text>
          </View>
        </View>

        {rideStatus !== 'completed' && (
          <Button
            onPress={updateRideStatus}
            style={styles.actionButton}
          >
            {getActionButtonText()}
          </Button>
        )}
      </View>
    );
  };

  const renderMapView = () => {
    const mapboxAccessToken = 'pk.eyJ1IjoiY2FzcGVyNjciLCJhIjoiY205Y2FoMDIyMHNpYjJ5b2V5dGE2MmJnbyJ9.yzckI6SXN3-Fl_5-llEYzQ';
    const defaultLat = currentCoords?.lat || 25.0330; // Taipei default
    const defaultLng = currentCoords?.lng || 121.5654;
    
    const mapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Taxi Driver Map</title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet">
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
          .mapboxgl-ctrl-bottom-left,
          .mapboxgl-ctrl-bottom-right {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          mapboxgl.accessToken = '${mapboxAccessToken}';
          
          window.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [${defaultLng}, ${defaultLat}],
            zoom: 15,
            attributionControl: false
          });

          // Add navigation control
          window.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

          // Add driver marker
          window.driverMarker = new mapboxgl.Marker({ 
            color: '#2196F3',
            scale: 1.2
          })
          .setLngLat([${defaultLng}, ${defaultLat}])
          .addTo(window.map);

          // Add pickup and destination markers when there's an active ride
          window.addRideMarkers = function(pickupLat, pickupLng, destLat, destLng) {
            // Remove existing markers
            if (window.pickupMarker) window.pickupMarker.remove();
            if (window.destMarker) window.destMarker.remove();
            
            // Add pickup marker
            window.pickupMarker = new mapboxgl.Marker({ color: '#4CAF50' })
              .setLngLat([pickupLng, pickupLat])
              .addTo(window.map);
            
            // Add destination marker
            window.destMarker = new mapboxgl.Marker({ color: '#F44336' })
              .setLngLat([destLng, destLat])
              .addTo(window.map);
            
            // Fit bounds to show all markers
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend([${defaultLng}, ${defaultLat}]); // driver
            bounds.extend([pickupLng, pickupLat]); // pickup
            bounds.extend([destLng, destLat]); // destination
            
            window.map.fitBounds(bounds, { padding: 50 });
          };

          window.clearRideMarkers = function() {
            if (window.pickupMarker) {
              window.pickupMarker.remove();
              window.pickupMarker = null;
            }
            if (window.destMarker) {
              window.destMarker.remove();
              window.destMarker = null;
            }
            // Center back on driver
            window.map.setCenter([${defaultLng}, ${defaultLat}]);
            window.map.setZoom(15);
          };

          // Handle map clicks (optional - for future features)
          window.map.on('click', function(e) {
            console.log('Map clicked at:', e.lngLat);
          });
        </script>
      </body>
      </html>
    `;

    return (
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.mapView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        onLoadEnd={() => {
          console.log('Map loaded successfully');
        }}
        onError={(error) => {
          console.log('WebView error:', error);
        }}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "TTW-TAXI 司機端",
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <View style={styles.container}>
        {renderMapView()}
        
        <View style={styles.contentContainer}>
          {renderStatusCard()}
          {incomingRequest && renderIncomingRequest()}
          {activeRide && renderActiveRide()}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mapView: {
    height: height * 0.4,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  toggleButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 8,
  },
  requestDetails: {
    marginBottom: 16,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    paddingLeft: 20,
  },
  rideInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeRideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideStatusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  rideDetails: {
    marginBottom: 16,
  },
  fareInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  fareLabel: {
    fontSize: 16,
    color: '#666666',
  },
  fareValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
  },
});
