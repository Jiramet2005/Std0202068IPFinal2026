import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import type { Employee } from '@/lib/api';
import type { TranslationKey } from '@/lib/i18n';
import { EmployeeValues, validateEmployeeForm } from '@/lib/employee-form';

type Props = { employee: Employee; disabled: boolean; onClose: () => void; onSave: (values: EmployeeValues) => void };
export default function EmployeeEditor({ employee, disabled, onClose, onSave }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState(employee.name);
  const [position, setPosition] = useState(employee.position);
  const [salary, setSalary] = useState(String(employee.salary));
  const [error, setError] = useState<TranslationKey | ''>('');
  function save() {
    if (disabled) return;
    const result = validateEmployeeForm(name, position, salary);
    if (result.error) { setError(result.error); return; }
    setError(''); onSave(result.values);
  }
  return <Modal visible transparent animationType="fade" onRequestClose={() => { if (!disabled) onClose(); }}>
    <KeyboardAvoidingView style={s.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card} accessibilityViewIsModal>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
          <View style={s.heading}><View style={{ flex: 1 }}><Text accessibilityRole="header" style={s.title}>{t('editEmployee')}</Text><Text style={s.subtitle}>{t('editSubtitle')}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t('cancel')} disabled={disabled} onPress={onClose} style={s.close}><Feather name="x" size={20} color="#71778b" /></Pressable></View>
          <Text style={s.label}>{t('fullName')}</Text><TextInput autoFocus accessibilityLabel={t('fullName')} value={name} onChangeText={setName} editable={!disabled} style={s.input} placeholder={t('namePlaceholder')} placeholderTextColor="#969aab" />
          <Text style={s.label}>{t('position')}</Text><TextInput accessibilityLabel={t('position')} value={position} onChangeText={setPosition} editable={!disabled} style={s.input} placeholder={t('positionPlaceholder')} placeholderTextColor="#969aab" />
          <Text style={s.label}>{t('monthlySalary')}</Text><TextInput accessibilityLabel={t('monthlySalary')} value={salary} onChangeText={setSalary} editable={!disabled} style={s.input} keyboardType="decimal-pad" placeholder={t('salaryPlaceholder')} placeholderTextColor="#969aab" onSubmitEditing={save} />
          {!!error && <Text accessibilityRole="alert" style={s.error}>{t(error)}</Text>}
          <View style={s.buttons}><Pressable accessibilityRole="button" disabled={disabled} onPress={onClose} style={[s.cancel, disabled && s.dim]}><Text style={s.cancelText}>{t('cancel')}</Text></Pressable><Pressable accessibilityRole="button" disabled={disabled} onPress={save} style={[s.save, disabled && s.dim]}>{disabled ? <ActivityIndicator color="#fff" /> : <Feather name="check" size={17} color="#fff" />}<Text style={s.saveText}>{t('saveChanges')}</Text></Pressable></View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(24,28,48,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 480, maxHeight: '90%', backgroundColor: '#fff', borderRadius: 16 }, content: { padding: 24 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24 }, title: { color: '#262b41', fontSize: 20, fontWeight: '700' }, subtitle: { color: '#7b8194', fontSize: 12, lineHeight: 19, marginTop: 6 }, close: { padding: 8 },
  label: { color: '#4e5369', fontSize: 12, fontWeight: '600', marginBottom: 8 }, input: { borderWidth: 1, borderColor: '#e1e4ee', borderRadius: 8, padding: 12, backgroundColor: '#fcfcfe', color: '#34394e', marginBottom: 18, fontSize: 14 },
  error: { color: '#b9384f', fontSize: 12, lineHeight: 19, marginBottom: 14 }, buttons: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  cancel: { borderWidth: 1, borderColor: '#e1e4ee', borderRadius: 9, paddingVertical: 13, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' }, cancelText: { color: '#71778b', fontWeight: '600', fontSize: 12 },
  save: { flex: 1, backgroundColor: '#6558db', borderRadius: 9, paddingVertical: 13, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, saveText: { color: '#fff', fontSize: 12, fontWeight: '700' }, dim: { opacity: 0.5 },
});
