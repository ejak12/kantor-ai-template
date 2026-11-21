import React, { useState, useEffect } from 'react';

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  status: 'To Do' | 'In Progress' | 'Done';
  updatedAt: string;
}

export interface LogItem {
  id: string;
  time: string;
  type: string;
  message: string;
}

const STORAGE_KEY_TASKS = 'ppst_tasks_v2';
const STORAGE_KEY_LOGS = 'ppst_logs_v2';

const CATEGORIES = [
  'Semua',
  'Toko & Affiliate',
  'Riset Produk',
  'Admin & Link',
  'Konten Kreator',
  'Web Dev',
  'Automation',
  'Trading',
  'Digital Product',
] as const;

const STATUS_ORDER: TaskItem['status'][] = ['To Do', 'In Progress', 'Done'];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'tsk-toko-1',
    title: 'Radar flash sale midnight: 4 gamis crinkle & 2 mukena travel mini (komisi ekstra 15%)',
    category: 'Riset Produk',
    status: 'In Progress',
    updatedAt: 'Baru saja',
  },
  {
    id: 'tsk-toko-2',
    title: 'Sinkronisasi voucher diskon 25rb & optimasi 32 link etalase koleksi toko',
    category: 'Admin & Link',
    status: 'Done',
    updatedAt: 'Hari ini',
  },
  {
    id: 'tsk-toko-3',
    title: 'Produksi 5 skrip racun Shopee Video & caption checkout keranjang kuning',
    category: 'Konten Kreator',
    status: 'In Progress',
    updatedAt: 'Hari ini',
  },
  {
    id: 'tsk-toko-4',
    title: 'Monitoring klik harian (114 klik) & evaluasi konversi toko affiliate',
    category: 'Toko & Affiliate',
    status: 'In Progress',
    updatedAt: 'Hari ini',
  },
  {
    id: 'tsk-1',
    title: 'Integrasi webhook TradingView ke bot notifikasi Telegram',
    category: 'Automation',
    status: 'To Do',
    updatedAt: 'Hari ini',
  },
  {
    id: 'tsk-2',
    title: 'Slicing dashboard analitik & dark mode responsiveness',
    category: 'Web Dev',
    status: 'Done',
    updatedAt: 'Kemarin',
  },
  {
    id: 'tsk-3',
    title: 'Backtest strategi breakout sesi London (XAUUSD & BTC)',
    category: 'Trading',
    status: 'To Do',
    updatedAt: 'Hari ini',
  },
  {
    id: 'tsk-4',
    title: 'Finalisasi template Notion & landing page rilis produk digital',
    category: 'Digital Product',
    status: 'To Do',
    updatedAt: 'Hari ini',
  },
];

const AUTOMATION_MODES = [
  { label: 'Online & Sinkron', color: '#22d3ee' },
  { label: 'Webhook Standby', color: '#34d399' },
  { label: 'Manual Override', color: '#fbbf24' },
];

export default function DashboardModal({ onClose }: { onClose: () => void }) {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [logs, setLogs] = useState<LogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return [
      { id: 'log-1', time: now, type: 'SYSTEM', message: 'Workspace tracker aktif - Fokus peran: Toko & Affiliate.' },
      { id: 'log-2', time: now, type: 'ACTIVE', message: 'Lou (Riset) & Youna (Konten) sedang menjalankan task malam.' },
      { id: 'log-3', time: now, type: 'DONE', message: 'Rouse (Admin) menyelesaikan sinkronisasi 32 link voucher.' },
    ];
  });

  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Toko & Affiliate');
  const [modeIdx, setModeIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch {
      /* ignore */
    }
  }, [logs]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const getTimeStr = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const addLog = (type: string, message: string) => {
    const newLog: LogItem = { id: `log-${Date.now()}`, time: getTimeStr(), type, message };
    setLogs((prev) => [newLog, ...prev.slice(0, 29)]);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      status: 'To Do',
      updatedAt: getTimeStr(),
    };
    setTasks((prev) => [item, ...prev]);
    addLog('NEW', `[${newCategory}] Menambahkan: "${newTitle.trim()}"`);
    setNewTitle('');
    showToast('Task baru berhasil ditambahkan!');
  };

  const cycleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const curIdx = STATUS_ORDER.indexOf(t.status);
        const nextStatus = STATUS_ORDER[(curIdx + 1) % STATUS_ORDER.length]!;
        addLog(nextStatus === 'Done' ? 'DONE' : nextStatus === 'In Progress' ? 'ACTIVE' : 'RESET', `"${t.title}" berubah: ${t.status} ➔ ${nextStatus}`);
        return { ...t, status: nextStatus, updatedAt: getTimeStr() };
      })
    );
  };

  const deleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addLog('DELETE', `Menghapus: "${target.title}"`);
    showToast('Task berhasil dihapus');
  };

  const handleExportMarkdown = () => {
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const done = tasks.filter((t) => t.status === 'Done').length;
    const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    let md = `# 📊 Project Progress & Signal Report\n`;
    md += `**Tanggal:** ${today}\n`;
    md += `**Status Otomasi:** ${AUTOMATION_MODES[modeIdx]!.label}\n`;
    md += `**Ringkasan:** ${done}/${tasks.length} Selesai (${progress}%) · ${tasks.length - done} Aktif\n\n`;
    md += `## 📋 Daftar Task & Proyek\n`;
    STATUS_ORDER.forEach((status) => {
      const group = tasks.filter((t) => t.status === status);
      if (group.length > 0) {
        md += `\n### ${status} (${group.length})\n`;
        group.forEach((t) => {
          md += `- ${status === 'Done' ? '[x]' : '[ ]'} **[${t.category}]** ${t.title}\n`;
        });
      }
    });
    md += `\n## ⚡ Log Aktivitas Terbaru\n`;
    logs.slice(0, 8).forEach((l) => {
      md += `- \`${l.time}\` **[${l.type}]** ${l.message}\n`;
    });

    navigator.clipboard.writeText(md).then(
      () => {
        addLog('EXPORT', 'Laporan Markdown disalin ke clipboard');
        showToast('Laporan Markdown disalin ke clipboard!');
      },
      () => showToast('Gagal menyalin ke clipboard')
    );
  };

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'Done').length;
  const active = total - done;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

  const filteredTasks = activeFilter === 'Semua' ? tasks : tasks.filter((t) => t.category === activeFilter);

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'Toko & Affiliate':
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Riset Produk':
        return { bg: 'rgba(249, 115, 22, 0.12)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' };
      case 'Admin & Link':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Konten Kreator':
        return { bg: 'rgba(14, 165, 233, 0.12)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' };
      case 'Web Dev':
        return { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Automation':
        return { bg: 'rgba(168, 85, 247, 0.12)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case 'Trading':
        return { bg: 'rgba(234, 179, 8, 0.12)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' };
      case 'Digital Product':
        return { bg: 'rgba(236, 72, 153, 0.12)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.2)' };
    }
  };

  const getStatusStyle = (status: TaskItem['status']) => {
    switch (status) {
      case 'Done':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', dot: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'In Progress':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', dot: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'To Do':
        return { bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1', dot: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isExpanded ? '0' : '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            padding: '10px 18px',
            borderRadius: '12px',
            backgroundColor: '#064e3b',
            color: '#a7f3d0',
            border: '1px solid #10b981',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ✓ {toast}
        </div>
      )}

      <div
        style={{
          width: isExpanded ? '100vw' : 'min(1100px, 100%)',
          height: isExpanded ? '100vh' : 'auto',
          maxHeight: isExpanded ? '100vh' : '90vh',
          backgroundColor: '#090d16',
          border: isExpanded ? 'none' : '1px solid rgba(51, 65, 85, 0.8)',
          borderRadius: isExpanded ? 0 : '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.4))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              📊
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                Project Progress & Signal Tracker
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Workspace Monitoring & Eksekusi Harian Kantor AI
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsExpanded((b) => !b)}
              title={isExpanded ? 'Kecilkan ke Window' : 'Perbesar ke Fullscreen'}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(51, 65, 85, 0.6)',
                color: '#e2e8f0',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{isExpanded ? '❐ Window' : '⛶ Expand'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportMarkdown}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📋 Export Markdown
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
                color: '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {/* Card 1 */}
            <div
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8' }}>
                Total Proyek Aktif
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>{active}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>task berjalan</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Dari total {total} item terdaftar
              </div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8' }}>
                Task Selesai Hari Ini
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#34d399' }}>{done}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    fontWeight: 600,
                  }}
                >
                  {percentage}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '999px',
                  backgroundColor: '#1e293b',
                  marginTop: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* Card 3 */}
            <div
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8' }}>
                Status Otomasi & Signal
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: AUTOMATION_MODES[modeIdx]!.color,
                    boxShadow: `0 0 10px ${AUTOMATION_MODES[modeIdx]!.color}`,
                  }}
                />
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  {AUTOMATION_MODES[modeIdx]!.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = (modeIdx + 1) % AUTOMATION_MODES.length;
                  setModeIdx(next);
                  addLog('SIGNAL', `Mode otomasi diubah ke: ${AUTOMATION_MODES[next]!.label}`);
                }}
                style={{
                  marginTop: '8px',
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  color: '#22d3ee',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Ubah mode monitor
              </button>
            </div>
          </div>

          {/* Workspace Grid: Task Board (Left) & Live Log (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Task Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Add Task Form */}
              <form
                onSubmit={handleAddTask}
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(51, 65, 85, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                  ➕ Tambah Task / Signal Baru
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Rilis promo flash sale gamis atau Deploy webhook..."
                    required
                    style={{
                      flex: '1 1 200px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#090d16',
                      border: '1px solid rgba(51, 65, 85, 0.8)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#090d16',
                      border: '1px solid rgba(51, 65, 85, 0.8)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Toko & Affiliate">Toko & Affiliate (Aktif)</option>
                    <option value="Riset Produk">Riset Produk</option>
                    <option value="Admin & Link">Admin & Link</option>
                    <option value="Konten Kreator">Konten Kreator</option>
                    <option value="Web Dev">Web Dev</option>
                    <option value="Automation">Automation</option>
                    <option value="Trading">Trading</option>
                    <option value="Digital Product">Digital Product</option>
                  </select>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontWeight: 700,
                      border: 'none',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    + Tambah
                  </button>
                </div>
              </form>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CATEGORIES.map((cat) => {
                  const isActive = cat === activeFilter;
                  const count = cat === 'Semua' ? tasks.length : tasks.filter((t) => t.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveFilter(cat)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: isActive ? '1px solid #6366f1' : '1px solid rgba(51, 65, 85, 0.6)',
                        backgroundColor: isActive ? '#4f46e5' : 'rgba(15, 23, 42, 0.7)',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{cat}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(30, 41, 59, 0.8)',
                          color: '#ffffff',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Task List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
                {filteredTasks.length === 0 ? (
                  <div
                    style={{
                      padding: '30px',
                      textAlign: 'center',
                      borderRadius: '14px',
                      border: '1px dashed rgba(51, 65, 85, 0.7)',
                      color: '#64748b',
                      fontSize: '13px',
                    }}
                  >
                    Belum ada task di kategori ini.
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const catStyle = getBadgeStyle(task.category);
                    const statStyle = getStatusStyle(task.status);
                    const isDone = task.status === 'Done';

                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: '14px',
                          borderRadius: '14px',
                          backgroundColor: 'rgba(15, 23, 42, 0.75)',
                          border: `1px solid ${statStyle.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: catStyle.bg,
                                color: catStyle.text,
                                border: `1px solid ${catStyle.border}`,
                              }}
                            >
                              {task.category}
                            </span>
                            <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                              {task.updatedAt}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '13px',
                              fontWeight: 500,
                              color: isDone ? '#64748b' : '#f8fafc',
                              textDecoration: isDone ? 'line-through' : 'none',
                              lineHeight: 1.4,
                            }}
                          >
                            {task.title}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => cycleStatus(task.id)}
                            title="Klik untuk ubah status"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: `1px solid ${statStyle.border}`,
                              backgroundColor: statStyle.bg,
                              color: statStyle.text,
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span
                              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statStyle.dot }}
                            />
                            <span>{task.status}</span>
                            <span style={{ opacity: 0.6 }}>➔</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            title="Hapus task"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Signal Feed Section */}
            <div
              style={{
                borderRadius: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '480px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚡</span>
                  <span>Live Signal & Activity Log</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const clearLog = [{ id: `log-${Date.now()}`, time: getTimeStr(), type: 'SYSTEM', message: 'Riwayat log dibersihkan.' }];
                    setLogs(clearLog);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Bersihkan
                </button>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              >
                {logs.map((log) => {
                  let typeColor = '#38bdf8';
                  if (log.type === 'DONE') typeColor = '#34d399';
                  if (log.type === 'NEW') typeColor = '#818cf8';
                  if (log.type === 'DELETE') typeColor = '#fb7185';
                  if (log.type === 'SIGNAL') typeColor = '#fbbf24';

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(51, 65, 85, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span style={{ color: typeColor, fontWeight: 'bold' }}>[{log.type}]</span>
                        <span>{log.time}</span>
                      </div>
                      <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>{log.message}</div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(51, 65, 85, 0.6)',
                  fontSize: '11px',
                  color: '#64748b',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Auto-save aktif (LocalStorage)</span>
                <span style={{ color: '#818cf8' }}>Siap ekspor .md</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
