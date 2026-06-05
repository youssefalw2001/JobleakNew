/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LoggedCall {
  id: string;
  timestamp: string;
  city: string;
  industry: string;
  status: 'Inbound' | 'Outbound' | 'Missed';
  notes: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  amount: number;
  plan: string;
  status: 'Paid' | 'Processing' | 'Failed';
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  password?: string;
  businessName: string;
  industry: string;
  city: string;
  subscriptionPlan: 'Free Trial' | 'Starter' | 'Growth' | 'Pro';
  loggedCalls: LoggedCall[];
  billingHistory: BillingInvoice[];
  adSpendSaved: number;
  activeLeadsCount: number;
}

const USERS_DB_KEY = 'jobleak_users_db_v1';
const SESSION_KEY = 'jobleak_active_session_v3'; // v3 clears all prior stale sessions
const REMEMBERED_KEY = 'jobleak_remembered_credentials_v1';

// Local localStorage fallback definitions removed in favor of direct Firestore usage.
export function getUsersDatabase(): AuthUser[] {
  return [];
}
export function saveUsersDatabase(db: AuthUser[]) {
  // no-op, managed by Firestore Auth
}

export function getActiveSession(): AuthUser | null {
  try {
    // Clear any old session keys from previous versions
    localStorage.removeItem('jobleak_active_session_v1');
    localStorage.removeItem('jobleak_active_session_v2');
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw) as AuthUser;
    }
  } catch (e) {
    console.error('Error reading active session:', e);
  }
  return null;
}

export function saveActiveSession(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      // Sync dynamically inside users database
      const db = getUsersDatabase();
      const idx = db.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        db[idx] = user;
        saveUsersDatabase(db);
      }
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.error('Error writing active session:', e);
  }
}

// Remembered/saved credentials details helper
export interface RememberedCreds {
  email?: string;
  phone?: string;
  password?: string;
  remember: boolean;
}

export function getSavedCredentials(): RememberedCreds | null {
  try {
    const raw = localStorage.getItem(REMEMBERED_KEY);
    if (raw) {
      return JSON.parse(raw) as RememberedCreds;
    }
  } catch (e) {
    console.error('Error reading saved credentials:', e);
  }
  return null;
}

export function saveCredentials(creds: RememberedCreds | null) {
  try {
    if (creds && creds.remember) {
      localStorage.setItem(REMEMBERED_KEY, JSON.stringify(creds));
    } else {
      localStorage.removeItem(REMEMBERED_KEY);
    }
  } catch (e) {
    console.error('Error saving credentials:', e);
  }
}

// Update local session items like billing, subscription choices, or logged calls
export function updateSessionContext(updatedFields: Partial<AuthUser>) {
  const session = getActiveSession();
  if (session) {
    const freshSession = { ...session, ...updatedFields };
    saveActiveSession(freshSession);
    return freshSession;
  }
  return null;
}
