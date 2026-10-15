import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();
  return <View style={s.container} accessibilityLabel={t('language')}>
    <Feather name="globe" size={15} color="#6558db" />
    {(['th', 'en'] as const).map(value => <Pressable key={value} accessibilityRole="button"
      accessibilityLabel={t(value === 'th' ? 'switchThai' : 'switchEnglish')}
      accessibilityState={{ selected: language === value }} onPress={() => setLanguage(value)}
      style={[s.option, language === value && s.selected]}>
      <Text style={[s.text, language === value && s.selectedText]}>{value === 'th' ? 'ไทย' : 'EN'}</Text>
    </Pressable>)}
  </View>;
}
const s = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4, borderRadius: 10, borderWidth: 1, borderColor: '#e5e2f5', backgroundColor: '#fff' },
  option: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 6, minHeight: 34, justifyContent: 'center' },
  selected: { backgroundColor: '#eeebff' }, text: { color: '#7b8194', fontSize: 12, lineHeight: 18, fontWeight: '600' }, selectedText: { color: '#6558db' },
});
