/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompetitorPlace {
  name: string;
  address: string;
  rating?: number;
  reviewsCount?: number;
  status?: string;
}

export interface SamOpportunity {
  solicitationNumber: string;
  title: string;
  agency: string;
  office: string;
  postedDate: string;
  type: string;
  link: string;
}

export interface MunicipalPermit {
  permitNumber: string;
  issuedDate: string;
  permitType: string;
  description: string;
  estimatedValue?: number;
  status: string;
}

export interface IntegrationFeedResponse<T> {
  data: T[];
  isMock: boolean;
  error?: string;
}

/**
 * Fetch local competitors using Google Places API TextSearch
 */
export async function getLocalCompetitors(city: string, industry: string): Promise<IntegrationFeedResponse<CompetitorPlace>> {
  const env = (import.meta as any).env || {};
  const apiKey = env.VITE_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    // High-fidelity mock competitor list specific to selected market city
    const mockCompetitors: Record<string, CompetitorPlace[]> = {
      austin: [
        { name: 'Austin Air Conditioning & Heating Pros', address: '1205 E Cesar Chavez St, Austin, TX 78702', rating: 4.8, reviewsCount: 342, status: 'OPERATIONAL' },
        { name: 'Precision Austin Plumbing & Drain Co.', address: '2201 S Lamar Blvd, Austin, TX 78704', rating: 4.9, reviewsCount: 221, status: 'OPERATIONAL' },
        { name: 'Lone Star Storm & Roof Reconstruction', address: '8501 N IH 35 Service Rd, Austin, TX 78753', rating: 4.7, reviewsCount: 189, status: 'OPERATIONAL' }
      ],
      dallas: [
        { name: 'Dallas Commercial HVAC & Furnace Inc.', address: '4401 Belmont Ave, Dallas, TX 75204', rating: 4.7, reviewsCount: 412, status: 'OPERATIONAL' },
        { name: 'Metroplex Drainage & Pipe Solutions', address: '1105 Woodall Rodgers Fwy, Dallas, TX 75202', rating: 4.9, reviewsCount: 295, status: 'OPERATIONAL' },
        { name: 'Supreme North Texas Roofing Systems', address: '9603 Garland Rd, Dallas, TX 75218', rating: 4.6, reviewsCount: 164, status: 'OPERATIONAL' }
      ]
    };

    const normCity = city.toLowerCase().trim();
    let selectedMock = mockCompetitors.austin; // default
    if (normCity.includes('dallas')) selectedMock = mockCompetitors.dallas;
    else {
      // Generate dynamic mock to perfectly match custom city typed by user!
      selectedMock = [
        { name: `${city} Professional ${industry}`, address: `150 Main Street, ${city}`, rating: 4.8, reviewsCount: 124, status: 'OPERATIONAL' },
        { name: `Apex ${industry} Systems`, address: `700 Industrial Parkway, ${city}`, rating: 4.7, reviewsCount: 89, status: 'OPERATIONAL' },
        { name: `Elite Trades Team of ${city}`, address: `1021 Broad St, ${city}`, rating: 4.9, reviewsCount: 56, status: 'OPERATIONAL' }
      ];
    }

    return {
      data: selectedMock,
      isMock: true
    };
  }

  try {
    // Note: Due to CORS restrictions on direct client-side Google API requests,
    // we use standard fetch or fallback proxy, conforming to standard Places structure.
    const query = `${industry} in ${city}`;
    const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Places request failed with status ${res.status}`);
    }
    const payload = await res.json();
    
    if (payload.status === 'REQUEST_DENIED') {
      return {
        data: [],
        isMock: true,
        error: `Places API: ${payload.error_message || 'Rejected API Key request'}`
      };
    }

    const results = (payload.results || []).slice(0, 5).map((place: any) => ({
      name: place.name || 'Unnamed Contractor',
      address: place.formatted_address || 'Address Unavailable',
      rating: place.rating,
      reviewsCount: place.user_ratings_total,
      status: place.business_status || 'OPERATIONAL'
    }));

    return {
      data: results,
      isMock: false
    };
  } catch (err) {
    console.error('Places API request error:', err);
    return {
      data: [],
      isMock: true,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Fetch active federal Opportunities from SAM.gov base endpoint
 */
export async function getSamOpportunities(industry: string): Promise<IntegrationFeedResponse<SamOpportunity>> {
  const env = (import.meta as any).env || {};
  const apiKey = env.VITE_SAM_API_KEY;

  // Clean industry query
  const cleanKeyword = industry.toLowerCase().includes('hvac') ? 'HVAC' : 
                       industry.toLowerCase().includes('plumb') ? 'Plumbing' :
                       industry.toLowerCase().includes('roof') ? 'Roofing' : industry;

  if (!apiKey) {
    // Return high-fidelity SAM.gov contract matches depending on the trade
    const defaultMocks: Record<string, SamOpportunity[]> = {
      HVAC: [
        { solicitationNumber: 'W9127826B0014', title: 'Replace Chillers and Air Handling Units (Bldg 450)', agency: 'DEPARTMENT OF THE ARMY', office: 'USACE MOBILE DISTRICT', postedDate: '15 Jan 2026', type: 'Solicitation', link: 'https://sam.gov/opp/W9127826B0014' },
        { solicitationNumber: '140G0326R0012', title: 'Emergency Furnace Boiler Replacement Grid NW', agency: 'DEPARTMENT OF THE INTERIOR', office: 'US GEOLOGICAL SURVEY', postedDate: '02 Feb 2026', type: 'Combined Synopsis/Solicitation', link: 'https://sam.gov/opp/140G0326R0012' }
      ],
      Plumbing: [
        { solicitationNumber: 'FA441826R0023', title: 'Main Water Line Point-Of-Origin Valve Retrofitting', agency: 'DEPARTMENT OF THE AIR FORCE', office: 'AMC LOCKBOURNE BASE', postedDate: '28 Jan 2026', type: 'Presolicitation', link: 'https://sam.gov/opp/FA441826R0023' },
        { solicitationNumber: 'V797P-4322B', title: 'Sewer Line Trenchless Boring Rehab Facility West', agency: 'DEPARTMENT OF VETERANS AFFAIRS', office: 'NCA CONTRACTING SERVICES', postedDate: '10 Feb 2026', type: 'Solicitation', link: 'https://sam.gov/opp/V797P-4322B' }
      ],
      Roofing: [
        { solicitationNumber: 'N4008526R2541', title: 'Hurricane Damage Metal Roof Reconstruction Grid 8', agency: 'DEPARTMENT OF THE NAVY', office: 'NAVFAC MID-ATLANTIC', postedDate: '21 Jan 2026', type: 'Combined Synopsis/Solicitation', link: 'https://sam.gov/opp/N4008526R2541' },
        { solicitationNumber: 'GS07Q26BGF008', title: 'Federal Courthouse Skylight Structural Retrofitting', agency: 'GENERAL SERVICES ADMINISTRATION', office: 'PUBLIC BUILDINGS SERVICE', postedDate: '05 Feb 2026', type: 'Solicitation', link: 'https://sam.gov/opp/GS07Q26BGF008' }
      ]
    };

    const selectedMocks = defaultMocks[cleanKeyword] || [
      { solicitationNumber: 'FED-CONT-9021', title: `Emergency Facility Maintenance and ${cleanKeyword} Repairs`, agency: 'DEPARTMENT OF DEFENSE', office: 'LOGISTICS AGENCY OFFICE', postedDate: '01 Mar 2026', type: 'Presolicitation', link: 'https://sam.gov/opp/FED-CONT-9021' },
      { solicitationNumber: 'GS-TRD-1892B', title: `Regional Supply and Support for Trade Sector ${cleanKeyword}`, agency: 'GENERAL SERVICES ADMINISTRATION', office: 'REGIONAL INFRASTRUCTURE ACQUISITION', postedDate: '18 Feb 2026', type: 'Sources Sought', link: 'https://sam.gov/opp/GS-TRD-1892B' }
    ];

    return {
      data: selectedMocks,
      isMock: true
    };
  }

  try {
    // Official SAM.gov Opportunities search endpoint
    // We fetch active opportunities matching industry trade segment
    const url = `https://api.sam.gov/prod/opportunities/v2/search?api_key=${apiKey}&limit=5&keyword=${encodeURIComponent(cleanKeyword)}&active=true`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`SAM.gov API responded with error status ${res.status}`);
    }
    const payload = await res.json();
    
    // SAM.gov nesting is: payload.opportunitiesData
    const records = payload.opportunitiesData || [];
    const formatted: SamOpportunity[] = records.slice(0, 5).map((item: any) => ({
      solicitationNumber: item.solicitationNumber || item.solic_num || 'N/A',
      title: item.title || 'Federal Facility Trade Repair Service',
      agency: item.agencyName || item.deptName || 'DEPARTMENT OF DEFENSE',
      office: item.officeName || 'REGIONAL ACQUISITION CELL',
      postedDate: item.postedDate ? new Date(item.postedDate).toLocaleDateString() : 'N/A',
      type: item.type || 'Solicitation',
      link: item.uiLink || `https://sam.gov/opp/${item.solicitationNumber || ''}`
    }));

    return {
      data: formatted,
      isMock: false
    };
  } catch (err) {
    console.error('SAM.gov API request error:', err);
    return {
      data: [],
      isMock: true,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Fetch local municipal permit logs using custom configured Permit API Url
 */
export async function getRecentPermits(city: string, industry: string): Promise<IntegrationFeedResponse<MunicipalPermit>> {
  const env = (import.meta as any).env || {};
  const permitApiUrl = env.VITE_PERMIT_API_URL;

  // Render trade-specific structural permits elegantly 
  const cleanTrade = industry.toLowerCase().includes('hvac') ? 'HVAC' : 
                     industry.toLowerCase().includes('plumb') ? 'Plumbing' :
                     industry.toLowerCase().includes('roof') ? 'Roofing' : 'Structural';

  if (!permitApiUrl) {
    // Default high quality dynamic permit list based on current datetime limits
    const demoPermits: Record<string, MunicipalPermit[]> = {
      austin: [
        { permitNumber: 'PM-2026-11822', issuedDate: '28 May 2026', permitType: 'Mechanical (HVAC Upgrade)', description: 'Replace split system condenser and indoor furnace coil, 16 SEER.', estimatedValue: 12500, status: 'ISSUED' },
        { permitNumber: 'PP-2026-09254', issuedDate: '15 May 2026', permitType: 'Plumbing (Commercial Storm Drainage)', description: 'Replace main sewer lateral under foundation with trenchless sleeve.', estimatedValue: 18400, status: 'FINALED' },
        { permitNumber: 'PR-2026-14022', issuedDate: '01 May 2026', permitType: 'Roofing (Residential Re-roof)', description: 'Tear off asphalt shingles and install Class 4 storm hailproof roofing.', estimatedValue: 24000, status: 'ISSUED' }
      ],
      dallas: [
        { permitNumber: 'DAL-ME-20512', issuedDate: '30 May 2026', permitType: 'Commercial Mechanical (HVAC Unit)', description: 'Install roof top package HVAC unit (5 Ton) matching wind load ratings.', estimatedValue: 16800, status: 'ISSUED' },
        { permitNumber: 'DAL-PL-19201', issuedDate: '12 May 2026', permitType: 'Plumbing Line Rehabilitation', description: 'Emergency water main valve bypass replacement and utility check.', estimatedValue: 8500, status: 'FINALED' },
        { permitNumber: 'DAL-RF-22415', issuedDate: '03 May 2026', permitType: 'Commercial Re-roofing', description: 'Full flat TPO roofing system overlay for hail impact restoration.', estimatedValue: 88700, status: 'ACTIVE' }
      ]
    };

    const normCity = city.toLowerCase();
    let selectedMocks = demoPermits.austin;
    if (normCity.includes('dallas')) selectedMocks = demoPermits.dallas;
    else {
      // Dynamic mock tailored to target city
      selectedMocks = [
        { permitNumber: `PM-${city.slice(0, 3).toUpperCase()}-9422`, issuedDate: '24 May 2026', permitType: `${cleanTrade} Permit`, description: `Complete ${cleanTrade} infrastructure overhaul and municipal compliance checking.`, estimatedValue: 14200, status: 'ISSUED' },
        { permitNumber: `PP-${city.slice(0, 3).toUpperCase()}-8805`, issuedDate: '18 May 2026', permitType: `${cleanTrade} Replacement`, description: `Emergency core asset rehabilitation for local property.`, estimatedValue: 9750, status: 'FINALED' }
      ];
    }

    return {
      data: selectedMocks,
      isMock: true
    };
  }

  try {
    // Fetch from custom municipal permit endpoint as defined by client variable
    const url = `${permitApiUrl.replace(/\/$/, '')}?city=${encodeURIComponent(city)}&trade=${encodeURIComponent(cleanTrade)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Permits endpoint responded with status ${res.status}`);
    }
    const payload = await res.json();
    
    // Map standard generic open data output gracefully
    const records = Array.isArray(payload) ? payload : payload.results || payload.records || [];
    const formatted: MunicipalPermit[] = records.slice(0, 4).map((item: any, idx: number) => ({
      permitNumber: item.permit_number || item.id || `MUNI-${idx + 10452}`,
      issuedDate: item.issue_date || item.issued_date || new Date().toLocaleDateString(),
      permitType: item.permit_type || item.work_class || `${cleanTrade} Permit`,
      description: item.description || item.work_description || `General contractor trade installations matching ${cleanTrade}`,
      estimatedValue: item.estimated_cost || item.project_value || undefined,
      status: item.status || item.permit_status || 'ISSUED'
    }));

    return {
      data: formatted,
      isMock: false
    };
  } catch (err) {
    console.error('Municipal Permits API request error:', err);
    return {
      data: [],
      isMock: true,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
