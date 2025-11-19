export type Rank = 'dirt' | 'iron' | 'bronze' | 'silver' | 'gold';

export interface RankInfo {
  name: string;
  color: string;
  description: string;
  violationsRequired: number;
}

export const RANKS: Record<Rank, RankInfo> = {
  dirt: { name: 'Dirt', color: '#8B7355', description: 'Just starting your journey as a road safety advocate', violationsRequired: 0 },
  iron: { name: 'Iron', color: '#71797E', description: 'Building your reputation with consistent reporting', violationsRequired: 5 },
  bronze: { name: 'Bronze', color: '#CD7F32', description: 'Proven contributor to road safety', violationsRequired: 10 },
  silver: { name: 'Silver', color: '#C0C0C0', description: 'Experienced and reliable safety advocate', violationsRequired: 15 },
  gold: { name: 'Gold', color: '#FFD700', description: 'Elite road safety champion', violationsRequired: 20 },
};

export interface User {
  username: string;
  points: number;
  rank: Rank;
  violationCount: number;
}

export interface VehicleDetails {
  type: string;
  licensePlate: string;
  color: string;
  make?: string;
  model?: string;
}

export interface EnvironmentDetails {
  timeOfDay: 'Day' | 'Night' | 'Dusk/Dawn';
  weather: 'Clear' | 'Rainy' | 'Foggy' | 'Overcast' | 'Unknown';
  roadType: 'Highway' | 'City Street' | 'Intersection' | 'Residential' | 'Parking Lot';
}

export interface ViolationInstance {
  violationType: 'Red Light Violation' | 'No Helmet' | 'Wrong Way' | 'Stop Sign Violation' | 'Illegal Parking' | 'Phone Usage While Driving' | 'None';
  vehicleDetails: VehicleDetails;
  severity: 'Low' | 'Medium' | 'High';
  reasoning: string;
  confidenceScore: number;
}

export interface GeminiAnalysisResult {
  isViolation: boolean;
  violations: ViolationInstance[];
  summaryReasoning: string;
  environment: EnvironmentDetails;
}

export interface ViolationReportData extends GeminiAnalysisResult {
  imageUrl: string;
  mediaType: 'image' | 'video';
  videoUrl?: string; // For video files
  location: {
    latitude: number;
    longitude: number;
  } | null;
  reportId: string;
  userId?: string | null;
  username?: string | null;
}

export interface Reward {
  id: string;
  company: string;
  description: string;
  cost: number;
  promoCode: string;
  iconUrl: string;
}

export interface PoliceStation {
  name: string;
  lat: number;
  lng: number;
}