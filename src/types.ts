/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Lead {
  id: string;
  created_at: string;
  business_name: string;
  industry: string;
  city: string;
  website: string;
  email: string;
  phone: string;
  goal: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
}

export interface MarketProfile {
  name: string;
  growth: number;
  permitHeat: number;
  businessActivity: number;
  publicBids: number;
}

export interface StateDetails {
  code: string;
  name: string;
  cities: string[];
}

export const StatesList: StateDetails[] = [
  { code: 'TX', name: 'Texas', cities: ['Austin', 'Dallas', 'Houston'] },
  { code: 'AZ', name: 'Arizona', cities: ['Phoenix'] },
  { code: 'FL', name: 'Florida', cities: ['Tampa', 'Orlando'] },
  { code: 'CO', name: 'Colorado', cities: ['Denver'] },
  { code: 'GA', name: 'Georgia', cities: ['Atlanta'] },
  { code: 'NC', name: 'North Carolina', cities: ['Charlotte'] },
  { code: 'NY', name: 'New York', cities: ['Buffalo'] }
];

export const MarketProfiles: Record<string, MarketProfile> = {
  phoenix: { name: 'Phoenix', growth: 22, permitHeat: 24, businessActivity: 18, publicBids: 11 },
  austin: { name: 'Austin', growth: 23, permitHeat: 25, businessActivity: 22, publicBids: 13 },
  dallas: { name: 'Dallas', growth: 22, permitHeat: 23, businessActivity: 20, publicBids: 13 },
  tampa: { name: 'Tampa', growth: 19, permitHeat: 20, businessActivity: 18, publicBids: 11 },
  houston: { name: 'Houston', growth: 24, permitHeat: 24, businessActivity: 21, publicBids: 15 },
  orlando: { name: 'Orlando', growth: 20, permitHeat: 21, businessActivity: 19, publicBids: 11 },
  atlanta: { name: 'Atlanta', growth: 18, permitHeat: 19, businessActivity: 18, publicBids: 12 },
  charlotte: { name: 'Charlotte', growth: 19, permitHeat: 20, businessActivity: 17, publicBids: 11 },
  denver: { name: 'Denver', growth: 17, permitHeat: 19, businessActivity: 16, publicBids: 12 },
  buffalo: { name: 'Buffalo', growth: 10, permitHeat: 11, businessActivity: 9, publicBids: 10 }
};

export const DefaultProfile: MarketProfile = { name: 'Default', growth: 14, permitHeat: 15, businessActivity: 12, publicBids: 8 };

export interface WeatherData {
  city: string;
  region?: string;
  lat: number;
  lng: number;
  currentTemp: number;
  maxTemp: number;
  minTemp: number;
  maxWind: number;
  maxRainProb: number;
  maxPrecip: number;
  maxHumidity: number;
  alerts: Array<{ event: string; severity: string }>;
  weatherUrgency: number;
  triggers: string[];
}

// Algorithmic Search Intent Estimation
export function getMarketProfile(city: string): MarketProfile {
  const normalized = city.toLowerCase().trim();
  for (const key of Object.keys(MarketProfiles)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return MarketProfiles[key];
    }
  }
  return { ...DefaultProfile, name: city };
}

export function calculateSearchIntentScore(city: string, serviceText: string, industry: string): {
  score: number;
  competition: 'High' | 'Medium' | 'Low';
  cpcTier: 'High' | 'Medium';
} {
  const profile = getMarketProfile(city);
  const urgentRegex = /(repair|emergency|leak|damage|drain|spring|ac|furnace|pest|rodent|termite)/i;
  
  const urgentServiceBoost = urgentRegex.test(serviceText) ? 18 : 8;
  
  const hvacMatch = /hvac|heating|cooling|ac|air conditioning/i;
  const plumbingMatch = /plumbing|plumber|drain|sewer|water/i;
  const roofingMatch = /roofing|roof|shingle/i;
  const garageMatch = /garage|door|spring/i;
  
  const indNormalized = industry.toLowerCase();
  const isHighValue = 
    indNormalized === 'hvac' || 
    indNormalized === 'plumbing' || 
    indNormalized === 'roofing' || 
    indNormalized === 'garage door' ||
    hvacMatch.test(indNormalized) ||
    plumbingMatch.test(indNormalized) ||
    roofingMatch.test(indNormalized) ||
    garageMatch.test(indNormalized);
    
  const highValueIndustryBoost = isHighValue ? 10 : 5;
  const score = Math.min(95, 55 + urgentServiceBoost + highValueIndustryBoost + Math.round(profile.growth / 3));
  
  const competition = score >= 82 ? 'High' : score >= 70 ? 'Medium' : 'Low';
  const cpcTier = isHighValue ? 'High' : 'Medium';
  
  return { score, competition, cpcTier };
}

// Weather Trigger Engine Helper
export function analyzeWeatherTriggers(
  maxTemp: number, 
  minTemp: number, 
  maxWind: number, 
  maxRainProb: number, 
  maxPrecip: number, 
  maxHumidity: number,
  alerts: Array<{ event: string; severity: string }>
): { triggers: string[]; urgency: number } {
  const triggers: string[] = [];
  let urgency = 2; // base urgency

  const hasNWSAlert = alerts.length > 0;

  // HVAC Triggers
  if (maxTemp >= 100) {
    triggers.push('HVAC: Extreme Heat Warning');
    urgency = Math.max(urgency, 10);
  } else if (maxTemp >= 95) {
    triggers.push('HVAC: High Temperature Surge');
    urgency = Math.max(urgency, 7);
  }
  if (minTemp <= 32) {
    triggers.push('HVAC: Freeze/Furnace Threat');
    urgency = Math.max(urgency, 6);
  }

  // Roofing Triggers
  if (maxWind >= 45) {
    triggers.push('Roofing: Storm Hazard (Gale Force)');
    urgency = Math.max(urgency, 10);
  } else if (maxWind >= 35) {
    triggers.push('Roofing: Storm Damage Threat');
    urgency = Math.max(urgency, 7);
  }
  if (maxRainProb >= 60 || maxPrecip >= 0.5) {
    triggers.push('Roofing: Elevated Roof Leak Risk');
    urgency = Math.max(urgency, 6);
  }

  // Plumbing Triggers
  if (minTemp <= 28) {
    triggers.push('Plumbing: Hard Freeze Warning');
    urgency = Math.max(urgency, 10);
  } else if (minTemp <= 32) {
    triggers.push('Plumbing: Pipe Freeze Alert');
    urgency = Math.max(urgency, 7);
  }
  if (maxRainProb >= 70) {
    triggers.push('Plumbing: Excessive Sewer/Drain Pressure');
    urgency = Math.max(urgency, 6);
  }

  // Electrical Triggers
  if (maxTemp >= 95) {
    triggers.push('Electrical: Grid Overload (HVAC peak)');
    urgency = Math.max(urgency, 5);
  }
  if (hasNWSAlert) {
    triggers.push('Electrical: Utility Outage Storm Threat');
    urgency = Math.max(urgency, 9);
  }

  // Pest Triggers
  if (maxHumidity >= 65 && maxTemp >= 75) {
    triggers.push('Pest: High Humidity Swarm Alert');
    urgency = Math.max(urgency, 8);
  } else if (maxHumidity >= 60 && maxTemp >= 70) {
    triggers.push('Pest: Insect Breeding Conditions');
    urgency = Math.max(urgency, 6);
  }

  // Garage Door Triggers
  if (maxWind >= 35) {
    triggers.push('Garage Door: Structural Wind Load');
    urgency = Math.max(urgency, 6);
  }

  return { triggers, urgency };
}

// Card Scoring Math Matrix logic
export function calculateCardScores(
  weatherUrgency: number, 
  searchScore: number, 
  industry: string
): {
  googleSearch: number;
  lsa: number;
  reactivation: number;
} {
  const ind = industry.toLowerCase();
  let industryBoost = 0;
  if (ind.includes('hvac')) industryBoost = 3;
  else if (ind.includes('plumb')) industryBoost = 2;
  else if (ind.includes('roof')) industryBoost = 2;
  else if (ind.includes('garage') || ind.includes('door')) industryBoost = 2;
  else if (ind.includes('electric')) industryBoost = 1;
  else if (ind.includes('pest')) industryBoost = 1;

  // Google Search total
  const urgGS = Math.min(25, 20 + weatherUrgency);
  const siGS = Math.min(25, searchScore / 4);
  const googleSearch = Math.min(100, urgGS + siGS + 15 + 14 + 8 + industryBoost - 4);

  // LSA total
  const urgLSA = Math.min(25, 18 + weatherUrgency / 2);
  const siLSA = Math.min(25, searchScore / 4);
  const lsa = Math.min(100, urgLSA + siLSA + 18 + 14 + 7 + industryBoost - 6);

  // Reactivation total
  const reactivation = Math.min(100, 14 + 16 + 14 + 12 + 9 + industryBoost - 2);

  return { googleSearch, lsa, reactivation };
}
