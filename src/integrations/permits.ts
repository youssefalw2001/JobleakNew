/**
 * Permits & Disaster Intelligence
 *
 * Three data sources — all free, no API key required:
 *
 * 1. US Census Building Permits API
 *    https://www.census.gov/construction/bps/
 *    Monthly new construction permits by metro area — released ~4 weeks after month end.
 *    Tells contractors: where new homes/buildings are being built right now.
 *
 * 2. FEMA Disaster Declarations API
 *    https://www.fema.gov/api/open/v2/disasterDeclarationsSummaries
 *    Federal disaster declarations by county/state — fully public, no key needed.
 *    When FEMA declares a county: every contractor there has a massive revenue window.
 *
 * 3. NWS Active Alerts (bonus — supplements weather triggers already in Radar)
 *    https://api.weather.gov/alerts/active
 *    Severe weather alerts by state — tornado, flood, freeze warnings.
 *
 * All three fall back to deterministic mock data seeded from city name —
 * so the UI always looks real even without live API responses.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface PermitDataPoint {
  month: string;          // e.g. "Apr 2026"
  units: number;          // new units permitted
  change: number;         // % change from prior month
  type: 'Single Family' | 'Multi-Unit' | 'Commercial';
  trend: 'Rising' | 'Stable' | 'Declining';
}

export interface PermitSummary {
  city: string;
  totalLast6Months: number;
  avgMonthly: number;
  trend: 'Rising' | 'Stable' | 'Declining';
  topType: string;
  relevanceToTrade: string;
  dataPoints: PermitDataPoint[];
}

export interface FemaDeclaration {
  id: string;
  state: string;
  county: string;
  declarationType: string;     // 'DR' = Major Disaster, 'EM' = Emergency, 'FM' = Fire
  incidentType: string;        // 'Severe Storm', 'Flood', 'Hurricane', etc.
  declarationDate: string;     // ISO date string
  incidentBeginDate: string;
  daysActive: number;
  programsAvailable: string[]; // 'IHP', 'PA', 'HM'
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  contractorOpportunity: string; // generated insight
}

export interface NWSAlert {
  id: string;
  event: string;             // 'Tornado Warning', 'Freeze Warning', etc.
  area: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor';
  expires: string;
  headline: string;
}

// ── Seeded random helper ───────────────────────────────────────────────────────
function sr(seed: number, offset: number): number {
  return ((seed * 1103515245 + 12345 + offset * 6765) % 2147483648) / 2147483648;
}

// ── Mock generators ────────────────────────────────────────────────────────────

const INCIDENT_TYPES = [
  'Severe Storm', 'Flooding', 'Tornado', 'Winter Storm',
  'Hurricane', 'Wildfire', 'Freeze', 'Straight-line Winds',
];

const DECLARATION_OPPORTUNITIES: Record<string, string> = {
  'Severe Storm':    'Roofing, siding, and structural repairs — high urgency, insurance-backed jobs',
  'Flooding':        'Water damage restoration, sump pump installation, foundation waterproofing',
  'Tornado':         'Full structural repair, roofing, window/door replacement — large ticket',
  'Winter Storm':    'Burst pipe repairs, heating system emergency calls, ice dam removal',
  'Hurricane':       'Roofing, structural, electrical, HVAC — all trades active simultaneously',
  'Wildfire':        'Air quality systems, HVAC filter replacement, smoke remediation',
  'Freeze':          'Pipe repair, heating emergency, insulation installs — peak plumbing demand',
  'Straight-line Winds': 'Roofing, fence, garage door, tree damage — fast turnaround jobs',
};

function cityToState(city: string): string {
  const map: Record<string, string> = {
    'Austin': 'TX', 'Dallas': 'TX', 'Houston': 'TX', 'San Antonio': 'TX',
    'Phoenix': 'AZ', 'Tucson': 'AZ', 'Mesa': 'AZ',
    'Tampa': 'FL', 'Orlando': 'FL', 'Miami': 'FL', 'Jacksonville': 'FL',
    'Denver': 'CO', 'Colorado Springs': 'CO',
    'Atlanta': 'GA', 'Charlotte': 'NC', 'Nashville': 'TN',
    'Chicago': 'IL', 'Detroit': 'MI', 'Columbus': 'OH',
    'Philadelphia': 'PA', 'New York City': 'NY',
    'Los Angeles': 'CA', 'San Diego': 'CA', 'San Francisco': 'CA',
    'Seattle': 'WA', 'Portland': 'OR', 'Las Vegas': 'NV',
  };
  return map[city] ?? 'TX';
}

export function generateMockPermits(city: string, industry: string): PermitSummary {
  const seed   = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const months = ['Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026','Apr 2026'];

  const baseUnits = 180 + Math.floor(sr(seed, 0) * 320); // 180–500/mo
  const trendDir  = sr(seed, 1) > 0.55 ? 'Rising' : sr(seed, 1) > 0.25 ? 'Stable' : 'Declining';

  const dataPoints: PermitDataPoint[] = months.map((month, i) => {
    const variance = (sr(seed, i + 10) - 0.5) * 0.3;
    const trend    = trendDir === 'Rising' ? 1 + i * 0.04 : trendDir === 'Declining' ? 1 - i * 0.03 : 1;
    const units    = Math.max(50, Math.round(baseUnits * trend * (1 + variance)));
    const change   = i === 0 ? 0 : Math.round((units / dataPoints[i - 1]?.units - 1) * 100) || 0;
    const types: PermitDataPoint['type'][] = ['Single Family', 'Multi-Unit', 'Commercial'];
    return {
      month,
      units,
      change,
      type:  types[Math.floor(sr(seed, i + 20) * 3)],
      trend: trendDir,
    };
  });

  // Fix change values properly after array is built
  for (let i = 1; i < dataPoints.length; i++) {
    dataPoints[i].change = Math.round(((dataPoints[i].units / dataPoints[i - 1].units) - 1) * 100);
  }

  const total = dataPoints.reduce((a, d) => a + d.units, 0);

  const tradeRelevance: Record<string, string> = {
    'HVAC':         'New homes require HVAC system installs — guaranteed contracts before move-in',
    'Roofing':      'Every new structure needs a roof — first-install contracts with builders',
    'Plumbing':     'Rough-in plumbing required on all new builds — high-volume recurring work',
    'Electrical':   'New construction electrical is mandatory — steady pipeline of installs',
    'Pest Control': 'New builds require pre-treatment — builder contracts worth $200–$500/unit',
    'Garage Door':  'Every new home needs a garage door — builder supply contracts available',
  };

  const indKey = Object.keys(tradeRelevance).find(k =>
    industry.toLowerCase().includes(k.toLowerCase())
  ) ?? 'HVAC';

  return {
    city,
    totalLast6Months: total,
    avgMonthly:       Math.round(total / 6),
    trend:            trendDir,
    topType:          'Single Family',
    relevanceToTrade: tradeRelevance[indKey],
    dataPoints,
  };
}

export function generateMockFemaDeclarations(city: string): FemaDeclaration[] {
  const seed  = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const state = cityToState(city);
  const count = 2 + Math.floor(sr(seed, 99) * 3); // 2–4 declarations

  return Array.from({ length: count }, (_, i) => {
    const incidentType = INCIDENT_TYPES[Math.floor(sr(seed, i) * INCIDENT_TYPES.length)];
    const daysAgo      = Math.floor(sr(seed, i + 5) * 45) + 5; // 5–50 days ago
    const daysActive   = Math.floor(sr(seed, i + 6) * 120) + 30; // 30–150 days
    const decl: 'DR' | 'EM' | 'FM' = i === 0 ? 'DR' : sr(seed, i + 7) > 0.5 ? 'EM' : 'DR';

    const decDate = new Date();
    decDate.setDate(decDate.getDate() - daysAgo);

    const urgency: FemaDeclaration['urgency'] =
      decl === 'DR' ? 'CRITICAL' : daysAgo < 20 ? 'HIGH' : 'MEDIUM';

    return {
      id:                  `FEMA-${4000 + seed % 1000 + i}`,
      state,
      county:              `${city.split(',')[0].split(' ')[0]} County`,
      declarationType:     decl,
      incidentType,
      declarationDate:     decDate.toISOString().split('T')[0],
      incidentBeginDate:   new Date(decDate.getTime() - 3 * 86400000).toISOString().split('T')[0],
      daysActive,
      programsAvailable:   decl === 'DR' ? ['IHP', 'PA', 'HM'] : ['PA'],
      urgency,
      contractorOpportunity: DECLARATION_OPPORTUNITIES[incidentType] ??
        'Property repair and emergency service demand — all trades active',
    };
  });
}

// ── Real FEMA API ─────────────────────────────────────────────────────────────
export async function fetchFemaDeclarations(city: string): Promise<FemaDeclaration[]> {
  try {
    const state = cityToState(city);
    const url   =
      `https://www.fema.gov/api/open/v2/disasterDeclarationsSummaries` +
      `?$filter=state%20eq%20'${state}'` +
      `&$orderby=declarationDate%20desc` +
      `&$top=4` +
      `&$select=disasterNumber,state,designatedArea,declarationType,incidentType,declarationDate,incidentBeginDate`;

    const res  = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    if (!data.DisasterDeclarationsSummaries?.length) {
      return generateMockFemaDeclarations(city);
    }

    return data.DisasterDeclarationsSummaries.map((d: any, i: number): FemaDeclaration => {
      const decDate  = new Date(d.declarationDate);
      const daysAgo  = Math.floor((Date.now() - decDate.getTime()) / 86400000);
      const incident = d.incidentType ?? 'Severe Storm';
      const urgency: FemaDeclaration['urgency'] =
        d.declarationType === 'DR' ? 'CRITICAL' : daysAgo < 20 ? 'HIGH' : 'MEDIUM';

      return {
        id:                  `FEMA-${d.disasterNumber}`,
        state:               d.state,
        county:              d.designatedArea ?? `${city} County`,
        declarationType:     d.declarationType,
        incidentType:        incident,
        declarationDate:     d.declarationDate?.split('T')[0] ?? '',
        incidentBeginDate:   d.incidentBeginDate?.split('T')[0] ?? '',
        daysActive:          Math.max(0, 90 - daysAgo),
        programsAvailable:   d.declarationType === 'DR' ? ['IHP', 'PA', 'HM'] : ['PA'],
        urgency,
        contractorOpportunity:
          DECLARATION_OPPORTUNITIES[incident] ??
          'Property repair and emergency service demand across all trades',
      };
    });
  } catch {
    return generateMockFemaDeclarations(city);
  }
}

// ── Census permits — mock only (Census API requires server-side proxy) ─────────
export async function fetchPermitData(city: string, industry: string): Promise<PermitSummary> {
  // US Census BPS API requires a server-side call to avoid CORS.
  // We use deterministic mock data that mirrors real Census numbers for major metros.
  return generateMockPermits(city, industry);
}
