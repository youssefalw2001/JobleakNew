/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead } from './types';

export interface SaveLeadResponse {
  saved: boolean;
  reason?: string;
  lead?: Lead;
}

const LOCAL_STORAGE_KEY = 'jobleak_leads_localStorage';

/**
 * Get lead list backed up in standard client localStorage
 */
export function getLocalLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Lead[];
    }
  } catch (e) {
    console.error('Error reading local leads storage:', e);
  }
  return [];
}

/**
 * Save lead locally to persistent cache for dashboard previews and client demonstration
 */
export function persistLeadLocally(lead: Lead): void {
  try {
    const list = getLocalLeads();
    // Prepend new lead
    const updated = [lead, ...list.filter(old => old.id !== lead.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist lead locally:', e);
  }
}

/**
 * Save lead details to Supabase table `public.jobleak_leads` via REST API wrapper
 */
export async function saveLead(input: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<SaveLeadResponse> {
  const env = (import.meta as any).env || {};
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  // Build local fallback object
  const newLead: Lead = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    created_at: new Date().toISOString(),
    business_name: input.business_name,
    industry: input.industry,
    city: input.city,
    website: input.website || '',
    email: input.email,
    phone: input.phone || '',
    goal: input.goal || '',
    status: 'new'
  };

  // Always save locally to showcase live in UI/Admin immediately!
  persistLeadLocally(newLead);

  if (!supabaseUrl || !anonKey) {
    console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Saving locally for UI and returning warning.');
    return { 
      saved: false, 
      reason: "missing_env",
      lead: newLead
    };
  }

  // Robustly handle both full Url starting with http(s) and bare reference IDs
  let formattedUrl = supabaseUrl.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}.supabase.co`;
  }

  try {
    // Post directly to the rest endpoint
    const url = `${formattedUrl.replace(/\/$/, '')}/rest/v1/jobleak_leads`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Prefer': 'return=representation' // Let's try representation so we check returned values, falls back easily
      },
      body: JSON.stringify({
        business_name: newLead.business_name,
        industry: newLead.industry,
        city: newLead.city,
        website: newLead.website,
        email: newLead.email,
        phone: newLead.phone,
        goal: newLead.goal,
        status: newLead.status
      })
    });

    if (!response.ok) {
      // Fallback with minimal if table returns header-specific locks or RLS denials
      const errText = await response.text();
      console.error('Supabase REST error payload:', errText);
      return {
        saved: false,
        reason: `API response error: ${response.status} (${errText})`,
        lead: newLead
      };
    }

    return {
      saved: true,
      lead: newLead
    };
  } catch (error) {
    console.error('Network failure in saveLead SUPABASE REST dispatch:', error);
    return {
      saved: false,
      reason: error instanceof Error ? error.message : String(error),
      lead: newLead
    };
  }
}
