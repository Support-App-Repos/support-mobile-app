/**
 * Google Places powered Location field.
 *
 * - Autocomplete search (Places API)
 * - "Use current location" (device GPS + Geocoding API)
 *
 * NOTE: Requires GOOGLE_MAPS_API_KEY in env.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_ANDROID_CERT_SHA1, GOOGLE_ANDROID_PACKAGE, GOOGLE_MAPS_API_KEY } from '@env';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';

type Prediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type Props = {
  label?: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  onSelect: (args: { location: string; city?: string }) => void;
};

function pickCity(components: any[] | undefined): string | undefined {
  if (!Array.isArray(components)) return undefined;
  const get = (type: string) =>
    components.find((c) => Array.isArray(c.types) && c.types.includes(type));
  const locality = get('locality')?.long_name;
  const admin1 = get('administrative_area_level_1')?.short_name;
  const country = get('country')?.short_name;
  const parts = [locality || admin1, country].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'Allow access to your location to use current location.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export const GoogleLocationField: React.FC<Props> = ({
  label = 'Location',
  required,
  value,
  placeholder = 'Search location',
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const debounceRef = useRef<any>(null);

  const hasKey = useMemo(() => Boolean(GOOGLE_MAPS_API_KEY), []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setPredictions([]);
      setLoading(false);
      setErrorText(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }
  }, [open]);

  const fetchPredictions = (text: string) => {
    if (!hasKey) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const q = text.trim();
      if (q.length < 3) {
        setPredictions([]);
        setErrorText(null);
        return;
      }
      try {
        setLoading(true);
        setErrorText(null);
        const url =
          `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
          `?input=${encodeURIComponent(q)}` +
          `&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}` +
          `&types=geocode` +
          `&language=en`;
        const res = await fetch(url, {
          headers:
            Platform.OS === 'android' && GOOGLE_ANDROID_PACKAGE && GOOGLE_ANDROID_CERT_SHA1
              ? {
                  'X-Android-Package': String(GOOGLE_ANDROID_PACKAGE),
                  'X-Android-Cert': String(GOOGLE_ANDROID_CERT_SHA1),
                }
              : undefined,
        });
        const json = await res.json();
        if (json?.status !== 'OK') {
          setPredictions([]);
          setErrorText(json?.error_message || `Google status: ${json?.status || 'UNKNOWN'}`);
          return;
        }
        setPredictions(Array.isArray(json?.predictions) ? json.predictions : []);
      } catch (e) {
        setPredictions([]);
        setErrorText('Network error. Check internet and API key.');
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const selectPlace = async (placeId: string, descriptionFallback: string) => {
    if (!hasKey) return;
    try {
      setLoading(true);
      const url =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${encodeURIComponent(placeId)}` +
        `&fields=name,formatted_address,address_component` +
        `&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}` +
        `&language=en`;
      const res = await fetch(url);
      const json = await res.json();
      const result = json?.result;
      const locationText = result?.name || result?.formatted_address || descriptionFallback;
      const city = pickCity(result?.address_components);
      onSelect({ location: locationText, city });
      setOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to select location');
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = async () => {
    if (!hasKey) return;
    const ok = await ensureLocationPermission();
    if (!ok) return;

    setLoading(true);
    Geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url =
            `https://maps.googleapis.com/maps/api/geocode/json` +
            `?latlng=${latitude},${longitude}` +
            `&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}` +
            `&language=en`;
          const res = await fetch(url);
          const json = await res.json();
          const top = Array.isArray(json?.results) ? json.results[0] : undefined;
          const formatted = top?.formatted_address;
          const city = pickCity(top?.address_components);
          if (!formatted) {
            Alert.alert('Error', 'Could not resolve your location address.');
            setLoading(false);
            return;
          }
          onSelect({ location: formatted, city });
          setOpen(false);
        } catch (e: any) {
          Alert.alert('Error', e?.message || 'Failed to use current location');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        Alert.alert('Error', 'Could not fetch your current location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  return (
    <View style={styles.root}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles.trigger}
        activeOpacity={0.75}
        onPress={() => {
          if (!hasKey) {
            Alert.alert('Missing configuration', 'GOOGLE_MAPS_API_KEY is not set.');
            return;
          }
          Keyboard.dismiss();
          setOpen(true);
        }}
      >
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={styles.chev}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.sheetTitle}>Search location</Text>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Type to search..."
                placeholderTextColor={Colors.light.textSecondary}
                value={query}
                onChangeText={(t) => {
                  setQuery(t);
                  fetchPredictions(t);
                }}
                autoFocus
                returnKeyType="search"
              />
              {loading ? <ActivityIndicator size="small" color={Colors.light.primary} /> : null}
            </View>

            <TouchableOpacity style={styles.currentBtn} activeOpacity={0.8} onPress={useCurrentLocation}>
              <Text style={styles.currentBtnText}>Use current location</Text>
            </TouchableOpacity>

            {!!errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const main = item.structured_formatting?.main_text || item.description;
                const secondary = item.structured_formatting?.secondary_text;
                return (
                  <TouchableOpacity
                    style={styles.row}
                    activeOpacity={0.7}
                    onPress={() => selectPlace(item.place_id, item.description)}
                  >
                    <Text style={styles.rowMain} numberOfLines={1}>
                      {main}
                    </Text>
                    {!!secondary ? (
                      <Text style={styles.rowSecondary} numberOfLines={1}>
                        {secondary}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                query.trim().length >= 3 && !loading ? (
                  <Text style={styles.empty}>{errorText ? 'No results (see error above)' : 'No results'}</Text>
                ) : (
                  <Text style={styles.empty}>Type at least 3 characters</Text>
                )
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  label: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  required: { color: '#EF4444' },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  value: {
    ...Typography.body,
    color: Colors.light.text,
    flex: 1,
    minWidth: 0,
  },
  placeholder: {
    color: Colors.light.textSecondary,
  },
  chev: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    maxHeight: '80%',
  },
  sheetTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  currentBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(13, 71, 92, 0.08)',
  },
  currentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
  },
  row: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  rowMain: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  rowSecondary: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  empty: {
    paddingVertical: Spacing.lg,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },
  errorText: {
    marginTop: 4,
    marginBottom: 4,
    color: '#B91C1C',
    fontSize: 13,
  },
});

