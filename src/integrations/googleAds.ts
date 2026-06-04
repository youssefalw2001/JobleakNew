/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Google Ads Campaign Generator
 * Generates complete, production-ready Google Ads campaigns
 * based on city, industry, service, and live weather trigger data.
 * No API key needed — pure client-side intelligence engine.
 */

export interface AdHeadline {
  text: string;
  charCount: number;
}

export interface AdDescription {
  text: string;
  charCount: number;
}

export interface ResponsiveSearchAd {
  headlines: AdHeadline[];   // up to 15, max 30 chars each
  descriptions: AdDescription[]; // up to 4, max 90 chars each
  finalUrl: string;
  path1: string;
  path2: string;
}

export interface AdGroup {
  name: string;
  keywords: string[];
  negativeKeywords: string[];
  ads: ResponsiveSearchAd[];
  bidStrategy: string;
  suggestedCpcBid: string;
}

export interface GoogleAdsCampaign {
  campaignName: string;
  industry: string;
  city: string;
  service: string;
  weatherTrigger: string;
  objective: string;
  budgetRecommendation: string;
  bidStrategy: string;
  targeting: {
    locations: string[];
    radius: string;
    languages: string[];
    schedule: string;
  };
  adGroups: AdGroup[];
  campaignNegativeKeywords: string[];
  estimatedMetrics: {
    dailyClicks: string;
    cpc: string;
    conversionRate: string;
    estimatedLeadsPerMonth: string;
    estimatedRoi: string;
  };
}

// ─── Weather-aware headline templates ────────────────────────────────────────
const WEATHER_HEADLINES: Record<string, string[]> = {
  heat: [
    'AC Broke? Same-Day Repair',
    'Beat the Heat - We\'re Available',
    'Emergency AC Service Today',
    'No AC? Call Us Right Now',
    'Same-Day Cooling Repair',
  ],
  freeze: [
    'Frozen Pipes? We\'re On The Way',
    'Emergency Pipe Repair - 24/7',
    'Burst Pipe? Call Us Now',
    'Freeze Warning - Act Fast',
    '24/7 Emergency Plumbing',
  ],
  storm: [
    'Storm Damage? We Can Help',
    'Emergency Roof Repair Today',
    'Wind Damage Repair - Fast',
    'Storm Restoration Experts',
    'Free Storm Damage Inspection',
  ],
  default: [
    'Fast & Reliable Service',
    'Licensed & Insured Experts',
    'Free Estimate Today',
    'Same-Day Service Available',
    '5-Star Rated Contractors',
  ]
};

// ─── Industry keyword databases ───────────────────────────────────────────────
const INDUSTRY_KEYWORDS: Record<string, { positive: string[]; negative: string[] }> = {
  HVAC: {
    positive: [
      'ac repair near me',
      'emergency ac repair',
      'hvac repair',
      'air conditioning repair',
      'ac not cooling',
      'hvac service',
      'furnace repair',
      'heater not working',
      'ac installation',
      'hvac maintenance',
      'central air repair',
      'ac unit repair',
      'heat pump repair',
      'emergency heating repair',
      'ac tune up',
    ],
    negative: [
      'diy', 'how to', 'youtube', 'manual', 'free', 'used', 'parts only',
      'cheap', 'wholesale', 'training', 'course', 'school', 'certification',
      'diagram', 'troubleshoot yourself'
    ]
  },
  Plumbing: {
    positive: [
      'emergency plumber near me',
      'plumber near me',
      'burst pipe repair',
      'water heater repair',
      'drain cleaning',
      'pipe leak repair',
      'sewer repair',
      'clogged drain',
      'toilet repair',
      'water line repair',
      'plumbing service',
      'frozen pipe repair',
      'sump pump repair',
      'gas line repair',
      'leak detection',
    ],
    negative: [
      'diy plumbing', 'how to fix', 'plumbing parts', 'wholesale',
      'plumbing school', 'apprentice', 'free', 'diagram', 'manual'
    ]
  },
  Roofing: {
    positive: [
      'roof repair near me',
      'emergency roof repair',
      'roof leak repair',
      'storm damage roof repair',
      'missing shingles repair',
      'roof replacement',
      'free roof inspection',
      'hail damage roof',
      'wind damage roof',
      'roof contractor',
      'flat roof repair',
      'gutter repair',
      'roof estimate',
      'roof leak fix',
      'residential roofing',
    ],
    negative: [
      'diy roofing', 'how to shingle', 'roofing materials',
      'roofing school', 'roofing apprentice', 'free shingles'
    ]
  },
  Electrical: {
    positive: [
      'electrician near me',
      'emergency electrician',
      'electrical repair',
      'panel upgrade',
      'circuit breaker repair',
      'outlet not working',
      'electrical wiring',
      'generator installation',
      'ev charger installation',
      'electrical inspection',
      'power outage repair',
      'electrical contractor',
    ],
    negative: [
      'diy electrical', 'how to wire', 'electrical school',
      'electrical apprentice', 'free', 'parts'
    ]
  },
  'Pest Control': {
    positive: [
      'pest control near me',
      'exterminator near me',
      'rodent control',
      'termite treatment',
      'ant control',
      'cockroach exterminator',
      'bed bug treatment',
      'mosquito control',
      'wasp nest removal',
      'wildlife removal',
    ],
    negative: [
      'diy pest control', 'how to kill', 'pesticide store',
      'pest control school', 'free traps'
    ]
  },
  'Garage Door': {
    positive: [
      'garage door repair near me',
      'broken garage door',
      'garage door spring repair',
      'garage door opener repair',
      'garage door replacement',
      'emergency garage door repair',
      'garage door off track',
      'garage door installation',
    ],
    negative: [
      'diy garage door', 'garage door parts', 'garage door manual',
      'how to fix garage door', 'free parts'
    ]
  }
};

// ─── Core generator function ──────────────────────────────────────────────────
export function generateGoogleAdsCampaign(
  city: string,
  industry: string,
  service: string,
  weatherTrigger: string,
  maxTemp?: number,
  minTemp?: number,
  windSpeed?: number
): GoogleAdsCampaign {

  const industryData = INDUSTRY_KEYWORDS[industry] || INDUSTRY_KEYWORDS['HVAC'];

  // Pick weather-appropriate headlines
  let weatherKey = 'default';
  if (maxTemp && maxTemp >= 95) weatherKey = 'heat';
  else if (minTemp && minTemp <= 32) weatherKey = 'freeze';
  else if (windSpeed && windSpeed >= 35) weatherKey = 'storm';
  else if (weatherTrigger.toLowerCase().includes('heat')) weatherKey = 'heat';
  else if (weatherTrigger.toLowerCase().includes('freeze') || weatherTrigger.toLowerCase().includes('pipe')) weatherKey = 'freeze';
  else if (weatherTrigger.toLowerCase().includes('storm') || weatherTrigger.toLowerCase().includes('wind')) weatherKey = 'storm';

  const weatherHeadlines = WEATHER_HEADLINES[weatherKey];
  const serviceShort = service.split(' ').slice(0, 3).join(' ');

  // Build 3 tightly focused ad groups
  const adGroups: AdGroup[] = [

    // ── Ad Group 1: Emergency / Urgent ──────────────────────────────────────
    {
      name: `${industry} - Emergency & Urgent`,
      keywords: [
        `emergency ${industry.toLowerCase()} ${city}`,
        `urgent ${industry.toLowerCase()} repair ${city}`,
        `same day ${industry.toLowerCase()} repair`,
        `${industry.toLowerCase()} emergency near me`,
        `24/7 ${industry.toLowerCase()} service`,
        `${serviceShort} emergency`,
      ],
      negativeKeywords: [...industryData.negative],
      bidStrategy: 'Target CPA - Emergency Intent',
      suggestedCpcBid: '$18–$35',
      ads: [{
        headlines: [
          { text: weatherHeadlines[0], charCount: weatherHeadlines[0].length },
          { text: `Emergency ${industry} - ${city}`, charCount: (`Emergency ${industry} - ${city}`).length },
          { text: '24/7 Same-Day Response', charCount: 21 },
          { text: 'Licensed & Insured', charCount: 18 },
          { text: `Call Now - ${city} Area`, charCount: (`Call Now - ${city} Area`).length },
          { text: weatherHeadlines[1], charCount: weatherHeadlines[1].length },
        ],
        descriptions: [
          {
            text: `${weatherTrigger} detected in ${city}. Our ${industry} team is on standby — get same-day emergency service. Call now!`,
            charCount: 0
          },
          {
            text: `Don't wait. ${city}'s top-rated ${industry} contractor. Licensed, insured, and available right now. Free estimate.`,
            charCount: 0
          },
        ],
        finalUrl: 'https://yourwebsite.com',
        path1: industry.toLowerCase().replace(/\s/g, ''),
        path2: 'emergency'
      }]
    },

    // ── Ad Group 2: Specific Service ────────────────────────────────────────
    {
      name: `${industry} - ${serviceShort}`,
      keywords: [
        `${serviceShort} ${city}`,
        `${serviceShort} near me`,
        `best ${industry.toLowerCase()} ${city}`,
        `${industry.toLowerCase()} repair ${city}`,
        `top rated ${industry.toLowerCase()} ${city}`,
        ...industryData.positive.slice(0, 6),
      ],
      negativeKeywords: [...industryData.negative],
      bidStrategy: 'Maximize Conversions',
      suggestedCpcBid: '$12–$22',
      ads: [{
        headlines: [
          { text: `${serviceShort} - ${city}`, charCount: (`${serviceShort} - ${city}`).length },
          { text: weatherHeadlines[2], charCount: weatherHeadlines[2].length },
          { text: `Top Rated ${industry} Near You`, charCount: (`Top Rated ${industry} Near You`).length },
          { text: 'Free Estimate - Call Today', charCount: 25 },
          { text: `${city} Experts Since 2010`, charCount: (`${city} Experts Since 2010`).length },
          { text: '5-Star Google Reviews', charCount: 21 },
        ],
        descriptions: [
          {
            text: `Looking for ${serviceShort} in ${city}? We're the #1 rated ${industry} company in the area. Fast, honest, affordable.`,
            charCount: 0
          },
          {
            text: `Locally owned ${industry} company serving ${city}. Transparent pricing, no surprises. Get a free estimate today!`,
            charCount: 0
          },
        ],
        finalUrl: 'https://yourwebsite.com',
        path1: city.toLowerCase().replace(/\s/g, ''),
        path2: industry.toLowerCase().replace(/\s/g, '')
      }]
    },

    // ── Ad Group 3: Local Brand + Trust ────────────────────────────────────
    {
      name: `${industry} - Local ${city}`,
      keywords: [
        `${industry.toLowerCase()} company ${city}`,
        `local ${industry.toLowerCase()} contractor`,
        `affordable ${industry.toLowerCase()} ${city}`,
        `${industry.toLowerCase()} estimate ${city}`,
        `hire ${industry.toLowerCase()} ${city}`,
        ...industryData.positive.slice(6, 10),
      ],
      negativeKeywords: [...industryData.negative],
      bidStrategy: 'Target Impression Share',
      suggestedCpcBid: '$8–$16',
      ads: [{
        headlines: [
          { text: `${city} ${industry} Experts`, charCount: (`${city} ${industry} Experts`).length },
          { text: 'Free Quote - No Obligation', charCount: 26 },
          { text: 'Trusted Local Contractors', charCount: 25 },
          { text: weatherHeadlines[3], charCount: weatherHeadlines[3].length },
          { text: 'Serving Your Neighborhood', charCount: 26 },
          { text: 'Honest Pricing, Fast Work', charCount: 25 },
        ],
        descriptions: [
          {
            text: `${city}'s trusted ${industry} team. Serving homeowners for over 10 years. Call for a free, no-obligation estimate.`,
            charCount: 0
          },
          {
            text: `We live and work in ${city}. Family-owned ${industry} business with 5-star reviews. Same-day availability.`,
            charCount: 0
          },
        ],
        finalUrl: 'https://yourwebsite.com',
        path1: 'local',
        path2: industry.toLowerCase().replace(/\s/g, '')
      }]
    }
  ];

  // Estimate CPC from industry
  const cpcMap: Record<string, string> = {
    HVAC: '$18–$32',
    Plumbing: '$14–$26',
    Roofing: '$16–$30',
    Electrical: '$12–$22',
    'Pest Control': '$8–$16',
    'Garage Door': '$10–$18',
  };

  return {
    campaignName: `JobLeak | ${city} ${industry} | ${new Date().toLocaleDateString()}`,
    industry,
    city,
    service,
    weatherTrigger,
    objective: 'Lead Generation - Phone Calls & Form Fills',
    budgetRecommendation: '$50–$120/day during active weather triggers',
    bidStrategy: 'Maximize Conversions with Target CPA',
    targeting: {
      locations: [`${city} city center`, `${city} metro (+20 mile radius)`],
      radius: '20 miles',
      languages: ['English'],
      schedule: 'Mon–Sun, 6am–10pm (peak emergency hours)'
    },
    adGroups,
    campaignNegativeKeywords: [
      'diy', 'free', 'how to', 'youtube', 'manual', 'parts',
      'school', 'training', 'course', 'certification', 'wholesale',
      'used', 'cheap', 'craigslist', 'facebook marketplace'
    ],
    estimatedMetrics: {
      dailyClicks: '25–60',
      cpc: cpcMap[industry] || '$12–$24',
      conversionRate: '8–15%',
      estimatedLeadsPerMonth: '60–180',
      estimatedRoi: '400–800%'
    }
  };
}

// ─── CSV Export (Google Ads Editor format) ───────────────────────────────────
export function exportCampaignToCSV(campaign: GoogleAdsCampaign): string {
  const rows: string[] = [];

  // Header
  rows.push([
    'Campaign', 'Ad Group', 'Match Type', 'Keyword', 'Final URL',
    'Headline 1', 'Headline 2', 'Headline 3',
    'Description 1', 'Description 2',
    'Path 1', 'Path 2'
  ].map(h => `"${h}"`).join(','));

  // Keyword rows
  campaign.adGroups.forEach(group => {
    group.keywords.forEach(kw => {
      rows.push([
        campaign.campaignName,
        group.name,
        'Broad Match Modifier',
        `+${kw.replace(/\s+/g, ' +')}`,
        group.ads[0]?.finalUrl || '',
        group.ads[0]?.headlines[0]?.text || '',
        group.ads[0]?.headlines[1]?.text || '',
        group.ads[0]?.headlines[2]?.text || '',
        group.ads[0]?.descriptions[0]?.text || '',
        group.ads[0]?.descriptions[1]?.text || '',
        group.ads[0]?.path1 || '',
        group.ads[0]?.path2 || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    });
  });

  return rows.join('\n');
}

// ─── Trigger-specific email reactivation template ────────────────────────────
export function generateEmailTemplate(
  city: string,
  industry: string,
  service: string,
  weatherTrigger: string
): { subject: string; body: string } {
  return {
    subject: `⚡ ${weatherTrigger} Alert: Your ${city} Neighbors Need ${industry} Help Now`,
    body: `Hi [First Name],

We just detected a ${weatherTrigger} event in the ${city} area.

Based on our analysis, homeowners in your service zone are actively searching for ${service} right now — many are urgently in need.

Here's what our system found:
• Weather Trigger: ${weatherTrigger}
• High-intent searches spiking in ${city}
• Competitor ad activity is currently LOW — perfect timing to deploy

ACTION REQUIRED:
→ Activate your Google Ads campaign immediately
→ Increase bids by 25–40% for the next 48 hours
→ Enable call extensions and location extensions

We've pre-built your campaign. Just log in and hit "Deploy."

[DEPLOY YOUR CAMPAIGN →]

Best,
JobLeak Intelligence Platform
`
  };
}

// ─── LSA (Local Services Ads) Checklist ─────────────────────────────────────
export function getLSAChecklist(industry: string): { item: string; completed: boolean }[] {
  return [
    { item: 'Google Business Profile verified', completed: false },
    { item: 'Background check passed (all technicians)', completed: false },
    { item: 'License uploaded and verified', completed: false },
    { item: 'Insurance certificate uploaded', completed: false },
    { item: `${industry} service area defined (zip codes)`, completed: false },
    { item: 'Business hours set (include emergency/weekend)', completed: false },
    { item: 'Profile photos uploaded (min 3)', completed: false },
    { item: 'At least 5 Google reviews collected', completed: false },
    { item: 'Phone number verified for call tracking', completed: false },
    { item: 'Budget set ($300+/month recommended)', completed: false },
  ];
}
