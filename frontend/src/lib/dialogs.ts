import { Alert, Platform } from 'react-native';
export function showError(message: string, title = 'Unable to complete request') {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert(title, message);
}
type DeleteDialogCopy = { title: string; message: string; cancel: string; confirm: string };
export function confirmDelete(name: string, onConfirm: () => void, copy: DeleteDialogCopy = {
  title: 'Are you sure?', message: `Delete ${name}? This cannot be undone.`, cancel: 'Cancel', confirm: 'Delete',
}) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${copy.title}\n${copy.message}`)) onConfirm();
  } else {
    Alert.alert(copy.title, copy.message, [
      { text: copy.cancel, style: 'cancel' }, { text: copy.confirm, style: 'destructive', onPress: onConfirm },
    ]);
  }
}
