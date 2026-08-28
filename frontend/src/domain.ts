export type TabId =
  | 'overview'
  | 'replay'
  | 'forecast'
  | 'impact'
  | 'agents'
  | 'response'
  | 'architecture'
  | 'audit';

export type Severity = 'low' | 'guarded' | 'elevated' | 'high' | 'critical';
export type AgentState = 'monitoring' | 'analysing' | 'handoff' | 'ready';
export type PlanDecision = 'pending' | 'approved' | 'revision-requested' | 'rejected';

export interface HistoricalEvent {
  id: string;
  country: 'Indonesia' | 'Malaysia';
  name: string;
  date: string;
  magnitude: number;
  depthKm: number;
  epicentre: string;
  affectedArea: string;
  peakIntensity: string;
  replayProgress: number;
  latitude: number;
  longitude: number;
  fixtureLabel: string;
}

export interface ForecastWindow {
  label: string;
  probability: number;
  lower: number;
  upper: number;
  scope: string;
}

export interface ImpactSector {
  sector: string;
  indonesia: Severity;
  malaysia: Severity;
  operationalNote: string;
}

export interface SpecialistAgent {
  id: string;
  name: string;
  state: AgentState;
  task: string;
  evidenceCount: number;
  confidence: number;
  handoff: string;
  evidence: string[];
}

export interface ResponsePlan {
  id: string;
  decision: PlanDecision;
  priorities: string[];
  resources: string[];
  staging: string[];
  communications: string[];
  uncertainties: string[];
}

export interface AuditEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
  detail: string;
  tone: 'info' | 'warning' | 'success' | 'danger';
}

export interface DashboardData {
  missionId: string;
  missionStatus: string;
  lastUpdated: string;
  dataAgeMinutes: number;
  events: HistoricalEvent[];
  forecasts: ForecastWindow[];
  impacts: ImpactSector[];
  agents: SpecialistAgent[];
  plan: ResponsePlan;
  audit: AuditEvent[];
}
