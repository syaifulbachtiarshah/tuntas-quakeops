import type { AuditEvent, DashboardData, PlanDecision } from '../domain';
import { demoDashboard } from '../data/demo';

export interface QuakeOpsApi {
  getDashboard(): Promise<DashboardData>;
  recordPlanDecision(decision: PlanDecision, note: string): Promise<AuditEvent>;
}

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export class MockQuakeOpsApi implements QuakeOpsApi {
  async getDashboard(): Promise<DashboardData> {
    await delay(420);
    return structuredClone(demoDashboard);
  }

  async recordPlanDecision(decision: PlanDecision, note: string): Promise<AuditEvent> {
    await delay(260);
    const labels: Record<PlanDecision, string> = {
      pending: 'Plan returned to pending',
      approved: 'Plan approved locally',
      'revision-requested': 'Revision requested',
      rejected: 'Plan rejected',
    };

    return {
      id: `local-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-MY', { hour12: false }),
      actor: 'Human Commander · Demo',
      action: labels[decision],
      detail: note,
      tone: decision === 'approved' ? 'success' : decision === 'rejected' ? 'danger' : 'warning',
    };
  }
}

export const quakeOpsApi: QuakeOpsApi = new MockQuakeOpsApi();
