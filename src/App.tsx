import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { GAYA, KANTOR, TAMPIL_PEMILIH_GAYA } from './config';
import { DAFTAR_GAYA, KUNCI_SIMPAN, cariGaya, gayaAwal, type GayaId } from './gaya/daftar';
import { IDLE_LABEL, idleAt, isNight, isoDay, lapseAt, missionBoard, officeDesks, params as readParams, type DeskState, type IdleSpot } from './office';
import DashboardModal from './DashboardModal';

import OfficeScene from './OfficeScene';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const hm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export default function App() {
  const p = useMemo(() => readParams(new URLSearchParams(location.search)), []);
  const [now, setNow] = useState(() => new Date());
  const [t, setT] = useState(0);
  const [open, setOpen] = useState<DeskState | null>(null);
  const [dashboardBuka, setDashboardBuka] = useState(() => new URLSearchParams(location.search).get('dashboard') === '1');
  const [presetAngle, setPresetAngle] = useState<number | null>(Math.PI / 4);
  const drive = useRef<((t: number) => void) | null>(null);
  const anchors = useRef(new Map<string, HTMLElement>());
  const boardAnchor = useRef<HTMLElement | null>(null);
  const [gaya, setGaya] = useState<GayaId>(() => {
    let simpanan: string | null = null;
    try {
      simpanan = localStorage.getItem(KUNCI_SIMPAN);
    } catch {
      /* penyimpanan diblokir: pakai config */
    }
    return gayaAwal(new URLSearchParams(location.search).get('gaya'), simpanan, GAYA);
  });
  const [pilihBuka, setPilihBuka] = useState(false);
  const gantiGaya = (id: GayaId) => {
    setGaya(id);
    setPilihBuka(false);
    try {
      localStorage.setItem(KUNCI_SIMPAN, id);
    } catch {
      /* abaikan */
    }
    const q = new URLSearchParams(location.search);
    q.set('gaya', id);
    history.replaceState(null, '', `${location.pathname}?${q}`);
  };
  const g = cariGaya(gaya);

  // Scene time (agents walking, bubbles) and, with ?timelapse=1, the office clock. ?rekam=1: window.__koFrame(t).
  useEffect(() => {
    if (p.rec) {
      const w = window as unknown as { __koFrame?: (t: number) => boolean };
      w.__koFrame = (x: number) => {
        flushSync(() => setT(x));
        drive.current?.(x);
        return !!drive.current;
      };
      return () => void delete w.__koFrame;
    }
    const start = performance.now();
    const id = window.setInterval(() => {
      setT((performance.now() - start) / 1000);
      setNow(new Date());
    }, 100);
    return () => window.clearInterval(id);
  }, [p.rec]);

  const lapse = p.lapse ? lapseAt(t) : null;
  const time = lapse?.time ?? p.time ?? hm(now);
  const desks = officeDesks(isoDay(now), time, p.alwaysWork);
  const board = missionBoard(desks);
  const night = isNight(time);
  const withBubble = desks.filter((d) => d.bubble);
  const spotKey = withBubble.length ? withBubble[Math.floor(t / 2.5) % withBubble.length]!.desk.key : null;
  const working = desks.filter((d) => ['kerja', 'laporan', 'belajar'].includes(d.doing.activity)).length;
  const idle = desks.filter((d) => d.doing.activity === 'siaga').length;
  const latar = g.latar && (night ? g.latar.malam : g.latar.siang);

  return (
    <div className="ko" data-night={night || !!g.malam || undefined} data-gaya={gaya} style={latar ? { background: latar } : undefined}>
      <div className="ko-stage">
        <Suspense fallback={<div className="ko-loading">Menyiapkan kantor…</div>}>
          <OfficeScene
            desks={desks}
            night={night}
            boardCount={Math.min(board.items.length, 8)}
            anchors={anchors}
            boardAnchor={boardAnchor}
            cinematic
            manual={p.rec}
            drive={drive}
            gaya={gaya}
            onSelectAgent={(d) => setOpen(d)}
            presetAngle={presetAngle}
          />
        </Suspense>
        {g.tiltShift && <div className="ko-tilt" aria-hidden="true" />}
        <div className="ko-layer">
          {desks.map((d) => (
            <Tag
              key={d.desk.key}
              d={d}
              spot={spotKey === d.desk.key}
              idle={d.doing.activity === 'siaga' ? idleAt(d.desk.key, t).spot : null}
              refFn={(el) => (el ? anchors.current.set(d.desk.key, el) : anchors.current.delete(d.desk.key))}
              onOpen={() => setOpen(d)}
            />
          ))}
          <span className="ko-board-pin" ref={(el) => void (boardAnchor.current = el)}>
            Mission Board
          </span>
        </div>
      </div>

      <header className="ko-hud">
          {/* Camera angle controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '12px' }}>
            <button type="button" onClick={() => setPresetAngle(null)} title="Free camera" style={{ padding: '4px 8px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px' }}>Free</button>
            <button type="button" onClick={() => setPresetAngle(Math.PI/4)} title="Isometric" style={{ padding: '4px 8px', background: '#06b6d4', color: '#fff', border: 'none', borderRadius: '4px' }}>Iso</button>
            <button type="button" onClick={() => setPresetAngle(0)} title="Front" style={{ padding: '4px 8px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px' }}>Front</button>
            <button type="button" onClick={() => setPresetAngle(Math.PI)} title="Back" style={{ padding: '4px 8px', background: '#06b6d4', color: '#fff', border: 'none', borderRadius: '4px' }}>Back</button>
          </div>
        <div className="ko-brand">
          <span className="ko-live" />
          <div>
            <b>{KANTOR.nama}</b>
            <small>
              {KANTOR.subjudul} · {working} bekerja · {idle} santai · {board.items.length} misi
            </small>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setDashboardBuka(true)}
            title="Buka Project Progress & Signal Tracker Dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>📊 Dashboard Tracker</span>
          </button>
          <div className="ko-clock">
            <b>{time.replace(':', '.')}</b>
            <small>
              {HARI[now.getDay()]}, {now.getDate()} {BULAN[now.getMonth()]} {now.getFullYear()}
            </small>
          </div>
        </div>
      </header>

      {lapse && (!p.rec || lapse.inAct < 3) && (
        <p key={lapse.act} className="ko-act" style={p.rec ? { animation: 'none', opacity: Math.max(0, Math.min(1, lapse.inAct * 3, (3 - lapse.inAct) * 2)) } : undefined}>
          {lapse.title}
        </p>
      )}

      <aside className="ko-mini" onClick={() => setDashboardBuka(true)} style={{ cursor: 'pointer' }} title="Klik untuk membuka Dashboard Tracker lengkap">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ margin: 0 }}>Mission Board</h2>
          <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>Buka Tracker ↗</span>
        </div>
        <ul>
          {board.items.slice(0, 3).map((it, i) => (
            <li key={i}>
              <b style={{ color: it.color }}>{it.name}</b> {it.text}
            </li>
          ))}
        </ul>
        {board.metrics.length > 0 && (
          <dl>
            {board.metrics.slice(0, 4).map((m, i) => (
              <div key={i}>
                <dd>{m.nilai}</dd>
                <dt>{m.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </aside>

      {TAMPIL_PEMILIH_GAYA && !p.rec && (
        <nav className="ko-gaya" aria-label="Gaya 3D">
          {pilihBuka && (
            <ul>
              {DAFTAR_GAYA.map((x) => (
                <li key={x.id}>
                  <button type="button" aria-pressed={x.id === gaya} title={x.ket} onClick={() => gantiGaya(x.id as GayaId)}>
                    {x.nama}
                    {x.jenis === 'paduan' && <small>dunia</small>}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="ko-gaya-btn" aria-expanded={pilihBuka} onClick={() => setPilihBuka((b) => !b)}>
            Gaya: {g.nama}
          </button>
        </nav>
      )}

      {/* Kontrol Kamera & Petunjuk Kursor */}
      {!p.rec && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.75)',
            borderRadius: '16px',
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              📐 Angle Kamera:
            </span>
            <button
              type="button"
              onClick={() => setPresetAngle(Math.PI / 4)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(79, 70, 229, 0.4)',
                backgroundColor: presetAngle === Math.PI / 4 ? '#4f46e5' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Isometrik (45°)
            </button>
            <button
              type="button"
              onClick={() => setPresetAngle(0)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(79, 70, 229, 0.4)',
                backgroundColor: presetAngle === 0 ? '#4f46e5' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Depan (0°)
            </button>
            <button
              type="button"
              onClick={() => setPresetAngle(Math.PI / 2)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(79, 70, 229, 0.4)',
                backgroundColor: presetAngle === Math.PI / 2 ? '#4f46e5' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sisi Kanan
            </button>
            <button
              type="button"
              onClick={() => setPresetAngle(-Math.PI / 4)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(79, 70, 229, 0.4)',
                backgroundColor: presetAngle === -Math.PI / 4 ? '#4f46e5' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sisi Kiri
            </button>
            <button
              type="button"
              onClick={() => setPresetAngle(Math.PI / 4 + Math.random() * 0.0001)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🎯 Reset
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
            🖱️ <b>Drag:</b> Geser Layar · 🖱️ <b>Klik Kanan Drag:</b> Putar Sudut Bebas · 🔍 <b>Scroll:</b> Zoom · 👆 <b>Klik Karakter:</b> Buka Info
          </div>
        </div>
      )}

      {open && (
        <div className="ko-sheet" role="dialog" aria-label={open.agen.nama} onClick={() => setOpen(null)}>
          <div className="ko-sheet-in" onClick={(e) => e.stopPropagation()}>
            <h3>
              {open.agen.nama} <small>{open.agen.tugas}</small>
            </h3>
            <p>
              Sekarang: <b>{open.doing.label}</b>
            </p>
            {open.bubble && <p className="ko-sheet-sum">{open.bubble}</p>}
            {open.urgent.length > 0 && <p className="ko-sheet-urgent">⚠ {open.urgent.join(' · ')}</p>}
            {open.waiting.length > 0 && (
              <ul>
                {open.waiting.map((w, i) => (
                  <li key={i}>⏳ {w}</li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => setOpen(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {dashboardBuka && <DashboardModal onClose={() => setDashboardBuka(false)} />}
    </div>
  );
}

function Tag({ d, spot, idle, refFn, onOpen }: { d: DeskState; spot: boolean; idle: IdleSpot | null; refFn: (el: HTMLElement | null) => void; onOpen: () => void }) {
  const label = idle ? IDLE_LABEL[idle] : d.doing.label;
  const a = d.doing.activity;
  const think = a === 'kerja' ? '</>' : a === 'laporan' ? '•••' : a === 'belajar' ? '📖' : idle === 'kopi' ? '☕' : idle === 'papan' ? '📌' : idle === 'sofa' ? '💬' : null;
  return (
    <div className="ko-tag" ref={refFn} data-act={a} style={{ ['--agent' as string]: d.desk.color }}>
      <div className="ko-tag-in">
        {d.bubble && spot && a !== 'pulang' && <p className="ko-bubble">{d.bubble}</p>}
        {think && !(d.bubble && spot) && <span className="ko-think">{think}</span>}
        <div className="ko-tag-row">
          <button type="button" className="ko-name" onClick={onOpen}>
            <span className="ko-dot" />
            {d.agen.nama}
            <span className="ko-name-act">{label}</span>
          </button>
          {d.waiting.length > 0 && (
            <button type="button" className="ko-bang" onClick={onOpen} aria-label={`${d.waiting.length} butir menunggu keputusan`}>
              !
            </button>
          )}
          {d.urgent.length > 0 && <span className="ko-urgent">⚠</span>}
        </div>
      </div>
    </div>
  );
}
