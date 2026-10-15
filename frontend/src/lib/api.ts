import Constants from 'expo-constants';
import { Platform } from 'react-native';
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
const defaultHost = Platform.OS === 'web' ? 'localhost' : devHost || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:5000`).replace(/\/$/, '');
export type Employee = { id: string; name: string; position: string; status: 'Active' | 'On Leave'; salary: number };
export type Cluster = { group: string; centroid: number | null; count: number };
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function request<T>(path: string, token?: string | null, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new ApiError(data.error || 'The request failed.', response.status);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(`Cannot connect to the server at ${API_URL}. Check that the backend is running and the API address is correct.`);
  } finally { clearTimeout(timeout); }
}
