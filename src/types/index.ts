export interface Door {
  id: string;
  name: string;
}

export interface LockStatus {
  locked: boolean;
  unlockedDoors?: string[];  // Door names
  unlockUntil?: Date;        // When doors re-lock
}

export interface UnlockRequest {
  doorIds: string[];
  durationMinutes: number;
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
