import { Alert, Platform } from 'react-native';
export function showError(message: string) {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert('Unable to complete request', message);
}
export function confirmDelete(name: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`Are you sure?\nDelete ${name}? This cannot be undone.`)) onConfirm();
  } else {
    Alert.alert('Are you sure?', `Delete ${name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]);
  }
}
