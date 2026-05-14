import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import KPICard from '../components/KPICard.jsx';
import Card from '../components/Card.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import QuickActions from '../components/QuickActions.jsx';
import NexusMap from '../components/NexusMap.jsx';

const GRADE_COLOR = {
  A: 'text-ok', B: 'text-accent', C: 'text-warn', D: 'text-warn', F: 'text-danger',
};

export default function Dashboard() {
  const [kpis, setKpis] = useState({ hot: null, buyers: null, deals: null, contracts: null });
  const [events, setEvents] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [pins, setPins] = useState([]);

  useEffect(() => {
    let cancel = false;
    async function load() {
      const [hot, buyers, deals, contracts] = await Promise.all([
        supabase.from('seller_leads').select('*', { count: 'exact', head: true }).eq('classification', 'hot'),
        supabase.from('buyer_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('deal_analyses').select('*', { count: 'exact', head: true }),
        supabase.from('contracts').select('*', { count: 'exact', head: true }),
      ]);
      if (cancel) return;
      setKpis({
        hot: hot.count ?? 0,
        buyers: buyers.count ?? 0,
        deals: deals.count ?? 0,
        contracts: contracts.count ?? 0,
      });

      const [{ data: ev }, { data: td }, { data: leads }] = await Promise.all([
        supabase.from('event_log').select('id, event_type, entity_id, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('deal_analyses').select('id, address, city, state, deal_score, grade').order('deal_score', { ascending: false }).limit(5),
        supabase.from('seller_leads').select('id, property_city, property_state, motivation_score, lat, lng').not('lat', 'is', null).limit(50),
      ]);
      if (cancel) return;
      setEvents(ev ?? []);
      setTopDeals(td ?? []);
      setPins(
        (leads ?? []).map((l) => ({
          id: l.id,
          lat: l.lat,
          lng: l.lng,
          label: `${l.property_city ?? ''}, ${l.property_state ?? ''}`.trim(),
          sublabel: `Motivation ${l.motivation_score ?? '—'}`,
          weight: (l.motivation_score ?? 0) / 100,
        }))
      );
    }
    load();
    return () => { cancel = true; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Dashboard</h1>
          <p className="text-sm text-muted">Live view of every Nexus pipeline.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Hot Leads" value={kpis.hot} accent hint="classification = hot" />
        <KPICard label="Buyers" value={kpis.buyers} hint="total profiles" />
        <KPICard label="Deals Analyzed" value={kpis.deals} hint="all-time" />
        <KPICard label="Contracts" value={kpis.contracts} hint="generated" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Market Map" className="lg:col-span-2">
          <NexusMap points={pins} />
          <p className="mt-3 text-xs text-muted">
            Pins from seller_leads with geocoded addresses ({pins.length}). Real heatmap layer in v2.
          </p>
        </Card>
        <Card title="Quick Actions">
          <QuickActions />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Top Deals" className="lg:col-span-2" action={<Link to="/app/deals" className="text-xs text-accent hover:underline">View all →</Link>}>
          {topDeals.length === 0 ? (
            <div className="text-sm text-muted">Run your first analysis to see top deals.</div>
          ) : (
            <ul className="divide-y divide-border">
              {topDeals.map((d) => (
                <li key={d.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <Link to={`/app/deals/${d.id}`} className="text-sm text-text hover:text-accent truncate block">
                      {d.address || d.id}
                    </Link>
                    <div className="text-xs text-muted">{d.city}{d.state ? `, ${d.state}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${GRADE_COLOR[d.grade] ?? 'text-text'}`}>{d.grade ?? '—'}</div>
                      <div className="text-xs text-muted">grade</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-text">{d.deal_score ?? '—'}</div>
                      <div className="text-xs text-muted">score</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent Activity" action={<span className="text-xs text-muted">event_log</span>}>
          <ActivityFeed events={events} />
        </Card>
      </div>
    </div>
  );
}
