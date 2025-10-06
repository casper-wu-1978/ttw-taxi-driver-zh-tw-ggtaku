
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { Button } from './button';

interface WebMapProps {
  currentCoords: { lat: number; lng: number } | null;
  pickupLocation?: { lat: number; lng: number } | null;
  destinationLocation?: { lat: number; lng: number } | null;
  isOnline: boolean;
}

export default function WebMap({ 
  currentCoords, 
  pickupLocation, 
  destinationLocation, 
  isOnline 
}: WebMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{
    driver?: any;
    pickup?: any;
    destination?: any;
  }>({});

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    loadLeafletAndInitializeMap();
  }, []);

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      updateMapMarkers();
    }
  }, [currentCoords, pickupLocation, destinationLocation, mapLoaded]);

  const loadLeafletAndInitializeMap = async () => {
    try {
      setIsLoading(true);
      setMapError(null);

      // 檢查是否已經載入 Leaflet
      if (window.L) {
        initializeMap();
        return;
      }

      // 載入 Leaflet CSS
      const existingLink = document.querySelector('link[href*="leaflet"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // 載入 Leaflet JS
      const existingScript = document.querySelector('script[src*="leaflet"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
          console.log('Leaflet 載入成功');
          initializeMap();
        };
        script.onerror = () => {
          console.error('Leaflet 載入失敗');
          setMapError('無法載入地圖庫，請檢查網路連線');
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } else {
        // Script already exists, initialize map
        initializeMap();
      }
    } catch (error) {
      console.error('載入 Leaflet 錯誤:', error);
      setMapError('地圖初始化失敗');
      setIsLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L) {
      console.error('地圖容器或 Leaflet 庫不可用');
      setMapError('地圖容器初始化失敗');
      setIsLoading(false);
      return;
    }

    try {
      const defaultLat = currentCoords?.lat || 25.0330;
      const defaultLng = currentCoords?.lng || 121.5654;

      // 清理現有地圖實例
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // 創建地圖
      const map = window.L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      });

      // 添加地圖圖層
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
      setMapError(null);
      setIsLoading(false);

      console.log('地圖初始化成功');

      // 初始化標記
      updateMapMarkers();
    } catch (error) {
      console.error('地圖初始化錯誤:', error);
      setMapError(`地圖初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      setIsLoading(false);
    }
  };

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      // 清除現有標記
      Object.values(markersRef.current).forEach(marker => {
        if (marker) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      markersRef.current = {};

      const bounds = [];

      // 添加司機位置標記
      if (currentCoords) {
        const driverIcon = window.L.divIcon({
          html: `
            <div style="
              background-color: ${isOnline ? '#2196F3' : '#9E9E9E'};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                color: white;
                font-size: 12px;
                font-weight: bold;
              ">🚗</div>
            </div>
          `,
          className: 'driver-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        markersRef.current.driver = window.L.marker([currentCoords.lat, currentCoords.lng], { 
          icon: driverIcon 
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`司機位置 ${isOnline ? '(線上)' : '(離線)'}`);

        bounds.push([currentCoords.lat, currentCoords.lng]);
      }

      // 添加接客點標記
      if (pickupLocation) {
        const pickupIcon = window.L.divIcon({
          html: `
            <div style="
              background-color: #4CAF50;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">📍</div>
            </div>
          `,
          className: 'pickup-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        markersRef.current.pickup = window.L.marker([pickupLocation.lat, pickupLocation.lng], { 
          icon: pickupIcon 
        })
          .addTo(mapInstanceRef.current)
          .bindPopup('接客點');

        bounds.push([pickupLocation.lat, pickupLocation.lng]);
      }

      // 添加目的地標記
      if (destinationLocation) {
        const destIcon = window.L.divIcon({
          html: `
            <div style="
              background-color: #F44336;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">🏁</div>
            </div>
          `,
          className: 'destination-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        markersRef.current.destination = window.L.marker([destinationLocation.lat, destinationLocation.lng], { 
          icon: destIcon 
        })
          .addTo(mapInstanceRef.current)
          .bindPopup('目的地');

        bounds.push([destinationLocation.lat, destinationLocation.lng]);
      }

      // 調整地圖視野以包含所有標記
      if (bounds.length > 1) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      } else if (bounds.length === 1) {
        mapInstanceRef.current.setView(bounds[0], 15);
      }
    } catch (error) {
      console.error('更新地圖標記錯誤:', error);
    }
  };

  const retryMapLoad = () => {
    setMapError(null);
    setMapLoaded(false);
    setIsLoading(true);
    loadLeafletAndInitializeMap();
  };

  if (Platform.OS !== 'web') {
    return null;
  }

  if (mapError) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
        <Text style={styles.errorTitle}>地圖載入失敗</Text>
        <Text style={styles.errorText}>{mapError}</Text>
        <Button
          onPress={retryMapLoad}
          style={styles.retryButton}
        >
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
          borderRadius: 8,
          position: 'relative',
        }}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>載入互動式地圖中...</Text>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.statusOverlay}>
        <View style={[styles.statusIndicator, { 
          backgroundColor: isOnline ? '#4CAF50' : '#F44336' 
        }]}>
          <Text style={styles.statusText}>
            {isOnline ? '線上' : '離線'}
          </Text>
        </View>
      </View>

      {mapLoaded && (
        <View style={styles.mapInfo}>
          <Text style={styles.mapInfoText}>
            🗺️ 互動式地圖已啟用
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  statusOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1000,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mapInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1000,
  },
  mapInfoText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
