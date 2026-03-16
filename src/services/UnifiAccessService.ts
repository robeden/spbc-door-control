import { Door, LockStatus, UnlockRequest, AuthenticationError } from '../types';

const API_KEY_STORAGE_KEY = 'unifi_api_key';
const API_BASE_URL_STORAGE_KEY = 'unifi_api_base_url';

class UnifiAccessService {
  private apiKey: string;
  private baseUrl: string;

  // No more stubbed state - all data comes from API

  constructor() {
    // Load from localStorage
    this.apiKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    this.baseUrl = localStorage.getItem(API_BASE_URL_STORAGE_KEY) || import.meta.env.VITE_API_BASE_URL || 'https://172.28.0.1:12445';
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

  async getDoors(): Promise<Door[]> {
    const response = await this.makeApiRequest('/doors');
    const body = await response.json();

    return body.data.map((door: any) => ({
      id: door.id,
      name: door.name
    }));
  }

  async getLockStatus(): Promise<LockStatus> {
    const doors = await this.getDoors();

    // Query lock rule for each door
    const statusPromises = doors.map(async (door) => {
      try {
        const response = await this.makeApiRequest(`/doors/${door.id}/lock_rule`);
        const body = await response.json();
        const rule = body.data;

        // Only track custom timed rules we set (not keep_unlock or empty rules)
        // ended_time is epoch seconds; type is 'custom' when we've unlocked it
        if (rule.type === 'custom' && rule.ended_time > 0) {
          return {
            door,
            isUnlocked: true,
            expiresAt: new Date(rule.ended_time * 1000)
          };
        }
        return { door, isUnlocked: false };
      } catch (err) {
        return { door, isUnlocked: false };
      }
    });

    const statuses = await Promise.all(statusPromises);

    // Determine if any doors are unlocked
    const unlockedDoorStatuses = statuses.filter(s => s.isUnlocked);

    if (unlockedDoorStatuses.length === 0) {
      return { locked: true };
    }

    // Find earliest expiration time
    const earliestExpiration = unlockedDoorStatuses.reduce((earliest, current) => {
      if (!current.expiresAt) return earliest;
      if (!earliest || current.expiresAt < earliest) return current.expiresAt;
      return earliest;
    }, null as Date | null);

    return {
      locked: false,
      unlockedDoors: unlockedDoorStatuses.map(s => s.door.name),
      unlockUntil: earliestExpiration || undefined
    };
  }

  async unlock(request: UnlockRequest): Promise<void> {
    // Unlock each selected door with custom unlock rule
    const unlockPromises = request.doorIds.map(doorId =>
      this.makeApiRequest(`/doors/${doorId}/lock_rule`, {
        method: 'PUT',
        body: JSON.stringify({
          type: 'custom',
          interval: request.durationMinutes
        })
      })
    );

    // Wait for all unlocks to complete
    await Promise.all(unlockPromises);
  }

  async lock(): Promise<void> {
    const doors = await this.getDoors();

    const lockPromises = doors.map(async (door) => {
      const response = await this.makeApiRequest(`/doors/${door.id}/lock_rule`);
      const body = await response.json();
      const rule = body.data;

      if (rule.type === 'custom') {
        return this.makeApiRequest(`/doors/${door.id}/lock_rule`, {
          method: 'PUT',
          body: JSON.stringify({ type: 'reset' })
        });
      } else if (rule.type === 'keep_unlock') {
        return this.makeApiRequest(`/doors/${door.id}/lock_rule`, {
          method: 'PUT',
          body: JSON.stringify({ type: 'lock_early' })
        });
      }
      // type === '' means already locked, nothing to do
    });

    await Promise.all(lockPromises);
  }

  async addTime(minutes: number): Promise<void> {
    // Get current status to know which doors are unlocked and when they expire
    const currentStatus = await this.getLockStatus();

    if (currentStatus.locked || !currentStatus.unlockUntil) {
      return; // Nothing to extend
    }

    // Calculate remaining time in minutes
    const now = Date.now();
    const expiresAt = currentStatus.unlockUntil.getTime();
    const remainingMs = Math.max(0, expiresAt - now);
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    // New duration = remaining time + additional minutes
    const newDuration = remainingMinutes + minutes;

    // Get all doors to map names to IDs
    const allDoors = await this.getDoors();

    // Find which door IDs are currently unlocked
    const unlockedDoorIds = allDoors
      .filter(door => currentStatus.unlockedDoors?.includes(door.name))
      .map(door => door.id);

    // Re-apply unlock rule with new duration (this overrides the previous rule)
    await this.unlock({
      doorIds: unlockedDoorIds,
      durationMinutes: newDuration
    });
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
      throw new AuthenticationError(`${response.status} ${response.statusText} — ${url}`);
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }
}

// Export a singleton instance
export const unifiAccessService = new UnifiAccessService();
