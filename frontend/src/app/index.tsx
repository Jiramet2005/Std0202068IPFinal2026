import { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ApiError, Cluster, Employee, request } from '@/lib/api';
import { confirmDelete, showError } from '@/lib/dialogs';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/lib/i18n';
import LanguageSwitch from '@/components/LanguageSwitch';
import EmployeeEditor from '@/components/EmployeeEditor';
import { EmployeeValues, validateEmployeeForm } from '@/lib/employee-form';

const accents = ['#6558db', '#258e87', '#c17d29'];

export default function Dashboard() {
  const { token } = useAuth();
  return token ? <EmployeeDashboard key={token} token={token} /> : <Redirect href="/login" />;
}
function EmployeeDashboard({ token }: { token: string }) {
  const { logout } = useAuth();
  const { language, t, errorText } = useLanguage();
  const money = (value: number) => `฿${value.toLocaleString(language === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [formError, setFormError] = useState<TranslationKey | ''>('');
  const [busy, setBusy] = useState(false);
  const mutationLock = useRef(false);
  const [analyzing, setAnalyzing] = useState(false);
  const analysisLock = useRef(false);
  const [clusters, setClusters] = useState<Cluster[] | null>(null);
  const version = useRef(0);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.status === 401) logout();
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    setError(message); showError(errorText(message), t('errorTitle'));
  }, [logout, errorText, t]);
  // Initial fetch is kept separate from user-triggered refreshes.
  useEffect(() => {
    let mounted = true;
    request<Employee[]>('/api/employees', token).then(data => {
      if (mounted) { setEmployees(data); setError(''); }
    }).catch(err => { if (mounted) handleError(err); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  async function refresh() {
    if (mutationLock.current || analysisLock.current) return;
    setLoading(true); setError(''); setClusters(null); version.current++;
    try { setEmployees(await request<Employee[]>('/api/employees', token)); }
    catch (err) { handleError(err); }
    finally { setLoading(false); }
  }
  async function mutate(action: () => Promise<void>) {
    if (mutationLock.current || loading || analysisLock.current) return;
    mutationLock.current = true; setBusy(true); setError('');
    try { await action(); version.current++; setClusters(null); }
    catch (err) { handleError(err); }
    finally { mutationLock.current = false; setBusy(false); }
  }
  function addEmployee() {
    const result = validateEmployeeForm(name, position, salary);
    if (result.error) { setFormError(result.error); return; }
    setFormError('');
    void mutate(async () => {
      const employee = await request<Employee>('/api/employees', token, { method: 'POST', body: JSON.stringify(result.values) });
      setEmployees(current => [...current, employee]); setName(''); setPosition(''); setSalary('');
    });
  }
  function saveEmployee(employee: Employee, values: EmployeeValues) {
    void mutate(async () => {
      const updated = await request<Employee>(`/api/employees/${employee.id}`, token, { method: 'PUT', body: JSON.stringify(values) });
      setEmployees(current => current.map(item => item.id === updated.id ? updated : item));
      setEditing(null);
    });
  }
  function toggle(employee: Employee) {
    void mutate(async () => {
      const updated = await request<Employee>(`/api/employees/${employee.id}/status`, token, { method: 'PUT' });
      setEmployees(current => current.map(item => item.id === updated.id ? updated : item));
    });
  }
  function remove(employee: Employee) {
    confirmDelete(employee.name, () => { void mutate(async () => {
      await request(`/api/employees/${employee.id}`, token, { method: 'DELETE' });
      setEmployees(current => current.filter(item => item.id !== employee.id));
    }); }, { title: t('confirmTitle'), message: t('deletePrompt', { name: employee.name }), cancel: t('cancel'), confirm: t('delete') });
  }
  async function analyze() {
    if (analysisLock.current || mutationLock.current || loading) return;
    analysisLock.current = true; setAnalyzing(true); setClusters(null); setError('');
    const requestedVersion = version.current;
    try {
      const data = await request<{ success: boolean; clusters: Cluster[] }>('/api/employees/salary-clusters', token);
      if (version.current === requestedVersion) setClusters(data.clusters);
    } catch (err) { handleError(err); }
    finally { analysisLock.current = false; setAnalyzing(false); }
  }
  const disabled = busy || loading || analyzing;
  const active = employees.filter(employee => employee.status === 'Active').length;
  const payroll = employees.reduce((sum, employee) => sum + employee.salary, 0);
  const query = search.trim().toLocaleLowerCase();
  const filteredEmployees = employees.filter(employee => [employee.name, employee.position].some(value => value.toLocaleLowerCase().includes(query)));

  return <SafeAreaView style={s.page}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={s.nav}><View style={s.brand}><View style={s.logo}><Feather name="users" size={19} color="#fff" /></View><Text style={s.brandText}>people<Text style={{ color: '#6558db' }}>.</Text></Text><View style={s.navDivider} /><Text style={s.navLabel}>{t('workspace')}</Text></View>
      <View style={s.headerActions}><LanguageSwitch /><Pressable accessibilityRole="button" onPress={logout} style={s.outline}><Feather name="log-out" size={16} color="#71778b" /><Text style={s.smallText}>{t('signOut')}</Text></Pressable></View></View>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <View style={s.heading}><View><Text style={s.eyebrow}>{t('teamEyebrow')}</Text><Text style={s.title}>{t('teamTitle')}</Text><Text style={s.subtitle}>{t('teamSubtitle')}</Text></View><View style={s.admin}><View style={s.avatar}><Text style={{ color: '#6558db', fontWeight: '700' }}>A</Text></View><View><Text style={s.adminName}>{t('administrator')}</Text><Text style={s.smallText}>{t('hrManager')}</Text></View></View></View>
      <View style={s.stats}>{[
        { label: t('totalEmployees'), value: String(employees.length), icon: 'users' as const, color: '#6558db' },
        { label: t('activeEmployees'), value: String(active), icon: 'user-check' as const, color: '#258e87' },
        { label: t('onLeave'), value: String(employees.length - active), icon: 'coffee' as const, color: '#c17d29' },
        { label: t('monthlyPayroll'), value: money(payroll), icon: 'credit-card' as const, color: '#4b7cb8' },
      ].map(stat => <View key={stat.label} style={s.stat}><View style={s.statHeading}><Text style={s.smallText}>{stat.label}</Text><Feather name={stat.icon} size={18} color={stat.color} /></View><Text style={s.statValue}>{loading ? '—' : stat.value}</Text></View>)}</View>
      {!!error && <View style={s.errorBanner}><Text accessibilityRole="alert" style={s.error}>{errorText(error)}</Text><Pressable accessibilityRole="button" disabled={disabled} onPress={refresh}><Text style={s.link}>{t('retry')}</Text></Pressable></View>}
      <View style={[s.columns, !wide && { flexDirection: 'column' }]}>
        <View style={[s.panel, { flex: 1 }]}><View style={s.sectionHeading}><View><Text style={s.sectionTitle}>{t('directory')}</Text><Text style={s.smallText}>{t('teamCount', { count: employees.length })}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t('refresh')} disabled={disabled} onPress={refresh} style={s.iconButton}><Feather name="refresh-cw" size={17} color="#71778b" /></Pressable></View>
          <View style={s.searchSection}><View style={s.searchBox}><Feather name="search" size={18} color="#7b8194" /><TextInput accessibilityLabel={t('searchEmployees')} style={s.searchInput} placeholder={t('searchPlaceholder')} placeholderTextColor="#969aab" value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false} returnKeyType="search" />{search.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel={t('clearSearch')} onPress={() => setSearch('')} style={s.clearSearch}><Feather name="x" size={17} color="#71778b" /></Pressable>}</View>{!loading && !!query && <Text accessibilityLiveRegion="polite" style={s.smallText}>{t('searchCount', { count: filteredEmployees.length, total: employees.length })}</Text>}</View>
          {loading && <View style={s.empty}><ActivityIndicator color="#6558db" /><Text style={s.smallText}>{t('loadingEmployees')}</Text></View>}
          {!loading && employees.length === 0 && <View style={s.empty}><Feather name="users" size={30} color="#a5a4c1" /><Text style={s.sectionTitle}>{t('emptyTitle')}</Text><Text style={s.smallText}>{t('emptySubtitle')}</Text></View>}
          {!loading && employees.length > 0 && filteredEmployees.length === 0 && <View style={s.empty}><Feather name="search" size={30} color="#a5a4c1" /><Text style={s.sectionTitle}>{t('noSearchResults')}</Text><Text style={s.smallText}>{t('searchTryAgain')}</Text><Pressable accessibilityRole="button" onPress={() => setSearch('')} style={s.outline}><Text style={s.link}>{t('clearSearch')}</Text></Pressable></View>}
          {!loading && filteredEmployees.map((employee, i) => <View key={employee.id} style={s.employee}>
            <View style={s.employeeTop}><View style={[s.avatar, { backgroundColor: ['#eeebff', '#e7f4f2', '#fff1df'][i % 3] }]}><Text style={{ color: accents[i % 3], fontWeight: '700' }}>{employee.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.employeeName}>{employee.name}</Text><Text style={s.position}>{employee.position}</Text></View><Text style={s.salary}>{money(employee.salary)}<Text style={s.perMonth}>{t('perMonth')}</Text></Text></View>
            <View style={s.employeeBottom}><View style={[s.badge, employee.status === 'On Leave' && { backgroundColor: '#fff3df' }]}><View style={[s.dot, employee.status === 'On Leave' && { backgroundColor: '#c17d29' }]} /><Text style={[s.badgeText, employee.status === 'On Leave' && { color: '#a36a20' }]}>{t(employee.status === 'Active' ? 'statusActive' : 'statusOnLeave')}</Text></View><View style={s.actions}><Pressable accessibilityRole="button" accessibilityLabel={t('editFor', { name: employee.name })} disabled={disabled} onPress={() => setEditing(employee)} style={[s.action, disabled && s.dim]}><Feather name="edit-2" size={13} color="#6558db" /><Text style={s.link}>{t('edit')}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={t('toggleFor', { name: employee.name })} disabled={disabled} onPress={() => toggle(employee)} style={[s.action, disabled && s.dim]}><Feather name="repeat" size={13} color="#6558db" /><Text style={s.link}>{t('toggleStatus')}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={t('deleteFor', { name: employee.name })} disabled={disabled} onPress={() => remove(employee)} style={[s.action, disabled && s.dim]}><Feather name="trash-2" size={13} color="#c84c61" /><Text style={s.deleteText}>{t('delete')}</Text></Pressable></View></View>
          </View>)}
        </View>
        <View style={[s.panel, wide ? { width: 320, alignSelf: 'flex-start' } : { width: '100%' }]}><View style={s.sectionHeading}><View><Text style={s.sectionTitle}>{t('addEmployee')}</Text><Text style={s.smallText}>{t('addSubtitle')}</Text></View><Feather name="user-plus" size={20} color="#6558db" /></View><View style={s.form}>
          <Text style={s.label}>{t('fullName')}</Text><TextInput accessibilityLabel={t('fullName')} style={s.input} placeholder={t('namePlaceholder')} placeholderTextColor="#969aab" value={name} onChangeText={setName} editable={!disabled} />
          <Text style={s.label}>{t('position')}</Text><TextInput accessibilityLabel={t('position')} style={s.input} placeholder={t('positionPlaceholder')} placeholderTextColor="#969aab" value={position} onChangeText={setPosition} editable={!disabled} />
          <Text style={s.label}>{t('monthlySalary')}</Text><TextInput accessibilityLabel={t('monthlySalary')} style={s.input} placeholder={t('salaryPlaceholder')} placeholderTextColor="#969aab" keyboardType="decimal-pad" value={salary} onChangeText={setSalary} editable={!disabled} onSubmitEditing={addEmployee} />
          {!!formError && <Text accessibilityRole="alert" style={s.error}>{t(formError)}</Text>}
          <Pressable accessibilityRole="button" disabled={disabled} onPress={addEmployee} style={[s.button, disabled && s.dim]}>{busy ? <ActivityIndicator color="#fff" /> : <Feather name="plus" size={17} color="#fff" />}<Text style={s.buttonText}>{t('addEmployee')}</Text></Pressable><Text style={s.formHint}>{t('newStatusHint')}</Text>
        </View></View>
      </View>
      <View style={s.analytics}><View style={s.analyticsHeading}><View style={{ flex: 1, minWidth: 180 }}><View style={s.analyticsLabel}><Feather name="bar-chart-2" size={18} color="#6558db" /><Text style={s.eyebrow}>{t('salaryIntelligence')}</Text></View><Text style={s.sectionTitle}>{t('analysisTitle')}</Text><Text style={s.subtitle}>{t('analysisSubtitle')}</Text></View><Pressable accessibilityRole="button" disabled={disabled} onPress={analyze} style={[s.button, disabled && s.dim]}>{analyzing ? <ActivityIndicator color="#fff" /> : <Feather name="pie-chart" size={16} color="#fff" />}<Text style={s.buttonText}>{t(analyzing ? 'analyzing' : 'analyze')}</Text></Pressable></View>
        {analyzing && <View style={s.empty}><ActivityIndicator size="large" color="#6558db" /><Text style={s.smallText}>{t('calculating')}</Text></View>}
        {!analyzing && !clusters && <View style={s.analysisEmpty}><Text style={s.smallText}>{t('analysisHint')}</Text></View>}
        {clusters && <View style={s.tiers}>{clusters.map((cluster, i) => <View key={cluster.group} style={[s.tier, { borderTopColor: accents[i] }]}><Text style={[s.eyebrow, { color: accents[i] }]}>{t('tier', { number: i + 1 }).toUpperCase()}</Text><Text style={s.tierValue}>{cluster.centroid === null ? '—' : money(cluster.centroid)}</Text><Text style={s.smallText}>{t('averageSalary')}</Text><View style={s.tierBottom}><Text style={s.adminName}>{t(cluster.count === 1 ? 'employeeOne' : 'employeeMany', { count: cluster.count })}</Text><Text style={s.smallText}>{cluster.count === 0 ? t('emptyTier') : 'K-Means · k = 3'}</Text></View></View>)}</View>}
      </View><Text style={s.footer}>{t('footer')}</Text>
    </ScrollView>
    {editing && <EmployeeEditor key={editing.id} employee={editing} disabled={disabled} onClose={() => setEditing(null)} onSave={values => saveEmployee(editing, values)} />}
  </KeyboardAvoidingView></SafeAreaView>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f6fa' }, nav: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e9ebf2', paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, logo: { padding: 8, backgroundColor: '#6558db', borderRadius: 10 }, brandText: { fontSize: 25, fontWeight: '800', color: '#20243b' }, navDivider: { height: 22, width: 1, backgroundColor: '#e5e7ef', marginHorizontal: 8 }, navLabel: { color: '#71778b', fontSize: 12 },
  outline: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 8 }, smallText: { color: '#7b8194', fontSize: 12, lineHeight: 19 }, content: { padding: 24, maxWidth: 1240, width: '100%', alignSelf: 'center', gap: 24 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center' }, eyebrow: { color: '#6558db', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }, title: { color: '#20243b', fontSize: 30, fontWeight: '800', marginTop: 8 }, subtitle: { color: '#7b8194', fontSize: 13, lineHeight: 21, marginTop: 7 },
  admin: { flexDirection: 'row', alignItems: 'center', gap: 10 }, adminName: { color: '#34394e', fontWeight: '600', fontSize: 12 }, avatar: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#eeebff', alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, stat: { flex: 1, minWidth: 145, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e9f1', borderRadius: 14, padding: 18 }, statHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, statValue: { color: '#20243b', fontSize: 25, fontWeight: '700', marginTop: 14 },
  columns: { flexDirection: 'row', gap: 22, alignItems: 'stretch' }, panel: { borderWidth: 1, borderColor: '#e7e9f1', borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, gap: 12 }, sectionTitle: { color: '#262b41', fontSize: 17, fontWeight: '700', marginBottom: 4 }, iconButton: { backgroundColor: '#f6f7fb', padding: 10, borderRadius: 9 },
  searchSection: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 }, searchBox: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#e1e4ee', backgroundColor: '#fcfcfe', borderRadius: 9, paddingLeft: 12 }, searchInput: { flex: 1, minWidth: 0, paddingVertical: 12, fontSize: 13, color: '#34394e' }, clearSearch: { padding: 12 },
  employee: { paddingHorizontal: 20, paddingVertical: 17, borderTopWidth: 1, borderColor: '#eff0f6', gap: 12 }, employeeTop: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, employeeName: { color: '#34394e', fontWeight: '600', fontSize: 14 }, position: { color: '#858b9d', fontSize: 12, marginTop: 4 }, salary: { color: '#34394e', fontSize: 14, fontWeight: '600' }, perMonth: { fontSize: 10, fontWeight: '400', color: '#969aab' }, employeeBottom: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  badge: { flexDirection: 'row', gap: 6, alignItems: 'center', borderRadius: 6, backgroundColor: '#eaf6f1', paddingVertical: 4, paddingHorizontal: 8 }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#258e70' }, badgeText: { fontSize: 10, color: '#258e70', fontWeight: '600' }, actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' }, action: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8 }, link: { color: '#6558db', fontSize: 11, fontWeight: '600' }, deleteText: { color: '#c84c61', fontSize: 11, fontWeight: '600' },
  form: { padding: 20, paddingTop: 0 }, label: { color: '#4e5369', fontSize: 12, fontWeight: '600', marginBottom: 8 }, input: { borderWidth: 1, borderColor: '#e1e4ee', borderRadius: 8, padding: 12, backgroundColor: '#fcfcfe', color: '#34394e', marginBottom: 18, fontSize: 13 }, button: { backgroundColor: '#6558db', borderRadius: 9, paddingVertical: 13, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }, buttonText: { color: '#fff', fontSize: 12, fontWeight: '700' }, dim: { opacity: 0.5 }, formHint: { color: '#9297a7', fontSize: 10, lineHeight: 18, textAlign: 'center', marginTop: 13 },
  analytics: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e9f1', borderRadius: 16, padding: 22 }, analyticsHeading: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, alignItems: 'center', justifyContent: 'space-between' }, analyticsLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }, analysisEmpty: { borderTopWidth: 1, borderColor: '#eff0f6', marginTop: 22, paddingTop: 20 }, tiers: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 24 }, tier: { flex: 1, minWidth: 210, backgroundColor: '#fafbfe', borderWidth: 1, borderColor: '#e9ebf3', borderTopWidth: 3, borderRadius: 10, padding: 18 }, tierValue: { color: '#262b41', fontSize: 28, fontWeight: '700', marginTop: 18, marginBottom: 4 }, tierBottom: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderColor: '#e5e8f0', gap: 3 }, empty: { padding: 35, alignItems: 'center', gap: 12 },
  errorBanner: { padding: 14, borderRadius: 10, backgroundColor: '#fff0f2', gap: 8 }, error: { color: '#b9384f', fontSize: 12, lineHeight: 19, marginBottom: 8 }, footer: { textAlign: 'center', color: '#a0a5b5', fontSize: 11, paddingBottom: 12 },
});
