
import { View, Text, StyleSheet, Platform } from 'react-native';
import { IconSymbol } from './IconSymbol';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './button';
import { colors } from '@/styles/commonStyles';

interface WebMapProps {
  currentCoords: { lat: number; lng: number } | null;
  pickupLocation?: { lat: number; lng: number } | null;
  destinationLocation?: { lat: number; lng: number } | null;
  isOnline: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webNotSupported: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  notSupportedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  notSupportedText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  mapLegend: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
  },
});

const WebMap: React.FC<WebMapProps> = ({ 
  currentCoords, 
  pickupLocation, 
  destinationLocation, 
  isOnline 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      loadLeafletAndInitializeMap();
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      updateMapMarkers();
    }
  }, [currentCoords, pickupLocation, destinationLocation, mapLoaded]);

  const loadLeafletAndInitializeMap = async () => {
    try {
      setMapError(false);
      
      // 動態載入 Leaflet
      if (typeof window !== 'undefined' && !window.L) {
        // 載入 CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // 載入 JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setTimeout(initializeMap, 100);
        };
        script.onerror = () => {
          setMapError(true);
        };
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    } catch (error) {
      console.error('Error loading Leaflet:', error);
      setMapError(true);
    }
  };

  const initializeMap = () => {
    try {
      if (!mapRef.current || !window.L) return;

      // 清除現有地圖
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // 設定預設位置（台北車站）
      const defaultLat = currentCoords?.lat || 25.0478;
      const defaultLng = currentCoords?.lng || 121.5170;

      // 創建地圖
      const map = window.L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      // 添加圖層
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
      
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      // 清除現有標記
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      const bounds = [];

      // 添加司機位置標記
      if (currentCoords) {
        const driverIcon = window.L.divIcon({
          html: `<div style="
            width: 20px; 
            height: 20px; 
            background-color: ${isOnline ? '#34C759' : '#FF3B30'}; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          className: 'driver-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const driverMarker = window.L.marker([currentCoords.lat, currentCoords.lng], {
          icon: driverIcon
        }).addTo(mapInstanceRef.current);

        driverMarker.bindPopup(`
          <div style="text-align: center;">
            <strong>您的位置</strong><br>
            狀態: ${isOnline ? '線上' : '離線'}
          </div>
        `);

        markersRef.current.push(driverMarker);
        bounds.push([currentCoords.lat, currentCoords.lng]);
      }

      // 添加上車點標記
      if (pickupLocation) {
        const pickupIcon = window.L.divIcon({
          html: `<div style="
            width: 16px; 
            height: 16px; 
            background-color: #007AFF; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          className: 'pickup-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const pickupMarker = window.L.marker([pickupLocation.lat, pickupLocation.lng], {
          icon: pickupIcon
        }).addTo(mapInstanceRef.current);

        pickupMarker.bindPopup('<div style="text-align: center;"><strong>上車點</strong></div>');
        markersRef.current.push(pickupMarker);
        bounds.push([pickupLocation.lat, pickupLocation.lng]);
      }

      // 添加目的地標記
      if (destinationLocation) {
        const destIcon = window.L.divIcon({
          html: `<div style="
            width: 16px; 
            height: 16px; 
            background-color: #FF9500; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          className: 'destination-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const destMarker = window.L.marker([destinationLocation.lat, destinationLocation.lng], {
          icon: destIcon
        }).addTo(mapInstanceRef.current);

        destMarker.bindPopup('<div style="text-align: center;"><strong>目的地</strong></div>');
        markersRef.current.push(destMarker);
        bounds.push([destinationLocation.lat, destinationLocation.lng]);
      }

      // 調整地圖視野以包含所有標記
      if (bounds.length > 1) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      } else if (bounds.length === 1) {
        mapInstanceRef.current.setView(bounds[0], 15);
      }

    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  const retryMapLoad = () => {
    setRetryCount(prev => prev + 1);
    setMapError(false);
    setMapLoaded(false);
    loadLeafletAndInitializeMap();
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.webNotSupported}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={colors.warning} />
        <Text style={styles.notSupportedTitle}>Web 平台限制</Text>
        <Text style={styles.notSupportedText}>
          互動式地圖功能在 Web 平台上有限制。{'\n'}
          請在 iOS 或 Android 裝置上使用完整功能。
        </Text>
      </View>
    );
  }

  if (mapError) {
    return (
      <View style={styles.webNotSupported}>
        <IconSymbol name="wifi.slash" size={48} color={colors.error} />
        <Text style={styles.notSupportedTitle}>地圖載入失敗</Text>
        <Text style={styles.notSupportedText}>
          無法載入地圖服務，請檢查網路連線。{'\n'}
          {retryCount > 0 && `已重試 ${retryCount} 次`}
        </Text>
        <Button onPress={retryMapLoad}>
          重新載入
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 0,
        }}
      />
      
      {!mapLoaded && (
        <View style={styles.loadingContainer}>
          <IconSymbol name="arrow.clockwise" size={24} color={colors.primary} />
          <Text style={styles.loadingText}>載入地圖中...</Text>
        </View>
      )}

      {mapLoaded && (pickupLocation || destinationLocation) && (
        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: isOnline ? colors.success : colors.error }]} />
            <Text style={styles.legendText}>您的位置</Text>
          </View>
          {pickupLocation && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>上車點</Text>
            </View>
          )}
          {destinationLocation && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>目的地</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default WebMap;
