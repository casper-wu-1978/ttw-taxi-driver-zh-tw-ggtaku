
// Global type declarations for the taxi driver app

declare global {
  interface Window {
    L: any; // Leaflet library
    map: any; // Leaflet map instance
    driverMarker: any; // Driver location marker
    pickupMarker: any; // Pickup location marker
    destMarker: any; // Destination location marker
    addRideMarkers: (pickupLat: number, pickupLng: number, destLat: number, destLng: number) => void;
    clearRideMarkers: () => void;
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
  }
}

export {};
