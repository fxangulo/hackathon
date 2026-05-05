'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ROLE = {
  OWNER: 'Owner',
  APPROVER: 'Approver',
  VIEWER: 'Viewer',
};

const seedMbos = [
  {
    id: 'MBO-001',
    owner: 'Priya Rao',
    group: 'People Ops',
    objective: 'Reduce dysfunctional attrition',
    metric: 'Attrition %',
    target: 7,
    baseline: 10,
    timeframe: '2026-10-31',
    calculationMethod: 'Lower is better: progress = (baseline - current) / (baseline - target)',
    status: 'Active',
    currentValue: 8.4,
  },
  {
    id: 'MBO-002',
    owner: 'Alex Kim',
    group: 'Sales',
    objective: 'Increase enterprise pipeline',
    metric: 'Pipeline Coverage (x)',
    target: 3,
    baseline: 1.8,
    timeframe: '2026-10-31',
    calculationMethod: 'Higher is better: progress = current / target',
    status: 'Approved',
    currentValue: 2.1,
  },
  {
    id: 'MBO-003',
    owner: 'Maya Chen',
    group: 'Customer Success',
    objective: 'Improve NPS',
    metric: 'NPS Score',
    target: 60,
    baseline: 48,
    timeframe: '2026-10-31',
    calculationMethod: 'Higher is better: progress = current / target',
    status: 'Submitted',
    currentValue: 51,
  },
];

const blankForm = {
  id: '',
  owner: '',
  group: '',
  objective: '',
  metric: '',
  target: '',
  baseline: '',
  timeframe: '',
  calculationMethod: 'Higher is better: progress = current / target',
};

const payoutFromProgress = (pct) => {
  if (pct < 80) return 0;
  if (pct < 100) return 50;
  return 100;
};

const computeProgress = (mbo) => {
  const target = Number(mbo.target);
  const baseline = Number(mbo.baseline);
  const current = Number(mbo.currentValue || 0);

  if (!Number.isFinite(target) || target === 0) return 0;

  const lowerIsBetter = mbo.calculationMethod.toLowerCase().includes('lower is better');
  let rawProgress;

  if (lowerIsBetter && baseline !== target) {
    rawProgress = ((baseline - current) / (baseline - target)) * 100;
  } else {
    rawProgress = (current / target) * 100;
  }

  return Math.max(0, Math.min(120, rawProgress));
};

export default function Home() {
  const [role, setRole] = useState(ROLE.OWNER);
  const [mbos, setMbos] = useState(seedMbos);
  const [form, setForm] = useState(blankForm);

  const canCreate = role === ROLE.OWNER;
  const canSubmit = role === ROLE.OWNER;
  const canApprove = role === ROLE.APPROVER;
  const canUpdateProgress = role === ROLE.OWNER;

  const enriched = useMemo(
    () =>
      mbos.map((mbo) => {
        const progress = computeProgress(mbo);
        const payout = payoutFromProgress(progress);
        const status = progress >= 100 ? 'Completed' : mbo.status;
        return { ...mbo, progress, payout, status };
      }),
    [mbos],
  );

  const createMbo = (e) => {
    e.preventDefault();
    if (!canCreate) return;

    const newMbo = {
      ...form,
      target: Number(form.target),
      baseline: Number(form.baseline),
      currentValue: Number(form.baseline),
      status: 'Draft',
    };

    setMbos((prev) => [newMbo, ...prev]);
    setForm(blankForm);
  };

  const updateMbo = (id, updates) => {
    setMbos((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>MBO Lite – End-to-End Lifecycle Demo</h1>

      <section style={{ background: '#fff', padding: 16, borderRadius: 10, marginBottom: 16 }}>
        <label>
          Role Simulation: 
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ marginLeft: 8 }}>
            {Object.values(ROLE).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 10, marginBottom: 16 }}>
        <h2>Create MBO</h2>
        <form onSubmit={createMbo} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(form).map(([k, v]) => (
            <input
              key={k}
              required
              placeholder={k}
              value={v}
              onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
              disabled={!canCreate}
            />
          ))}
          <button type="submit" disabled={!canCreate} style={{ gridColumn: '1 / -1' }}>
            Create MBO
          </button>
        </form>
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 10, marginBottom: 16 }}>
        <h2>Dashboard</h2>
        <table width="100%" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#eef2ff' }}>
              <th>Objective</th><th>Owner</th><th>Status</th><th>Progress %</th><th>Target vs Current</th><th>Achievement & Payout</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((mbo) => (
              <tr key={mbo.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{mbo.objective}</td>
                <td>{mbo.owner}</td>
                <td>{mbo.status}</td>
                <td style={{ color: mbo.progress < 80 ? 'crimson' : mbo.progress < 100 ? '#cc8800' : 'green' }}>{mbo.progress.toFixed(1)}%</td>
                <td>{mbo.target} vs {mbo.currentValue}</td>
                <td>Achievement: {mbo.progress.toFixed(0)}% | Payout: {mbo.payout}%</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button disabled={!canSubmit || mbo.status !== 'Draft'} onClick={() => updateMbo(mbo.id, { status: 'Submitted' })}>Submit</button>
                    <button disabled={!canApprove || mbo.status !== 'Submitted'} onClick={() => updateMbo(mbo.id, { status: 'Approved' })}>Approve</button>
                    <button disabled={mbo.status !== 'Approved'} onClick={() => updateMbo(mbo.id, { status: 'Active' })}>Activate</button>
                    <input
                      type="number"
                      step="0.1"
                      value={mbo.currentValue}
                      onChange={(e) => canUpdateProgress && updateMbo(mbo.id, { currentValue: Number(e.target.value) })}
                      disabled={!canUpdateProgress}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 10 }}>
        <h2>MBO vs Progress %</h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={enriched.map((m) => ({ name: m.id, progress: Number(m.progress.toFixed(1)) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 120]} />
              <Tooltip />
              <Bar dataKey="progress" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}
