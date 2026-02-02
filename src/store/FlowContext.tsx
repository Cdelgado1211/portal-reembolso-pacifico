import React, { createContext, useContext, useMemo, useReducer } from "react";

export type UploadCategory = "invoices" | "medical" | "evidence";
export type UploadStatus = "pending" | "valid" | "invalid" | "validating";

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  message?: string;
  category: UploadCategory;
  validatedAt?: number;
};

export type FlowState = {
  currentStep: number;
  sessionToken: string | null;
  sessionExpiresAt: number | null;
  selectedInsuredId: string | null;
  claimType: string;
  uploads: Record<UploadCategory, UploadItem[]>;
  claimNumber: string | null;
  attemptCount: number;
  lockUntil: number | null;
};

type FlowAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_SESSION"; payload: { token: string; expiresAt: number } }
  | { type: "CLEAR_SESSION" }
  | { type: "SET_INSURED"; payload: string | null }
  | { type: "SET_CLAIM_TYPE"; payload: string }
  | { type: "ADD_UPLOADS"; payload: { category: UploadCategory; items: UploadItem[] } }
  | { type: "UPDATE_UPLOAD"; payload: { category: UploadCategory; id: string; updates: Partial<UploadItem> } }
  | { type: "REMOVE_UPLOAD"; payload: { category: UploadCategory; id: string } }
  | { type: "SET_CLAIM_NUMBER"; payload: string | null }
  | { type: "SET_ATTEMPT_COUNT"; payload: number }
  | { type: "SET_LOCK_UNTIL"; payload: number | null }
  | { type: "RESET_FLOW" };

const FLOW_KEY = "atlas_flow_state_v1";
const ATTEMPT_KEY = "atlas_attempt_count";
const LOCK_KEY = "atlas_lock_until";

const emptyUploads: Record<UploadCategory, UploadItem[]> = {
  invoices: [],
  medical: [],
  evidence: []
};

const defaultState: FlowState = {
  currentStep: 1,
  sessionToken: null,
  sessionExpiresAt: null,
  selectedInsuredId: null,
  claimType: "",
  uploads: emptyUploads,
  claimNumber: null,
  attemptCount: 0,
  lockUntil: null
};

const isSessionValid = (token: string | null, expiresAt: number | null) => {
  if (!token || !expiresAt) return false;
  return Date.now() < expiresAt;
};

const loadState = (): FlowState => {
  const raw = localStorage.getItem(FLOW_KEY);
  const stored = raw ? (JSON.parse(raw) as FlowState) : defaultState;
  const attemptCount = Number(localStorage.getItem(ATTEMPT_KEY) ?? stored.attemptCount ?? 0);
  const lockRaw = localStorage.getItem(LOCK_KEY);
  const lockUntil = lockRaw ? Number(lockRaw) : stored.lockUntil ?? null;

  const hasValidSession = isSessionValid(stored.sessionToken, stored.sessionExpiresAt);
  if (!hasValidSession) {
    return {
      ...defaultState,
      attemptCount: Number.isNaN(attemptCount) ? 0 : attemptCount,
      lockUntil: Number.isNaN(lockUntil ?? NaN) ? null : lockUntil
    };
  }

  return {
    ...defaultState,
    ...stored,
    attemptCount: Number.isNaN(attemptCount) ? 0 : attemptCount,
    lockUntil: Number.isNaN(lockUntil ?? NaN) ? null : lockUntil
  };
};

const persistState = (state: FlowState) => {
  localStorage.setItem(FLOW_KEY, JSON.stringify(state));
  localStorage.setItem(ATTEMPT_KEY, String(state.attemptCount));
  if (state.lockUntil) {
    localStorage.setItem(LOCK_KEY, String(state.lockUntil));
  } else {
    localStorage.removeItem(LOCK_KEY);
  }
};

const reducer = (state: FlowState, action: FlowAction): FlowState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_SESSION":
      return {
        ...state,
        sessionToken: action.payload.token,
        sessionExpiresAt: action.payload.expiresAt
      };
    case "CLEAR_SESSION":
      return {
        ...state,
        sessionToken: null,
        sessionExpiresAt: null
      };
    case "SET_INSURED":
      return { ...state, selectedInsuredId: action.payload };
    case "SET_CLAIM_TYPE":
      return { ...state, claimType: action.payload };
    case "ADD_UPLOADS":
      return {
        ...state,
        uploads: {
          ...state.uploads,
          [action.payload.category]: [
            ...state.uploads[action.payload.category],
            ...action.payload.items
          ]
        }
      };
    case "UPDATE_UPLOAD":
      return {
        ...state,
        uploads: {
          ...state.uploads,
          [action.payload.category]: state.uploads[action.payload.category].map((item) =>
            item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
          )
        }
      };
    case "REMOVE_UPLOAD":
      return {
        ...state,
        uploads: {
          ...state.uploads,
          [action.payload.category]: state.uploads[action.payload.category].filter(
            (item) => item.id !== action.payload.id
          )
        }
      };
    case "SET_CLAIM_NUMBER":
      return { ...state, claimNumber: action.payload };
    case "SET_ATTEMPT_COUNT":
      return { ...state, attemptCount: action.payload };
    case "SET_LOCK_UNTIL":
      return { ...state, lockUntil: action.payload };
    case "RESET_FLOW":
      return {
        ...defaultState,
        attemptCount: state.attemptCount,
        lockUntil: state.lockUntil
      };
    default:
      return state;
  }
};

type FlowContextValue = {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  resetFlow: () => void;
};

const FlowContext = createContext<FlowContextValue | undefined>(undefined);

export const FlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  const value = useMemo<FlowContextValue>(() => {
    return {
      state,
      dispatch,
      resetFlow: () => dispatch({ type: "RESET_FLOW" })
    };
  }, [state]);

  React.useEffect(() => {
    persistState(state);
  }, [state]);

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within FlowProvider");
  }
  return context;
};
