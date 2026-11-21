---
name: core-agent
description: Core Skills (Otak & Memori Agent) — tiga kemampuan inti agar agent bisa mengingat status proyek lintas sesi, memecah perintah menjadi sub-task terstruktur, dan selalu menghasilkan output JSON/webhook yang siap ditangkap dashboard otomatis.
---

# Skill: Core Agent (Otak & Memori Agent)

## Tujuan
Membuat agent bekerja layaknya asisten bisnis nyata: **ingat konteks**, **prioritaskan pekerjaan sendiri**, dan **keluarkan data terstruktur** yang langsung bisa dipakai sistem otomasi (dashboard, n8n, Laravel, Notion, Google Sheets).

---

## Sub-skill 1 — Persistent Memory & State Management

### Tujuan
Agent selalu tahu status terkini setiap proyek/task tanpa lupa setelah sesi chat berakhir, karena state disimpan di sumber eksternal (database / spreadsheet / API).

### Aturan Kerja
1. **Baca state sebelum mulai:** setiap sesi dimulai dengan menarik data terbaru dari sumber memori (Notion, Google Sheets, endpoint `/api/tasks`, dsb.) — jangan berasumsi dari memori chat sebelumnya.
2. **Tulis balik setiap ada perubahan:** setiap task yang berpindah status (misalnya `todo → in_progress → done`) langsung di-PATCH/update ke sumber memori yang sama.
3. **Format state wajib konsisten:**
   ```json
   {
     "task_id": "string",
     "judul": "string",
     "status": "todo | in_progress | done | blocked",
     "prioritas": "tinggi | sedang | rendah",
     "tenggat": "YYYY-MM-DD",
     "catatan": "string | null",
     "diperbarui": "ISO 8601 timestamp"
   }
   ```
4. **Jangan duplikat task:** sebelum membuat entri baru, cek apakah task serupa sudah ada berdasarkan `judul` atau `task_id`.
5. **Privasi:** jangan sertakan nominal uang sensitif atau kredensial API di dalam field `catatan` yang muncul di laporan publik.

### Integrasi yang Didukung
| Platform | Metode |
|---|---|
| Google Sheets | Google Sheets API v4 / n8n node |
| Notion | Notion API (database query + patch page) |
| Laravel | REST `GET /api/tasks`, `PATCH /api/tasks/{id}` |
| n8n | Webhook trigger + Set node |

---

## Sub-skill 2 — Task Routing & Prioritization

### Tujuan
Agent mampu memecah perintah umum ("siapkan promo malam ini") menjadi sub-task spesifik, memasukkannya ke kategori yang tepat, dan menetapkan tenggat serta prioritas secara otomatis.

### Aturan Kerja
1. **Pecah dulu, kerjakan belakangan:** setiap perintah umum wajib dipecah menjadi ≥2 sub-task konkret sebelum dieksekusi.
2. **Gunakan template routing:**
   ```
   Perintah masuk → Identifikasi kategori → Buat sub-task → Tetapkan prioritas & tenggat → Simpan ke memori
   ```
3. **Kategori standar:**
   - `konten` — pembuatan/editing konten, copy, hook
   - `operasional` — koordinasi tim, jadwal, pengiriman
   - `keuangan` — anggaran, tagihan, komisi
   - `teknis` — integrasi API, bug, deploy
   - `riset` — riset produk, kompetitor, tren
4. **Prioritas otomatis berdasarkan kata kunci:**
   - Kata "malam ini / hari ini / urgent / segera" → `tinggi`
   - Kata "minggu ini / sebelum X" → `sedang`
   - Tidak ada tenggat eksplisit → `rendah`, tanya konfirmasi
5. **Output routing selalu dalam format JSON** (lihat Sub-skill 3).
6. **Jangan asumsikan siapa yang mengerjakan** jika tidak disebutkan — tanya atau tulis `assignee: null`.

### Contoh Decomposition
**Input:** `"siapkan promo malam ini"`

**Output sub-task:**
```json
[
  { "judul": "Buat copy promo (hook + CTA)", "kategori": "konten", "prioritas": "tinggi", "tenggat": "hari-ini" },
  { "judul": "Siapkan visual/banner promo", "kategori": "konten", "prioritas": "tinggi", "tenggat": "hari-ini" },
  { "judul": "Jadwalkan posting / blast pesan", "kategori": "operasional", "prioritas": "tinggi", "tenggat": "hari-ini" },
  { "judul": "Cek stok / link afiliasi aktif", "kategori": "teknis", "prioritas": "sedang", "tenggat": "hari-ini" }
]
```

---

## Sub-skill 3 — Structured Output (JSON / Webhook Trigger)

### Tujuan
Setiap kali agent membuat task, mencatat log, atau melaporkan status — output selalu dalam format JSON rapi yang siap ditangkap otomatis oleh dashboard UI, n8n workflow, atau endpoint Laravel.

### Aturan Kerja
1. **Selalu keluarkan JSON valid** — tidak ada teks bebas di luar blok JSON jika tujuannya adalah otomasi.
2. **Schema log harian:**
   ```json
   {
     "timestamp": "ISO 8601",
     "agent": "nama-agent",
     "aksi": "buat_task | update_status | kirim_laporan | trigger_webhook",
     "payload": { ... },
     "status_respons": "sukses | gagal | menunggu",
     "pesan": "deskripsi singkat"
   }
   ```
3. **Schema webhook trigger** (ke n8n / endpoint eksternal):
   ```json
   {
     "event": "task.created | task.updated | task.done | alert.urgent",
     "task_id": "string",
     "judul": "string",
     "prioritas": "tinggi | sedang | rendah",
     "tenggat": "YYYY-MM-DD",
     "assignee": "nama | null",
     "url_detail": "https://... | null",
     "dikirim_pada": "ISO 8601"
   }
   ```
4. **Trigger otomatis saat:**
   - Task baru dibuat → kirim ke webhook `task.created`
   - Task berubah ke `done` → kirim ke `task.done`
   - Ada task prioritas `tinggi` yang tenggat < 2 jam → kirim `alert.urgent`
5. **Jangan kirim data sensitif** (nominal uang, password, token API) di dalam payload webhook yang bisa dibaca di log publik.

---

## Format Output ke `src/laporan.json`
- **Ringkasan:** berapa task aktif, berapa done hari ini, dan apakah ada yang blocked.
- **Menunggu / Mendesak:** task prioritas `tinggi` yang belum dimulai atau mendekati tenggat.
- **Angka Hari Ini:** jumlah task dibuat, jumlah task selesai, jumlah webhook terkirim.
