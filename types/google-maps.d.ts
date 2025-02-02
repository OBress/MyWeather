/// <reference types="@types/google.maps" />

// Type definitions for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface GoogleMapsPlace {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: google.maps.LatLng;
  };
  name: string;
}

export interface PlaceAutocompleteResult extends google.maps.places.AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  matched_substrings: Array<{
    length: number;
    offset: number;
  }>;
  terms: Array<{
    offset: number;
    value: string;
  }>;
  types: string[];
}

export interface WeatherLocation {
  id?: string;
  user_id?: string;
  place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
  is_default?: boolean;
  created_at?: string;
} 