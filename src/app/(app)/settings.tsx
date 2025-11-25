import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../_layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import CsvImporter from '@/components/settings/CsvImporter';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [isImportModalVisible, setImportModalVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Placeholder for actual theme logic

  const handleImportComplete = () => {
    setImportModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Account
        </ThemedText>
        <View style={styles.row}>
          <ThemedText>Email</ThemedText>
          <ThemedText style={styles.value}>{session?.user?.email}</ThemedText>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Preferences
        </ThemedText>
        <View style={styles.row}>
          <ThemedText>Dark Mode</ThemedText>
          <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
        </View>
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Data Management
        </ThemedText>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => setImportModalVisible(true)}>
          <View style={styles.actionIconRow}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007bff" />
            <ThemedText style={styles.actionLabel}>
              Import from Strong (CSV)
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Full Screen Import Modal */}
      <Modal
        visible={isImportModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setImportModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle">Import Data</ThemedText>
            <TouchableOpacity onPress={() => setImportModalVisible(false)}>
              <ThemedText style={styles.closeText}>Close</ThemedText>
            </TouchableOpacity>
          </View>

          {session?.user && (
            <CsvImporter
              userId={session.user.id}
              onImportComplete={handleImportComplete}
            />
          )}
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff', // Or use a themed color
    borderRadius: 12,
    padding: 16,
    // Add subtle shadow/border for separation if background is white
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  value: {
    color: '#888',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 16,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  signOutText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
});
