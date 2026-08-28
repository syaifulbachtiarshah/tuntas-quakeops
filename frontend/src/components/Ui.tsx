import type { ReactNode } from 'react';
import type { Severity } from '../domain';

export function Panel({ title, eyebrow, action, className = '', children }: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-header">
        <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function StatusPill({ children, tone = 'info' }: {
  children: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
}) {
  return <span className={`status-pill ${tone}`}><i />{children}</span>;
}

export function SeverityBadge({ value }: { value: Severity }) {
  return <span className={`severity ${value}`}>{value}</span>;
}

export function Metric({ label, value, detail, tone = 'cyan' }: {
  label: string;
  value: string;
  detail: string;
  tone?: 'cyan' | 'amber' | 'red' | 'white';
}) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span><strong>{value}</strong><small>{detail}</small>
    </article>
  );
}

export function ProgressBar({ value, tone = 'cyan' }: { value: number; tone?: 'cyan' | 'amber' | 'red' }) {
  return <div className={`progress ${tone}`} aria-label={`${value}%`}><span style={{ width: `${value}%` }} /></div>;
}
