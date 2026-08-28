import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { DashboardData, PlanDecision, TabId } from './domain';
import { quakeOpsApi } from './services/quakeOpsApi';
import { RotatingEarth } from './components/Earth';
import { Metric, Panel, ProgressBar, SeverityBadge, StatusPill } from './components/Ui';

const tabs: { id: TabId; label: string; short: string }[] = [
  { id: 'overview', label: 'Command Overview', short: '01' },
  { id: 'replay', label: 'Historical Replay', short: '02' },
  { id: 'forecast', label: 'Aftershock Forecast', short: '03' },
  { id: 'impact', label: 'Impact Assessment', short: '04' },
  { id: 'agents', label: 'Agent Operations', short: '05' },
  { id: 'response', label: 'Response Plan', short: '06' },
  { id: 'architecture', label: 'Technical Architecture', short: '07' },
  { id: 'audit', label: 'Audit & Approval', short: '08' },
];

const decisionCopy: Record<PlanDecision, string> = {
  pending: 'Awaiting human decision',
  approved: 'Approved locally · no dispatch',
  'revision-requested': 'Revision requested',
  rejected: 'Rejected by human commander',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [decisionBusy, setDecisionBusy] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await quakeOpsApi.getDashboard());
    } catch {
      setError('The local demo fixture could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDashboard(); }, []);

  const recordDecision = async (decision: PlanDecision, note: string) => {
    if (!data || decisionBusy) return;
    setDecisionBusy(true);
    try {
      const event = await quakeOpsApi.recordPlanDecision(decision, note);
      setData({ ...data, plan: { ...data.plan, decision }, audit: [event, ...data.audit] });
      setConfirmOpen(false);
    } finally {
      setDecisionBusy(false);
    }
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    setActiveTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">Skip to workspace</a>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="emergency-emblem" aria-hidden="true"><span /><span /><span /></div>
          <div><p>ASEAN EMERGENCY COMMAND CENTRE</p><h1>TUNTAS <b>QuakeOps</b></h1></div>
        </div>
        <div className="topbar-status">
          <StatusPill tone="warning">SIMULATED / HISTORICAL REPLAY</StatusPill>
          <div className="clock"><span>MISSION CLOCK</span><strong>02:42:16 MYT</strong></div>
          <div className="operator"><span>HC</span><div><b>Human Commander</b><small>Approval authority</small></div></div>
        </div>
      </header>

      <div className="system-ribbon">
        <span><i className="live-dot" /> Multi-agent foundation online</span>
        <span>External dispatch <b>DISABLED</b></span>
        <span>Data source <b>DEMO FIXTURES</b></span>
        <span className="ribbon-right">{data?.lastUpdated ?? 'Loading mission state…'}</span>
      </div>

      <div className="layout">
        <aside className="sidebar" aria-label="Mission modules">
          <div className="side-label">MISSION MODULES</div>
          <nav className="tabs" role="tablist" aria-orientation="vertical">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                ref={(node) => { tabRefs.current[index] = node; }}
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                <span>{tab.short}</span>{tab.label}
              </button>
            ))}
          </nav>
          <div className="safety-card">
            <span className="shield">◆</span>
            <div><b>Human gate active</b><small>All operational actions require approval.</small></div>
          </div>
          <div className="side-footer"><span>PROTOTYPE</span><b>v0.1.0</b></div>
        </aside>

        <main id="workspace" className="workspace" tabIndex={-1}>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => void loadDashboard()} />}
          {!loading && !error && data && (
            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
              {activeTab === 'overview' && <Overview data={data} />}
              {activeTab === 'replay' && <HistoricalReplay data={data} />}
              {activeTab === 'forecast' && <Forecast data={data} />}
              {activeTab === 'impact' && <Impact data={data} />}
              {activeTab === 'agents' && <AgentOperations data={data} />}
              {activeTab === 'response' && (
                <ResponsePlan
                  data={data}
                  busy={decisionBusy}
                  onApprove={() => setConfirmOpen(true)}
                  onDecision={recordDecision}
                />
              )}
              {activeTab === 'architecture' && <Architecture />}
              {activeTab === 'audit' && <Audit data={data} />}
            </div>
          )}
        </main>
      </div>

      {confirmOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => !decisionBusy && setConfirmOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="approval-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon">✓</span>
            <p className="eyebrow">HUMAN-IN-THE-LOOP GATE</p>
            <h2 id="approval-title">Approve this response plan?</h2>
            <p>This records a local demo approval only. It will not notify agencies, move assets, or dispatch emergency resources.</p>
            <div className="modal-warning"><b>No external action</b><span>Integration and dispatch remain disabled.</span></div>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setConfirmOpen(false)} disabled={decisionBusy}>Cancel</button>
              <button className="btn primary" onClick={() => void recordDecision('approved', 'Plan accepted after human review. External dispatch remained disabled.')} disabled={decisionBusy}>
                {decisionBusy ? 'Recording…' : 'Confirm local approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return <div className="state-screen" aria-live="polite"><div className="radar-loader" /><h2>Loading command workspace</h2><p>Hydrating deterministic mission fixtures…</p></div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="state-screen"><div className="error-mark">!</div><h2>Mission workspace unavailable</h2><p>{message}</p><button className="btn primary" onClick={onRetry}>Retry local load</button></div>;
}

function PageHeader({ eyebrow, title, description, right }: { eyebrow: string; title: string; description: string; right?: React.ReactNode }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{right}</header>;
}

function Overview({ data }: { data: DashboardData }) {
  const avgConfidence = Math.round(data.agents.reduce((sum, agent) => sum + agent.confidence, 0) / data.agents.length);
  return (
    <>
      <PageHeader eyebrow={`MISSION ${data.missionId}`} title="Regional situation picture" description="Two-event comparison for aftershock and impact forecasting readiness." right={<StatusPill tone="success">{data.missionStatus}</StatusPill>} />
      <div className="metric-grid">
        <Metric label="Events under replay" value="02" detail="Indonesia + Malaysia" />
        <Metric label="Agent confidence" value={`${avgConfidence}%`} detail="Cross-agent weighted view" tone="white" />
        <Metric label="Highest aftershock window" value={`${data.forecasts[0].probability}%`} detail={`${data.forecasts[0].label} · probabilistic`} tone="amber" />
        <Metric label="Human approval" value="PENDING" detail="No external dispatch" tone="red" />
      </div>
      <div className="overview-grid">
        <Panel title="ASEAN operational picture" eyebrow="ABSTRACT REGIONAL MAP" className="map-panel" action={<StatusPill>{data.dataAgeMinutes} min old</StatusPill>}>
          <AbstractMap />
          <div className="map-legend"><span><i className="marker id" /> Indonesia replay</span><span><i className="marker my" /> Malaysia replay</span><span><i className="radius" /> Probability envelope</span></div>
        </Panel>
        <Panel title="Mission intelligence" eyebrow="LIVE DEMO STATE" className="intelligence-panel">
          <div className="earth-stage"><RotatingEarth /><div className="earth-copy"><span>REGIONAL WATCH</span><strong>ASEAN</strong><small>Historical replay · no live feed</small></div></div>
          <div className="intel-list">
            <div><span>Primary operational risk</span><b>Access + population exposure</b></div>
            <div><span>Forecast posture</span><b>Probabilistic confidence bands</b></div>
            <div><span>Decision authority</span><b>Human commander</b></div>
          </div>
        </Panel>
      </div>
      <div className="event-grid">
        {data.events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
      <SafetyNotice />
    </>
  );
}

function AbstractMap() {
  return (
    <div className="map-canvas" role="img" aria-label="Abstract ASEAN operational map showing Malaysia and Indonesia replay areas">
      <svg viewBox="0 0 720 330" aria-hidden="true">
        <defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#2d6670" strokeOpacity=".15" /></pattern></defs>
        <rect width="720" height="330" fill="url(#grid)" />
        <g className="map-land">
          <path d="M164 54l48 8 38 24-9 34-47 13-38-19-17-32z" />
          <path d="M251 147l91-22 86 10 65 24-21 29-101 3-81-17z" />
          <path d="M333 210l78-8 91 19 69 42-32 22-83-20-104-4-54-27z" />
          <path d="M512 101l49-14 31 18-9 33-51 22-24-20z" />
          <path d="M591 170l35-4 23 37-11 62-27-12-13-45z" />
        </g>
        <g className="map-lines"><path d="M211 93C330 64 438 81 548 123" /><path d="M341 225C417 177 476 162 548 123" /></g>
        <g className="event-point indonesia"><circle cx="391" cy="233" r="54" /><circle cx="391" cy="233" r="26" /><circle cx="391" cy="233" r="6" /><text x="406" y="230">CIANJUR</text><text x="406" y="248">INDONESIA · M5.6</text></g>
        <g className="event-point malaysia"><circle cx="548" cy="123" r="42" /><circle cx="548" cy="123" r="20" /><circle cx="548" cy="123" r="6" /><text x="563" y="120">RANAU</text><text x="563" y="138">MALAYSIA · M6.0</text></g>
      </svg>
      <div className="map-coordinates">06° N — 07° S / 107° E — 117° E</div>
    </div>
  );
}

function EventCard({ event }: { event: DashboardData['events'][number] }) {
  return (
    <article className="event-card">
      <div className="event-card-top"><span className={`flag ${event.country.toLowerCase()}`}>{event.country === 'Indonesia' ? 'ID' : 'MY'}</span><div><small>{event.fixtureLabel}</small><h3>{event.name}</h3></div><strong>M{event.magnitude.toFixed(1)}</strong></div>
      <dl><div><dt>Date</dt><dd>{event.date}</dd></div><div><dt>Depth</dt><dd>{event.depthKm} km</dd></div><div><dt>Epicentre</dt><dd>{event.epicentre}</dd></div><div><dt>Peak intensity</dt><dd>{event.peakIntensity}</dd></div></dl>
      <div className="replay-line"><span>Replay progress</span><b>{event.replayProgress}%</b></div><ProgressBar value={event.replayProgress} tone={event.country === 'Indonesia' ? 'red' : 'cyan'} />
    </article>
  );
}

function HistoricalReplay({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader eyebrow="FROZEN COMPARISON WORKSPACE" title="Historical event replay" description="Replay known sequences to exercise the agent workflow without presenting live operational data." right={<StatusPill tone="warning">DEMO FIXTURES</StatusPill>} />
      <div className="replay-layout">
        <Panel title="Synchronized replay clock" eyebrow="T+ 00:47:32" className="timeline-panel">
          <div className="replay-clock"><span>21 NOV 2022 · 13:21:10</span><strong>00:47:32</strong><small>Relative mission time</small></div>
          <input className="time-scrubber" type="range" min="0" max="100" defaultValue="68" aria-label="Historical replay timeline" />
          <div className="time-marks"><span>Source event</span><span>First reports</span><span>Impact fusion</span><span>Plan draft</span></div>
          <div className="timeline-events">
            {['Source parameters frozen', 'Aftershock sequence ingested', 'Exposure layer compared', 'Response options generated'].map((item, index) => <div key={item}><span>{`T+${index * 14 + 2}m`}</span><i /><p>{item}</p><b>{index < 3 ? 'COMPLETE' : 'ACTIVE'}</b></div>)}
          </div>
        </Panel>
        <div className="replay-event-stack">{data.events.map((event) => <EventCard key={event.id} event={event} />)}</div>
      </div>
      <Panel title="Comparison signals" eyebrow="PATTERN RECOGNITION INPUTS">
        <div className="signal-grid">
          {['Sequence decay', 'Spatial migration', 'Depth distribution', 'Exposure overlap', 'Access degradation', 'Facility pressure'].map((signal, index) => <div className="signal" key={signal}><span>{signal}</span><ProgressBar value={[78, 61, 73, 86, 69, 58][index]} tone={index === 3 ? 'red' : index > 3 ? 'amber' : 'cyan'} /><small>{['Strong', 'Moderate', 'Strong', 'High', 'Elevated', 'Moderate'][index]}</small></div>)}
        </div>
      </Panel>
    </>
  );
}

function Forecast({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader eyebrow="PROBABILISTIC OPERATIONS VIEW" title="Aftershock forecast" description="Forecast windows support preparedness decisions; they do not predict an exact earthquake." right={<StatusPill tone="warning">MODEL LIMITATIONS APPLY</StatusPill>} />
      <div className="forecast-grid">
        {data.forecasts.map((window) => (
          <article className="forecast-card" key={window.label}>
            <span>{window.label}</span><strong>{window.probability}%</strong><small>{window.scope}</small>
            <div className="confidence-track"><i style={{ left: `${window.lower}%`, width: `${window.upper - window.lower}%` }} /><b style={{ left: `${window.probability}%` }} /></div>
            <div className="confidence-label"><span>{window.lower}% lower</span><span>{window.upper}% upper</span></div>
          </article>
        ))}
      </div>
      <div className="forecast-main">
        <Panel title="Probability envelope" eyebrow="DETERMINISTIC DEMO OUTPUT">
          <div className="probability-chart">
            {[68, 58, 47, 39, 34, 29, 25, 21].map((value, index) => <div className="bar-column" key={index}><span style={{ height: `${value}%` }} /><b>{value}%</b><small>{['0h', '6h', '12h', '24h', '48h', '3d', '5d', '7d'][index]}</small></div>)}
          </div>
        </Panel>
        <Panel title="Model context" eyebrow="ASSUMPTIONS & FRESHNESS">
          <ul className="context-list">
            <li><span>Method</span><b>Historical sequence-pattern fixture</b></li>
            <li><span>Spatial scope</span><b>Regional replay envelope</b></li>
            <li><span>Freshness</span><b>{data.dataAgeMinutes} minutes · demo clock</b></li>
            <li><span>Known gap</span><b>No live catalogue connection</b></li>
            <li><span>Confidence</span><b>Scenario-dependent; not calibrated for operations</b></li>
          </ul>
        </Panel>
      </div>
      <SafetyNotice />
    </>
  );
}

function SafetyNotice() {
  return <aside className="safety-notice"><span>!</span><div><b>Not an exact earthquake prediction</b><p>TUNTAS QuakeOps does not claim to forecast the precise time, location, or magnitude of a future earthquake. Outputs are probabilistic decision-support signals for this simulated historical replay.</p></div></aside>;
}

function Impact({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader eyebrow="COMPARATIVE EXPOSURE MODEL" title="Impact assessment" description="Prioritise consequences and access constraints while preserving uncertainty." right={<StatusPill>{data.impacts.length} sectors assessed</StatusPill>} />
      <div className="impact-summary">
        <Metric label="Population posture" value="CRITICAL" detail="Indonesia fixture" tone="red" />
        <Metric label="Access posture" value="HIGH" detail="Verify road and bridge state" tone="amber" />
        <Metric label="Health posture" value="ELEVATED" detail="Capacity confirmation required" tone="white" />
      </div>
      <Panel title="Cross-event impact matrix" eyebrow="HUMAN REVIEW REQUIRED">
        <div className="impact-table-wrap"><table className="impact-table"><thead><tr><th>Sector</th><th>Indonesia replay</th><th>Malaysia replay</th><th>Operational note</th></tr></thead><tbody>{data.impacts.map((row) => <tr key={row.sector}><th>{row.sector}</th><td><SeverityBadge value={row.indonesia} /></td><td><SeverityBadge value={row.malaysia} /></td><td>{row.operationalNote}</td></tr>)}</tbody></table></div>
      </Panel>
      <div className="impact-notes">
        <Panel title="Priority areas" eyebrow="PROPOSED"><ol><li>Dense settlement search sectors</li><li>Primary access corridors</li><li>Healthcare surge network</li></ol></Panel>
        <Panel title="Evidence gaps" eyebrow="UNRESOLVED"><ol><li>Live building damage observations</li><li>Verified facility capacity</li><li>Current road obstruction status</li></ol></Panel>
        <Panel title="Decision posture" eyebrow="RECOMMENDED"><ol><li>Validate before escalation</li><li>Keep actions reversible</li><li>Human approval before mobilisation</li></ol></Panel>
      </div>
    </>
  );
}

function AgentOperations({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader eyebrow="GOOGLE ADK MULTI-AGENT VIEW" title="Agent operations" description="Specialist outputs are evidence-backed recommendations—not facts or autonomous commands." right={<StatusPill tone="success">5 agents connected</StatusPill>} />
      <div className="agent-grid">
        {data.agents.map((agent, index) => (
          <article className="agent-card" key={agent.id}>
            <div className="agent-head"><span>{String(index + 1).padStart(2, '0')}</span><div><small>{agent.state.toUpperCase()}</small><h3>{agent.name}</h3></div><i className={`agent-state ${agent.state}`} /></div>
            <p>{agent.task}</p>
            <div className="agent-stats"><div><span>Evidence</span><b>{agent.evidenceCount}</b></div><div><span>Confidence</span><b>{agent.confidence}%</b></div></div>
            <ProgressBar value={agent.confidence} tone={agent.confidence > 85 ? 'cyan' : 'amber'} />
            <div className="handoff"><span>Next handoff</span><b>{agent.handoff} →</b></div>
            <details><summary>Inspect evidence</summary><ul>{agent.evidence.map((item) => <li key={item}>{item}</li>)}</ul></details>
          </article>
        ))}
      </div>
      <Panel title="Agent handoff timeline" eyebrow="MISSION EVENT BUS">
        <div className="handoff-timeline">{data.agents.slice(1).map((agent, index) => <div key={agent.id}><span>{`02:${38 + index}:1${index}`}</span><i /><p><b>{agent.name}</b> prepared evidence for {agent.handoff}.</p><StatusPill tone={index < 2 ? 'success' : 'info'}>{index < 2 ? 'verified' : 'active'}</StatusPill></div>)}</div>
      </Panel>
    </>
  );
}

function ResponsePlan({ data, busy, onApprove, onDecision }: { data: DashboardData; busy: boolean; onApprove: () => void; onDecision: (decision: PlanDecision, note: string) => Promise<void> }) {
  const plan = data.plan;
  return (
    <>
      <PageHeader eyebrow={`PLAN ${plan.id}`} title="Proposed response plan" description="A reversible, evidence-linked proposal awaiting human command authority." right={<StatusPill tone={plan.decision === 'approved' ? 'success' : plan.decision === 'rejected' ? 'danger' : 'warning'}>{decisionCopy[plan.decision]}</StatusPill>} />
      <div className="plan-grid">
        <PlanSection number="01" title="Operational priorities" items={plan.priorities} />
        <PlanSection number="02" title="Resource posture" items={plan.resources} />
        <PlanSection number="03" title="Staging locations" items={plan.staging} />
        <PlanSection number="04" title="Communications" items={plan.communications} />
      </div>
      <Panel title="Uncertainty register" eyebrow="MUST BE ACKNOWLEDGED" className="uncertainty-panel"><ul>{plan.uncertainties.map((item) => <li key={item}><span>!</span>{item}</li>)}</ul></Panel>
      <div className="approval-console">
        <div><span className="eyebrow">HUMAN COMMAND DECISION</span><h3>No action leaves this interface automatically.</h3><p>Approval creates a local audit event only. Integrations remain disabled.</p></div>
        <div className="approval-actions">
          <button className="btn danger" disabled={busy} onClick={() => void onDecision('rejected', 'Plan rejected in the local demo workspace. No external action was taken.')}>Reject</button>
          <button className="btn ghost" disabled={busy} onClick={() => void onDecision('revision-requested', 'Revision requested: strengthen evidence and update uncertainty notes.')}>Request revision</button>
          <button className="btn primary" disabled={busy} onClick={onApprove}>Approve plan</button>
        </div>
      </div>
    </>
  );
}

function PlanSection({ number, title, items }: { number: string; title: string; items: string[] }) {
  return <article className="plan-section"><span>{number}</span><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}

function Architecture() {
  const nodes = useMemo(() => [
    { title: 'Historical fixtures', detail: 'Frozen event comparison', status: 'DEMO MOCK', tone: 'mock' },
    { title: 'FastAPI service', detail: 'Typed mission endpoints', status: 'FOUNDATION', tone: 'foundation' },
    { title: 'Google ADK workflow', detail: 'Mission orchestration', status: 'FOUNDATION', tone: 'foundation' },
    { title: 'Gemini reasoning', detail: 'Agent synthesis', status: 'FOUNDATION', tone: 'foundation' },
    { title: 'Forecast + impact tools', detail: 'Deterministic adapters', status: 'PLANNED', tone: 'planned' },
    { title: 'Human approval gate', detail: 'Review before action', status: 'UI COMPLETE', tone: 'foundation' },
    { title: 'Cloud Run', detail: 'Managed deployment', status: 'PLANNED', tone: 'planned' },
  ], []);
  return (
    <>
      <PageHeader eyebrow="SYSTEM DESIGN" title="Technical architecture" description="Separation of implemented foundation, UI mock, and planned Google Cloud integration." right={<StatusPill tone="warning">Prototype architecture</StatusPill>} />
      <Panel title="End-to-end mission flow" eyebrow="TUNTAS QUAKEOPS">
        <div className="architecture-flow">{nodes.map((node, index) => <div className="architecture-step" key={node.title}><article><span className={`architecture-status ${node.tone}`}>{node.status}</span><small>{String(index + 1).padStart(2, '0')}</small><h3>{node.title}</h3><p>{node.detail}</p></article>{index < nodes.length - 1 && <i aria-hidden="true">→</i>}</div>)}</div>
      </Panel>
      <div className="architecture-legend">
        <div><i className="foundation" /><span><b>Implemented foundation</b>Backend or UI structure exists in the repository.</span></div>
        <div><i className="mock" /><span><b>Demo mock</b>Deterministic fixture; not live operational data.</span></div>
        <div><i className="planned" /><span><b>Planned integration</b>Not yet implemented or deployed.</span></div>
      </div>
      <div className="architecture-notes">
        <Panel title="Frontend boundary" eyebrow="THIS MILESTONE"><p>React and TypeScript consume a typed API adapter. No Google key, model call, database, or emergency dispatch exists in client code.</p></Panel>
        <Panel title="Backend boundary" eyebrow="PRESERVED"><p>Existing Python FastAPI and Google ADK files remain unchanged. API integration is deliberately deferred.</p></Panel>
      </div>
    </>
  );
}

function Audit({ data }: { data: DashboardData }) {
  return (
    <>
      <PageHeader eyebrow="IMMUTABLE-STYLE LOCAL LOG" title="Audit & approval" description="Trace agent handoffs, safety gates, and human plan decisions inside this browser session." right={<StatusPill tone="success">External dispatch disabled</StatusPill>} />
      <div className="audit-summary">
        <Metric label="Plan decision" value={data.plan.decision.toUpperCase()} detail="Local browser state" tone={data.plan.decision === 'approved' ? 'cyan' : 'amber'} />
        <Metric label="Safety gate" value="ACTIVE" detail="Human confirmation required" tone="white" />
        <Metric label="External actions" value="ZERO" detail="No agency integrations" tone="red" />
      </div>
      <Panel title="Mission audit stream" eyebrow="NEWEST FIRST">
        <div className="audit-stream">{data.audit.map((event) => <article key={event.id}><time>{event.time}</time><i className={event.tone} /><div><span>{event.actor}</span><h3>{event.action}</h3><p>{event.detail}</p></div><small>LOCAL</small></article>)}</div>
      </Panel>
      <div className="audit-policy"><span>◆</span><div><b>Prototype audit policy</b><p>Events are stored in component memory and reset on refresh. Production persistence, identity, signatures, and retention policy are planned work.</p></div></div>
    </>
  );
}
