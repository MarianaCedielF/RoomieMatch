// ── User & Profile ────────────────────────────────────────────────────────────

export type HousingState = 'A' | 'B' | 'C';
// A = no room, no roomie | B = has room, no roomie | C = has roomie, no room

export interface University {
  id: string;
  name: string;
  city: string;
  emailDomain: string;
}

export interface HousingDetails {
  // State B — has a room
  address?: string;
  neighborhood?: string;
  city?: string;
  rent?: number;          // COP per person
  photos?: string[];
  rules?: string[];
  availableFrom?: string;
}

export interface CompatibilityAnswers {
  // Sleep schedule
  sleepTime: 'early' | 'normal' | 'late' | 'very_late';       // <22h | 22-23h | 23-0h | >0h
  wakeTime: 'very_early' | 'early' | 'normal' | 'late';       // <6h | 6-7h | 7-9h | >9h

  // Cleanliness
  cleanlinessLevel: 1 | 2 | 3 | 4 | 5;                         // 1=very messy, 5=very clean
  cleaningFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';

  // Noise
  noiseLevel: 'silent' | 'quiet' | 'moderate' | 'loud';
  studyEnvironment: 'silence' | 'music' | 'ambient' | 'any';

  // Guests
  guestsFrequency: 'never' | 'rarely' | 'sometimes' | 'often';
  overnightGuests: boolean;

  // Shared expenses
  expenseSplit: 'strict_50' | 'flexible' | 'whoever_has_more';
  budgetRange: 'under_400' | '400_600' | '600_800' | 'over_800'; // thousands COP

  // Social style
  socialStyle: 'introvert' | 'ambivert' | 'extrovert';
  sharedSpaces: 'prefer_alone' | 'neutral' | 'enjoy_together';

  // Pets & smoking
  hasPets: boolean;
  acceptsPets: boolean;
  smokes: boolean;
  acceptsSmoking: boolean;

  // Study habits
  studySchedule: 'mornings' | 'afternoons' | 'evenings' | 'nights' | 'flexible';
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  email: string;                   // university email
  university: University;
  career: string;
  semester: number;
  originCity: string;
  bio: string;
  avatar: string;                  // emoji or url
  housingState: HousingState;
  housingDetails?: HousingDetails;
  compatibility: CompatibilityAnswers;
  roommieId?: string;              // if State C — already matched partner
  reviewScore?: number;            // average from past roomies
  reviewCount?: number;
  verified: boolean;
  joinedAt: string;
  likedBy: string[];               // user ids who liked this profile
}

// ── Match & Chat ───────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  users: [string, string];
  createdAt: string;
  compatibilityScore: number;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

// ── Cohabitation Agreement ─────────────────────────────────────────────────────

export interface CohabitationAgreement {
  id: string;
  matchId: string;
  users: [string, string];
  cleaningSchedule: string;
  guestsPolicy: string;
  noiseHours: string;
  expensesSplit: string;
  commonAreaRules: string;
  otherRules: string;
  signedBy: string[];
  createdAt: string;
}

// ── Review ─────────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  score: number;           // 1–5
  comment: string;
  categories: {
    cleanliness: number;
    noise: number;
    respect: number;
    payments: number;
  };
  createdAt: string;
}

// ── Zone Guide ─────────────────────────────────────────────────────────────────

export interface Zone {
  id: string;
  name: string;
  city: string;
  avgRent: number;          // COP thousands
  safetyScore: number;      // 1–5
  transitScore: number;     // 1–5
  nearUniversities: string[];
  description: string;
  tags: string[];
}

// ── App State ──────────────────────────────────────────────────────────────────

export interface AppState {
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  matches: Match[];
  messages: Record<string, Message[]>;  // matchId -> messages
  agreements: CohabitationAgreement[];
  reviews: Review[];
  zones: Zone[];
  swipedIds: string[];
  likedIds: string[];
}

// ── Compatibility ──────────────────────────────────────────────────────────────

export interface CompatibilityResult {
  score: number;            // 0–100
  breakdown: {
    schedule: number;
    cleanliness: number;
    noise: number;
    guests: number;
    social: number;
    budget: number;
  };
  label: 'excellent' | 'good' | 'fair' | 'poor';
}
