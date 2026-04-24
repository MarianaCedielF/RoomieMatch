import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type {
  AppState, UserProfile, Match, Message,
  CohabitationAgreement, Review, HousingState
} from '../types';
import { MOCK_PROFILES, MOCK_ZONES, MOCK_REVIEWS, UNIVERSITIES } from '../data/mockData';

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState: AppState = {
  currentUser: null,
  profiles: MOCK_PROFILES,
  matches: [],
  messages: {},
  agreements: [],
  reviews: MOCK_REVIEWS,
  zones: MOCK_ZONES,
  swipedIds: [],
  likedIds: [],
};

// ── Actions ───────────────────────────────────────────────────────────────────
type Action =
  | { type: 'REGISTER'; payload: UserProfile }
  | { type: 'LOGIN'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'SWIPE_LIKE'; payload: string }
  | { type: 'SWIPE_PASS'; payload: string }
  | { type: 'CREATE_MATCH'; payload: Match }
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'CREATE_AGREEMENT'; payload: CohabitationAgreement }
  | { type: 'SIGN_AGREEMENT'; payload: { agreementId: string; userId: string } }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_HOUSING_STATE'; payload: HousingState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REGISTER':
    case 'LOGIN':
      return { ...state, currentUser: action.payload };

    case 'LOGOUT':
      return { ...state, currentUser: null, swipedIds: [], likedIds: [], matches: [], messages: {} };

    case 'SWIPE_LIKE': {
      const targetId = action.payload;
      const newSwipedIds = [...state.swipedIds, targetId];
      const newLikedIds = [...state.likedIds, targetId];

      // Update the target profile's likedBy
      const updatedProfiles = state.profiles.map(p =>
        p.id === targetId ? { ...p, likedBy: [...p.likedBy, state.currentUser!.id] } : p
      );

      // Check for mutual match
      const targetProfile = state.profiles.find(p => p.id === targetId);
      const isMutualMatch = targetProfile?.likedBy.includes(state.currentUser!.id) ?? false;

      if (isMutualMatch) {
        // inline score calculation to avoid circular import
        const a = state.currentUser!.compatibility;
        const b = targetProfile!.compatibility;
        const sleepOrder: Record<string, number> = { early: 0, normal: 1, late: 2, very_late: 3 };
        const wakeOrder: Record<string, number> = { very_early: 0, early: 1, normal: 2, late: 3 };
        const noiseOrder: Record<string, number> = { silent: 0, quiet: 1, moderate: 2, loud: 3 };
        const score = Math.round(
          (((3 - Math.abs(sleepOrder[a.sleepTime] - sleepOrder[b.sleepTime])) / 3) * 100 * 0.2) +
          (((4 - Math.abs(a.cleanlinessLevel - b.cleanlinessLevel)) / 4) * 100 * 0.2) +
          (((3 - Math.abs(noiseOrder[a.noiseLevel] - noiseOrder[b.noiseLevel])) / 3) * 100 * 0.18) +
          70 * 0.42
        );

        const newMatch: Match = {
          id: `match-${Date.now()}`,
          users: [state.currentUser!.id, targetId],
          createdAt: new Date().toISOString(),
          compatibilityScore: score,
        };
        return {
          ...state,
          swipedIds: newSwipedIds,
          likedIds: newLikedIds,
          profiles: updatedProfiles,
          matches: [...state.matches, newMatch],
          messages: { ...state.messages, [newMatch.id]: [] },
        };
      }

      return { ...state, swipedIds: newSwipedIds, likedIds: newLikedIds, profiles: updatedProfiles };
    }

    case 'SWIPE_PASS':
      return { ...state, swipedIds: [...state.swipedIds, action.payload] };

    case 'CREATE_MATCH':
      return {
        ...state,
        matches: [...state.matches, action.payload],
        messages: { ...state.messages, [action.payload.id]: [] },
      };

    case 'SEND_MESSAGE': {
      const { matchId } = action.payload;
      const existing = state.messages[matchId] || [];
      const updated = { ...state.messages, [matchId]: [...existing, action.payload] };
      // Update lastMessage on match
      const updatedMatches = state.matches.map(m =>
        m.id === matchId ? { ...m, lastMessage: action.payload } : m
      );
      return { ...state, messages: updated, matches: updatedMatches };
    }

    case 'CREATE_AGREEMENT':
      return { ...state, agreements: [...state.agreements, action.payload] };

    case 'SIGN_AGREEMENT':
      return {
        ...state,
        agreements: state.agreements.map(ag =>
          ag.id === action.payload.agreementId
            ? { ...ag, signedBy: [...ag.signedBy, action.payload.userId] }
            : ag
        ),
      };

    case 'ADD_REVIEW': {
      const review = action.payload;
      const updatedProfiles2 = state.profiles.map(p => {
        if (p.id !== review.toUserId) return p;
        const newCount = (p.reviewCount || 0) + 1;
        const newScore = p.reviewScore
          ? ((p.reviewScore * (newCount - 1)) + review.score) / newCount
          : review.score;
        return { ...p, reviewScore: Math.round(newScore * 10) / 10, reviewCount: newCount };
      });
      return { ...state, reviews: [...state.reviews, review], profiles: updatedProfiles2 };
    }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };

    case 'UPDATE_HOUSING_STATE':
      return {
        ...state,
        currentUser: state.currentUser
          ? { ...state.currentUser, housingState: action.payload }
          : null,
      };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helpers
  swipeLike: (targetId: string) => void;
  swipePass: (targetId: string) => void;
  sendMessage: (matchId: string, text: string) => void;
  getMatchPartner: (matchId: string) => UserProfile | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const swipeLike = (targetId: string) => dispatch({ type: 'SWIPE_LIKE', payload: targetId });
  const swipePass = (targetId: string) => dispatch({ type: 'SWIPE_PASS', payload: targetId });

  const sendMessage = (matchId: string, text: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        id: `msg-${Date.now()}`,
        matchId,
        senderId: state.currentUser.id,
        text,
        createdAt: new Date().toISOString(),
        read: false,
      },
    });
  };

  const getMatchPartner = (matchId: string): UserProfile | undefined => {
    const match = state.matches.find(m => m.id === matchId);
    if (!match || !state.currentUser) return undefined;
    const partnerId = match.users.find(id => id !== state.currentUser!.id);
    return state.profiles.find(p => p.id === partnerId);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, swipeLike, swipePass, sendMessage, getMatchPartner }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { UNIVERSITIES };
