import { Location } from '../types/weather';

export interface ResortInfo {
  name: string;
  webcams?: string[];
  trailConditionsUrl?: string;
  liftStatusUrl?: string;
  website?: string;
}

// Known ski resort information
const RESORT_INFO: Record<string, ResortInfo> = {
  'vail': {
    name: 'Vail',
    webcams: ['https://www.vail.com/mountain/mountain-conditions/mountain-cams'],
    trailConditionsUrl: 'https://www.vail.com/mountain/mountain-conditions',
    liftStatusUrl: 'https://www.vail.com/mountain/mountain-conditions/lift-status',
    website: 'https://www.vail.com'
  },
  'aspen': {
    name: 'Aspen',
    webcams: ['https://www.aspensnowmass.com/mountain-info/mountain-cams'],
    trailConditionsUrl: 'https://www.aspensnowmass.com/mountain-info/mountain-conditions',
    website: 'https://www.aspensnowmass.com'
  },
  'breckenridge': {
    name: 'Breckenridge',
    webcams: ['https://www.breckenridge.com/mountain/mountain-conditions/mountain-cams'],
    trailConditionsUrl: 'https://www.breckenridge.com/mountain/mountain-conditions',
    website: 'https://www.breckenridge.com'
  },
  'whistler': {
    name: 'Whistler Blackcomb',
    webcams: ['https://www.whistlerblackcomb.com/mountain/mountain-conditions/mountain-cams'],
    trailConditionsUrl: 'https://www.whistlerblackcomb.com/mountain/mountain-conditions',
    website: 'https://www.whistlerblackcomb.com'
  },
  'park-city': {
    name: 'Park City',
    webcams: ['https://www.parkcitymountain.com/mountain/mountain-conditions/mountain-cams'],
    trailConditionsUrl: 'https://www.parkcitymountain.com/mountain/mountain-conditions',
    website: 'https://www.parkcitymountain.com'
  },
  'jackson-hole': {
    name: 'Jackson Hole',
    webcams: ['https://www.jacksonhole.com/mountain/mountain-conditions/mountain-cams'],
    trailConditionsUrl: 'https://www.jacksonhole.com/mountain/mountain-conditions',
    website: 'https://www.jacksonhole.com'
  },
  'mammoth': {
    name: 'Mammoth Mountain',
    webcams: ['https://www.mammothmountain.com/mountain/mountain-conditions/mountain-cams'],
    trailConditionsUrl: 'https://www.mammothmountain.com/mountain/mountain-conditions',
    website: 'https://www.mammothmountain.com'
  },
  'crystal-mountain-wa': {
    name: 'Crystal Mountain, WA',
    webcams: ['https://www.crystalmountainresort.com/mountain-conditions'],
    trailConditionsUrl: 'https://www.crystalmountainresort.com/mountain-conditions',
    website: 'https://www.crystalmountainresort.com'
  }
};

export class ResortService {
  static getResortInfo(location: Location): ResortInfo | null {
    // Try to match by location ID
    if (location.id && RESORT_INFO[location.id]) {
      return RESORT_INFO[location.id];
    }

    // Try to match by name
    const locationName = location.name.toLowerCase();
    for (const info of Object.values(RESORT_INFO)) {
      if (locationName.includes(info.name.toLowerCase())) {
        return info;
      }
    }

    return null;
  }

  static hasResortInfo(location: Location): boolean {
    return this.getResortInfo(location) !== null;
  }
}

