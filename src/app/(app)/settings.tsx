import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useAuth } from '../_layout';
import { useAppTheme, ThemePreference } from '../../contexts/ThemeContext';
import StyledButton from '@/components/common/StyledButton';
import CsvImporter from '@/components/settings/CsvImporter';

const THEME_OPTIONS: {
  label: string;
  value: ThemePreference;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
}[] = [
  { label: 'System', value: 'system', icon: 'adjust' },
  { label: 'Light', value: 'light', icon: 'sun-o' },
  { label: 'Dark', value: 'dark', icon: 'moon-o' },
];

export default function SettingsScreen() {
  const { session, profile, setProfile, signOut } = useAuth();
  const { themePreference, setThemePreference, colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const handleThemeChange = async (pref: ThemePreference) => {
    await setThemePreference(pref);
    if (!session?.user || !profile) return;
    await supabase
      .from('profiles')
      .update({ theme_preference: pref })
      .eq('id', session.user.id);
    setProfile({ ...profile, theme_preference: pref });
  };
  const [unitLoading, setUnitLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isImportModalVisible, setImportModalVisible] = useState(false);

  const currentUnit = profile?.weight_unit ?? 'KG';
  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    'No name set';

  const c = {
    pageBg: isDark ? '#1c1c1e' : '#f2f2f7',
    cardBg: isDark ? '#2c2c2e' : '#fff',
    primaryText: isDark ? '#ECEDEE' : '#000',
    secondaryText: isDark ? '#9BA1A6' : '#6e6e73',
    divider: isDark ? '#48484a' : '#e5e5ea',
    avatarPlaceholder: isDark ? '#3a3a3c' : '#e9e9ef',
    modalBg: isDark ? '#1c1c1e' : '#f5f5f5',
    modalHeaderBg: isDark ? '#2c2c2e' : '#fff',
    modalBorder: isDark ? '#38383a' : '#eee',
    chevron: isDark ? '#636366' : '#c7c7cc',
  };

  // --- Unit preference ---

  const handleUnitChange = async (newUnit: 'KG' | 'LB') => {
    if (!session?.user || !profile) return;
    if (newUnit === currentUnit) return;

    setUnitLoading(true);
    const oldProfile = profile;
    setProfile({ ...profile, weight_unit: newUnit });

    const { error } = await supabase
      .from('profiles')
      .update({ weight_unit: newUnit })
      .eq('id', session.user.id);

    if (error) {
      Alert.alert('Error', 'Could not save your preference.');
      setProfile(oldProfile);
    }
    setUnitLoading(false);
  };

  // --- Avatar upload ---

  const handleChangePhoto = async () => {
    if (!session?.user || !profile) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library in Settings.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setAvatarLoading(true);
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const filePath = `${session.user.id}/avatar.${ext}`;

    try {
      const arrayBuffer = await fetch(asset.uri).then(r => r.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: asset.mimeType ?? `image/${ext}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: avatarUrl });
    } catch {
      Alert.alert('Error', 'Could not update your profile picture.');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.pageBg }]}
      contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Settings' }} />

      {/* ── Profile ── */}
      <Text style={[styles.sectionHeader, { color: c.secondaryText }]}>
        PROFILE
      </Text>
      <View style={[styles.card, { backgroundColor: c.cardBg }]}>
        <View style={styles.avatarRow}>
          <TouchableOpacity
            onPress={handleChangePhoto}
            disabled={avatarLoading}
            style={styles.avatarWrapper}>
            {avatarLoading ? (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: c.avatarPlaceholder },
                ]}>
                <ActivityIndicator color="#007bff" />
              </View>
            ) : profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: c.avatarPlaceholder },
                ]}>
                <FontAwesome
                  name="user"
                  size={40}
                  color={isDark ? '#636366' : '#aaa'}
                />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <FontAwesome name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: c.primaryText }]}>
              {displayName}
            </Text>
            <Text style={[styles.profileEmail, { color: c.secondaryText }]}>
              {session?.user.email ?? ''}
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: c.divider }]} />
        <TouchableOpacity
          style={styles.editProfileRow}
          onPress={() => router.push('/profile')}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
          <FontAwesome name="chevron-right" size={14} color={c.chevron} />
        </TouchableOpacity>
      </View>

      {/* ── Preferences ── */}
      <Text style={[styles.sectionHeader, { color: c.secondaryText }]}>
        PREFERENCES
      </Text>
      <View style={[styles.card, { backgroundColor: c.cardBg }]}>
        <Text style={[styles.cardTitle, { color: c.primaryText }]}>
          Units of Measurement
        </Text>
        <Text style={[styles.cardSubtitle, { color: c.secondaryText }]}>
          Choose your preferred unit for weight logging.
        </Text>
        {unitLoading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleLeft,
                currentUnit === 'KG' && styles.toggleActive,
                currentUnit !== 'KG' && { backgroundColor: c.cardBg },
              ]}
              onPress={() => handleUnitChange('KG')}>
              <Text
                style={[
                  styles.toggleText,
                  currentUnit === 'KG' && styles.toggleActiveText,
                ]}>
                Kilograms (kg)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleRight,
                currentUnit === 'LB' && styles.toggleActive,
                currentUnit !== 'LB' && { backgroundColor: c.cardBg },
              ]}
              onPress={() => handleUnitChange('LB')}>
              <Text
                style={[
                  styles.toggleText,
                  currentUnit === 'LB' && styles.toggleActiveText,
                ]}>
                Pounds (lbs)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Appearance ── */}
      <Text style={[styles.sectionHeader, { color: c.secondaryText }]}>
        APPEARANCE
      </Text>
      <View style={[styles.card, { backgroundColor: c.cardBg }]}>
        <Text style={[styles.cardTitle, { color: c.primaryText }]}>Theme</Text>
        <Text style={[styles.cardSubtitle, { color: c.secondaryText }]}>
          Choose how the app looks on this device.
        </Text>
        <View style={styles.themeContainer}>
          {THEME_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.themeButton,
                themePreference === opt.value && styles.themeButtonActive,
                themePreference !== opt.value && { backgroundColor: c.cardBg },
              ]}
              onPress={() => handleThemeChange(opt.value)}>
              <FontAwesome
                name={opt.icon}
                size={18}
                color={themePreference === opt.value ? '#fff' : '#007bff'}
              />
              <Text
                style={[
                  styles.themeButtonText,
                  themePreference === opt.value && styles.themeButtonTextActive,
                ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Data Management ── */}
      <Text style={[styles.sectionHeader, { color: c.secondaryText }]}>
        DATA MANAGEMENT
      </Text>
      <View style={[styles.card, { backgroundColor: c.cardBg }]}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => setImportModalVisible(true)}>
          <View style={styles.actionIconRow}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007bff" />
            <Text style={[styles.actionLabel, { color: c.primaryText }]}>
              Import from Strong (CSV)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.chevron} />
        </TouchableOpacity>
      </View>

      {/* ── Account ── */}
      <Text style={[styles.sectionHeader, { color: c.secondaryText }]}>
        ACCOUNT
      </Text>
      <View style={[styles.card, { backgroundColor: c.cardBg }]}>
        <StyledButton title="Sign Out" type="danger" onPress={signOut} />
      </View>

      {/* CSV Import Modal */}
      <Modal
        visible={isImportModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setImportModalVisible(false)}>
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: c.modalBg }]}>
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: c.modalHeaderBg,
                borderBottomColor: c.modalBorder,
              },
            ]}>
            <Text style={[styles.modalTitle, { color: c.primaryText }]}>
              Import Data
            </Text>
            <TouchableOpacity onPress={() => setImportModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          {session?.user && (
            <CsvImporter
              userId={session.user.id}
              onImportComplete={() => setImportModalVisible(false)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const AVATAR_SIZE = 72;
const CAMERA_BADGE = 22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  // Avatar
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CAMERA_BADGE,
    height: CAMERA_BADGE,
    borderRadius: CAMERA_BADGE / 2,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
    marginHorizontal: -16,
  },
  editProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  editProfileText: {
    fontSize: 16,
    color: '#007bff',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 13,
  },
  // Unit toggle
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleLeft: {
    borderRightWidth: 0.5,
    borderRightColor: '#007bff',
  },
  toggleRight: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#007bff',
  },
  toggleActive: {
    backgroundColor: '#007bff',
  },
  toggleText: {
    fontSize: 15,
    color: '#007bff',
    fontWeight: '600',
  },
  toggleActiveText: {
    color: '#fff',
  },
  // Theme picker
  themeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    gap: 6,
  },
  themeButtonActive: {
    backgroundColor: '#007bff',
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007bff',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  // Data management
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 16,
  },
  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
});
