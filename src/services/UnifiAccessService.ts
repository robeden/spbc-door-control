import { Door, LockStatus, UnlockRequest, AuthenticationError } from '../types';

const API_KEY_STORAGE_KEY = 'unifi_api_key';
const API_BASE_URL_STORAGE_KEY = 'unifi_api_base_url';

class UnifiAccessService {
  private apiKey: string;
  private baseUrl: string;

  // Stubbed state for testing
  private locked: boolean = true;
  private unlockedDoorIds: string[] = [];
  private unlockUntil: Date | undefined = undefined;

  // Hardcoded door list for stubbed implementation
  private doors: Door[] = [
    { id: '1', name: 'Main Door' },
    { id: '2', name: 'Sanctuary Door' },
    { id: '3', name: 'Rear Door' },
    { id: '4', name: 'Kitchen Door' },
  ];

  constructor() {
    // Load from localStorage
    this.apiKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    this.baseUrl = localStorage.getItem(API_BASE_URL_STORAGE_KEY) || 'https://172.28.0.1:12445';
  }

  // Check if API key is configured
  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Set API key and base URL
  setApiKey(key: string, baseUrl?: string): void {
    this.apiKey = key;
    localStorage.setItem(API_KEY_STORAGE_KEY, key);

    if (baseUrl) {
      this.baseUrl = baseUrl;
      localStorage.setItem(API_BASE_URL_STORAGE_KEY, baseUrl);
    }
  }

  // Clear API key (for re-authentication)
  clearApiKey(): void {
    this.apiKey = '';
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  // Get current base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async getDoors(): Promise<Door[]> {
    await this.simulateDelay();
    return [...this.doors];
  }

  async getLockStatus(): Promise<LockStatus> {
    await this.simulateDelay();

    if (this.locked) {
      return { locked: true };
    }

    // Get door names for unlocked doors
    const unlockedDoors = this.doors
      .filter(door => this.unlockedDoorIds.includes(door.id))
      .map(door => door.name);

    return {
      locked: false,
      unlockedDoors,
      unlockUntil: this.unlockUntil,
    };
  }

  async unlock(request: UnlockRequest): Promise<void> {
    await this.simulateDelay();

    this.locked = false;
    this.unlockedDoorIds = [...request.doorIds];
    this.unlockUntil = new Date(Date.now() + request.durationMinutes * 60 * 1000);
  }

  async lock(): Promise<void> {
    await this.simulateDelay();

    this.locked = true;
    this.unlockedDoorIds = [];
    this.unlockUntil = undefined;
  }

  async addTime(minutes: number): Promise<void> {
    await this.simulateDelay();

    if (!this.locked && this.unlockUntil) {
      this.unlockUntil = new Date(this.unlockUntil.getTime() + minutes * 60 * 1000);
    }
  }

  // Helper method for real API implementation
  // This will be used when replacing stubbed methods with real API calls
  private async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}/api/v1/developer${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Check for authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Invalid or expired API key');
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }
}

// Export a singleton instance
export const unifiAccessService = new UnifiAccessService();
