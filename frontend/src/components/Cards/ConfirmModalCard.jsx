import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

const ConfirmModalCard = ({
  visible,
  onClose,
  onConfirm,
  password,
  setPassword,
  title = 'Confirm',
  description = 'Enter your password to confirm this action',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDesc}>{description}</Text>

          <View style={styles.passwordRow}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={[styles.input, styles.modalInput]}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword((p) => !p)} style={styles.showToggle}>
              <Text style={styles.showToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>

          <View style={styles.modalButtons}>
            <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={() => { onClose(); setPassword(''); }}>
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.destructiveButton]} onPress={onConfirm}>
              <Text style={styles.actionButtonText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827',
  },
  modalDesc: {
    color: '#6b7280',
    marginBottom: 12,
  },
  modalInput: {
    marginBottom: 0,
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  showToggle: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  showToggleText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  destructiveButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    width: '100%',
    backgroundColor: '#f9fafb',
  },
});

export default ConfirmModalCard;
