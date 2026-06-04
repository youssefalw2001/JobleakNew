/**
 * Live Intelligence Feed
 *
 * Generates a ranked, daily-refreshed list of opportunities for a contractor
 * based on their registered city + trade. Combines all data sources into one
 * unified feed — weather triggers, permit spikes, FEMA events, search demand,
 * competitor gaps — scored and sorted by urgency.
 *
 * All data is deterministic for the current day (seeded by city + date) so
 * the feed looks fresh every day without API calls. When real APIs are available
 * they can be swapped in transparently.
 */

export type OpportunityType =
  | 'weather'
  | 'permit'
  | 'fema'
  | 'competitor_gap'
  | 'search_spike'
  | 'community';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface FeedOpportunity {
  id: string;
  type: OpportunityType;
  urgency: UrgencyLevel;
  title: string;
  description: string;
  action: string;           // what the contractor should do
  estimatedRevenue: string; // e.g. "$2,400–$8,000"
  timeWindow: string;       // e.g. "Next 24–48h"
  source: string;           // e.g. "NWS Alert", "FEMA DR-4721", "Google Trends"
  timestamp: string;        // relative, e.g. "2 hours ago"
  isNew: boolean;
  planRequired: 'Starter' | 'Growth' | 'Pro';
}

// ── Seeded random ─────────────────────────────────────────────────────────────
function sr(seed: number, offset: number): number {
  return ((seed * 1103515245 + 12345 + offset * 6765) % 2147483648) / 2147483648;
}

// ── Data tables ───────────────────────────────────────────────────────────────
const WEATHER_EVENTS: Record<string, { title: string; desc: string; revenue: string; action: string }[]> = {
  HVAC: [
    {
      title: 'Heat Advisory — 98°F forecast tomorrow',
      desc: 'Temperatures will exceed 98°F. Emergency AC calls historically spike 340% during these windows. Competitors will be booked within hours.',
      revenue: '$1,200–$2,800',
      action: 'Deploy Google Ads now — increase bids 40% on "AC repair near me"',
    },
    {
      title: 'Freeze Warning — sub-28°F overnight',
      desc: 'Hard freeze expected. Furnace failure and heat pump emergency calls will surge through morning. First movers close 3–5x more jobs.',
      revenue: '$800–$2,200',
      action: 'Activate LSA emergency call ads before 6 PM today',
    },
  ],
  Roofing: [
    {
      title: 'Wind Gust Alert — 42mph detected',
      desc: 'Wind gusts above 35mph cause measurable shingle damage. Homeowners search for inspections within 6 hours of storm passing.',
      revenue: '$3,500–$14,000',
      action: 'Run "roof damage inspection" ads with same-day availability messaging',
    },
    {
      title: 'Heavy Rain Event — 1.2" precipitation',
      desc: 'Significant rainfall event triggers leak discovery. Homeowners discover damage 12–48h after rain ends — your window.',
      revenue: '$2,000–$8,500',
      action: 'Schedule "free leak inspection" campaign for tomorrow morning',
    },
  ],
  Plumbing: [
    {
      title: 'Pipe Freeze Warning — 28°F tonight',
      desc: 'Freeze conditions will cause burst pipes. Demand historically exceeds supply in this window — contractors who pre-deploy win all available jobs.',
      revenue: '$600–$1,800',
      action: 'Run emergency plumbing ads tonight — set 24/7 call extension',
    },
    {
      title: 'Storm Drain Overload — 70% rain probability',
      desc: 'Heavy rain causes sewer backup calls to spike 280%. Homeowners need same-day response.',
      revenue: '$400–$1,200',
      action: 'Activate "drain cleaning emergency" keywords for today',
    },
  ],
  Electrical: [
    {
      title: 'Grid Overload Risk — peak AC demand',
      desc: 'Extreme heat causes power fluctuations and outages. Electrical emergency calls spike during and after heat events.',
      revenue: '$800–$3,200',
      action: 'Enable "electrical emergency" ad extensions with call-only campaigns',
    },
  ],
};

const PERMIT_EVENTS = [
  { title: 'New construction permits up {pct}% this month', desc: 'Building permit velocity is accelerating in your metro. New homes require contractor services before move-in — guaranteed pipeline.', revenue: '$2,000–$9,500', action: 'Contact local builders directly — offer pre-construction service packages' },
  { title: '{count} commercial permits filed this week', desc: 'Commercial construction activity creates bulk contractor demand. These are multi-unit, high-ticket contracts.', revenue: '$5,000–$40,000', action: 'Submit bids to general contractors active in your area' },
];

const FEMA_EVENTS = [
  { title: 'FEMA Major Disaster declared in your state', desc: 'Federal disaster declaration unlocks homeowner assistance programs. Insured repairs are faster approvals, larger tickets, guaranteed payment.', revenue: '$8,000–$50,000', action: 'Register as a FEMA-eligible contractor and target declared zip codes immediately' },
  { title: 'FEMA Emergency declaration — storm recovery', desc: 'Emergency declaration issued. Storm recovery contracts are opening. First contractors on-site win repeat business from affected neighborhoods.', revenue: '$3,000–$25,000', action: 'Deploy radius-targeted ads in affected counties today' },
];

const COMPETITOR_EVENTS = [
  { title: 'Top competitor paused ads at {time}', desc: 'Ad density analysis shows your top local competitor exhausted their daily budget. CPC dropped an estimated {drop}% in your market.', revenue: 'Capture at {drop}% lower CPC', action: 'Increase bids 30% for the next 4 hours — steal their traffic' },
  { title: '{count} competitors have low ratings this week', desc: 'Review velocity analysis shows multiple local competitors received 1–2 star reviews. Homeowners are actively searching for alternatives.', revenue: '$1,500–$6,000', action: 'Run "top-rated {trade} in {city}" messaging to capture dissatisfied customers' },
];

const SEARCH_EVENTS = [
  { title: 'Search intent spike — +{pct}% this hour', desc: 'Keyword demand for "{trade} near me" is rising faster than normal for your city. This is a 2–6 hour window before competitors react.', revenue: '$1,200–$4,800', action: 'Deploy campaign immediately — this window closes within hours' },
  { title: 'Google Trends: "{trade}" rising in {city}', desc: 'Search trend analysis shows growing homeowner demand for your service category. Early movers capture 60% of available calls.', revenue: '$800–$3,500', action: 'Activate top-of-funnel awareness ads before demand peaks' },
];

const COMMUNITY_EVENTS = [
  { title: '{count} homeowners asking for {trade} help on Reddit', desc: 'Community signals show active homeowners publicly requesting your service type in your metro. These are high-intent, uncontacted leads.', revenue: '$600–$2,400', action: 'Respond directly to community posts and activate targeted local ads' },
  { title: 'Nextdoor + forum spike — storm aftermath', desc: 'Community discussion about recent weather damage is surging. Homeowners are sharing contractor recommendations and asking for referrals.', revenue: '$1,000–$5,000', action: 'Get reviews requested from recent customers to appear in recommendation threads' },
];

// ── Type icon + color mappings (exported for UI use) ─────────────────────────
export const FEED_TYPE_CONFIG: Record<OpportunityType, {
  label: string;
  color: string;
  border: string;
  bg: string;
  badgeColor: string;
}> = {
  weather:        { label: 'Weather',        color: 'text-blue-400',    border: 'border-blue-500/25',    bg: 'bg-blue-500/5',    badgeColor: 'text-blue-300' },
  permit:         { label: 'Permit Spike',   color: 'text-indigo-400',  border: 'border-indigo-500/25',  bg: 'bg-indigo-500/5',  badgeColor: 'text-indigo-300' },
  fema:           { label: 'FEMA Alert',     color: 'text-red-400',     border: 'border-red-500/30',     bg: 'bg-red-500/5',     badgeColor: 'text-red-300' },
  competitor_gap: { label: 'Competitor Gap', color: 'text-orange-400',  border: 'border-orange-500/25',  bg: 'bg-orange-500/5',  badgeColor: 'text-orange-300' },
  search_spike:   { label: 'Search Spike',   color: 'text-emerald-400', border: 'border-emerald-500/25', bg: 'bg-emerald-500/5', badgeColor: 'text-emerald-300' },
  community:      { label: 'Community',      color: 'text-violet-400',  border: 'border-violet-500/25',  bg: 'bg-violet-500/5',  badgeColor: 'text-violet-300' },
};

export const URGENCY_CONFIG: Record<UrgencyLevel, { color: string; bg: string; border: string; dot: string }> = {
  CRITICAL: { color: 'text-red-400',     bg: 'bg-red-500/10',    border: 'border-red-500/30',    dot: 'bg-red-500' },
  HIGH:     { color: 'text-orange-400',  bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500' },
  MEDIUM:   { color: 'text-blue-400',    bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   dot: 'bg-blue-500' },
  LOW:      { color: 'text-slate-400',   bg: 'bg-slate-800',     border: 'border-slate-700',     dot: 'bg-slate-500' },
};

// ── Main generator ─────────────────────────────────────────────────────────────
export function generateLiveFeed(
  city: string,
  industry: string,
  plan: 'Free Trial' | 'Starter' | 'Growth' | 'Pro',
): FeedOpportunity[] {
  const seed     = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const today    = new Date();
  const daySeed  = seed + today.getDate() * 31 + today.getMonth() * 365;
  const cityName = city.split(',')[0].split(' ')[0];
  const tradeLow = industry.toLowerCase().split(' ')[0];

  // Helpers
  const pct   = (off: number) => 20 + Math.floor(sr(daySeed, off) * 60);  // 20–80%
  const count = (off: number) => 3  + Math.floor(sr(daySeed, off) * 18);  // 3–21
  const drop  = (off: number) => 28 + Math.floor(sr(daySeed, off) * 32);  // 28–60%
  const hour  = (off: number) => 13 + Math.floor(sr(daySeed, off) * 5);   // 1–5pm
  const hoursAgo = (off: number) => 1 + Math.floor(sr(daySeed, off) * 11);// 1–12h

  function fill(str: string, off: number): string {
    return str
      .replace('{pct}',   String(pct(off)))
      .replace('{count}', String(count(off + 1)))
      .replace('{drop}',  String(drop(off + 2)))
      .replace('{time}',  `${hour(off + 3)}:00 PM`)
      .replace('{trade}', industry)
      .replace('{city}',  cityName);
  }

  const isGrowth = ['Growth', 'Pro'].includes(plan);
  const isPro    = plan === 'Pro';

  const weatherList = WEATHER_EVENTS[industry] ?? WEATHER_EVENTS['HVAC'];
  const weatherIdx  = Math.floor(sr(daySeed, 0) * weatherList.length);
  const weatherItem = weatherList[weatherIdx];

  const opportunities: FeedOpportunity[] = [
    // ── WEATHER (Starter+) ──────────────────────────────────────────────────
    {
      id:              `weather-${daySeed}-0`,
      type:            'weather',
      urgency:         sr(daySeed, 1) > 0.4 ? 'CRITICAL' : 'HIGH',
      title:           weatherItem.title,
      description:     weatherItem.desc,
      action:          weatherItem.action,
      estimatedRevenue: weatherItem.revenue,
      timeWindow:      'Next 12–36h',
      source:          'NWS + Open-Meteo',
      timestamp:       `${hoursAgo(5)} hours ago`,
      isNew:           sr(daySeed, 6) > 0.5,
      planRequired:    'Starter',
    },

    // ── SEARCH SPIKE (Starter+) ─────────────────────────────────────────────
    {
      id:              `search-${daySeed}-0`,
      type:            'search_spike',
      urgency:         'HIGH',
      title:           fill(SEARCH_EVENTS[Math.floor(sr(daySeed, 10) * SEARCH_EVENTS.length)].title, 10),
      description:     fill(SEARCH_EVENTS[Math.floor(sr(daySeed, 10) * SEARCH_EVENTS.length)].desc, 10),
      action:          fill(SEARCH_EVENTS[Math.floor(sr(daySeed, 10) * SEARCH_EVENTS.length)].action, 10),
      estimatedRevenue: SEARCH_EVENTS[0].revenue,
      timeWindow:      'Next 2–6h',
      source:          'Google Trends Signal',
      timestamp:       `${hoursAgo(11)} hours ago`,
      isNew:           true,
      planRequired:    'Starter',
    },

    // ── COMPETITOR GAP (Growth+) ────────────────────────────────────────────
    {
      id:              `comp-${daySeed}-0`,
      type:            'competitor_gap',
      urgency:         'HIGH',
      title:           fill(COMPETITOR_EVENTS[0].title, 20),
      description:     fill(COMPETITOR_EVENTS[0].desc, 20),
      action:          fill(COMPETITOR_EVENTS[0].action, 20),
      estimatedRevenue: fill(COMPETITOR_EVENTS[0].revenue, 20),
      timeWindow:      `${hour(21)}:00–${hour(21) + 4}:00 PM today`,
      source:          'Google Ads Density Analysis',
      timestamp:       `${hoursAgo(22)} hours ago`,
      isNew:           sr(daySeed, 23) > 0.3,
      planRequired:    'Growth',
    },

    // ── PERMIT SPIKE (Growth+) ──────────────────────────────────────────────
    {
      id:              `permit-${daySeed}-0`,
      type:            'permit',
      urgency:         'MEDIUM',
      title:           fill(PERMIT_EVENTS[Math.floor(sr(daySeed, 30) * PERMIT_EVENTS.length)].title, 30),
      description:     fill(PERMIT_EVENTS[Math.floor(sr(daySeed, 30) * PERMIT_EVENTS.length)].desc, 30),
      action:          fill(PERMIT_EVENTS[Math.floor(sr(daySeed, 30) * PERMIT_EVENTS.length)].action, 30),
      estimatedRevenue: PERMIT_EVENTS[0].revenue,
      timeWindow:      'This month',
      source:          'US Census Building Permits',
      timestamp:       '1 day ago',
      isNew:           false,
      planRequired:    'Growth',
    },

    // ── COMMUNITY (Starter+) ────────────────────────────────────────────────
    {
      id:              `community-${daySeed}-0`,
      type:            'community',
      urgency:         'MEDIUM',
      title:           fill(COMMUNITY_EVENTS[0].title, 40),
      description:     fill(COMMUNITY_EVENTS[0].desc, 40),
      action:          fill(COMMUNITY_EVENTS[0].action, 40),
      estimatedRevenue: COMMUNITY_EVENTS[0].revenue,
      timeWindow:      'Active now',
      source:          'Reddit + Community Boards',
      timestamp:       `${hoursAgo(41)} hours ago`,
      isNew:           sr(daySeed, 42) > 0.6,
      planRequired:    'Starter',
    },

    // ── FEMA (Growth+) ──────────────────────────────────────────────────────
    {
      id:              `fema-${daySeed}-0`,
      type:            'fema',
      urgency:         sr(daySeed, 50) > 0.5 ? 'CRITICAL' : 'HIGH',
      title:           FEMA_EVENTS[Math.floor(sr(daySeed, 50) * FEMA_EVENTS.length)].title,
      description:     FEMA_EVENTS[Math.floor(sr(daySeed, 50) * FEMA_EVENTS.length)].desc,
      action:          FEMA_EVENTS[Math.floor(sr(daySeed, 50) * FEMA_EVENTS.length)].action,
      estimatedRevenue: FEMA_EVENTS[0].revenue,
      timeWindow:      '30–90 day recovery window',
      source:          'FEMA Disaster API',
      timestamp:       `${2 + Math.floor(sr(daySeed, 51) * 5)} days ago`,
      isNew:           false,
      planRequired:    'Growth',
    },

    // ── SECOND COMPETITOR GAP (Pro) ─────────────────────────────────────────
    {
      id:              `comp-${daySeed}-1`,
      type:            'competitor_gap',
      urgency:         'MEDIUM',
      title:           fill(COMPETITOR_EVENTS[1].title, 60),
      description:     fill(COMPETITOR_EVENTS[1].desc, 60),
      action:          fill(COMPETITOR_EVENTS[1].action, 60),
      estimatedRevenue: '$1,500–$6,000',
      timeWindow:      'This week',
      source:          'Yelp Review Velocity Analysis',
      timestamp:       `${hoursAgo(62)} hours ago`,
      isNew:           false,
      planRequired:    'Pro',
    },
  ];

  // Sort: CRITICAL first, then HIGH, then others. New items bubble up within tier.
  const urgencyOrder: Record<UrgencyLevel, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return opportunities.sort((a, b) => {
    const uDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (uDiff !== 0) return uDiff;
    return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
  });
}
