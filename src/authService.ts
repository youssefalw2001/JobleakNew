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
const SESSION_KEY = 'jobleak_active_session_v1';
const REMEMBERED_KEY = 'jobleak_remembered_credentials_v1';

// Initial dummy database for standard sandbox play (with generic mock emails, NOT prebaking the current user's personal details)
const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'user-demo-1',
    email: 'alpha@contractormarketing.com',
    phone: '+1 (512) 555-0199',
    password: 'password123',
    businessName: 'Alpha General HVAC',
    industry: 'HVAC',
    city: 'Austin',
    subscriptionPlan: 'Starter',
    loggedCalls: [
      { id: 'c-1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), city: 'Austin', industry: 'HVAC', status: 'Inbound', notes: 'Immediate emergency compressor troubleshooting' },
      { id: 'c-2', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), city: 'Austin', industry: 'HVAC', status: 'Inbound', notes: 'Same-day capacitor replace' }
    ],
    billingHistory: [
      { id: 'i-1', invoiceNo: 'INV-2026-001', date: '21 May 2026', amount: 99, plan: 'Starter Plan', status: 'Paid' }
    ],
    adSpendSaved: 420,
    activeLeadsCount: 5
  },
  {
    id: 'user-demo-2',
    email: 'homer@texasroofing.net',
    phone: '+2 (713) 555-5381',
    password: 'password123',
    businessName: 'Lone Star Roof Master',
    industry: 'Roofing',
    city: 'Houston',
    subscriptionPlan: 'Growth',
    loggedCalls: [
      { id: 'c-3', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), city: 'Houston', industry: 'Roofing', status: 'Inbound', notes: 'Severe wind damage shingle replacement quotes requested' }
    ],
    billingHistory: [
      { id: 'i-2', invoiceNo: 'INV-2026-088', date: '18 May 2026', amount: 199, plan: 'Growth Plan', status: 'Paid' },
      { id: 'i-3', invoiceNo: 'INV-2026-002', date: '18 April 2026', amount: 199, plan: 'Growth Plan', status: 'Paid' }
    ],
    adSpendSaved: 1100,
    activeLeadsCount: 16
  }
];

export function getUsersDatabase(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) {
      return JSON.parse(raw) as AuthUser[];
    }
  } catch (e) {
    console.error('Error getting user database:', e);
  }
  // Initialize with defaults if empty
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_USERS));
  } catch (err) {
    console.warn('LocalStorage write error while initializing empty users:', err);
  }
  return DEFAULT_USERS;
}

export function saveUsersDatabase(db: AuthUser[]) {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving user database:', e);
  }
}

export function getActiveSession(): AuthUser | null {
  try {
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
