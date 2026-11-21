/** Data gaya untuk pemilih & README (tanpa three.js, jadi ringan dimuat di App). Pembangunnya ada di src/gaya/<id>.ts. */
import type { InfoGaya } from './tipe';

export const DAFTAR_GAYA = [
  {
    id: 'asli',
    nama: 'Asli',
    jenis: 'asli',
    ket: 'Gaya bawaan: bentuk sederhana, warna hangat, paling ringan.',
  },
  {
    id: 'vinyl',
    nama: 'Vinyl (chibi)',
    jenis: 'menyeluruh',
    ket: 'Mainan vinyl mengilap: kepala besar, sudut bulat, warna permen.',
    latar: { siang: 'linear-gradient(160deg, #ffd6e8, #d8e6ff 55%, #d6fff1)', malam: 'linear-gradient(160deg, #3a1a40, #141a3a 55%, #0e2a2a)' },
  },
  {
    id: 'kayu',
    nama: 'Balok kayu',
    jenis: 'menyeluruh',
    ket: 'Mainan balok kayu: serat kayu, cat pudar, agen boneka pasak.',
    latar: { siang: 'radial-gradient(130% 90% at 50% 15%, #f6ecdc 0%, #ede2cf 60%, #dccaa8 100%)', malam: '' },
  },
  {
    id: 'stickman',
    nama: 'Stickman',
    jenis: 'menyeluruh',
    ket: 'Gambar garis 3D: dunia putih bergaris tinta, agen batang tipis.',
    latar: { siang: '#f6f6f4', malam: 'radial-gradient(130% 90% at 50% 15%, #2a2a30 0%, #121216 100%)' },
  },
  {
    id: 'pulau',
    nama: 'Pulau melayang',
    jenis: 'paduan',
    ket: 'Kantor di atas pulau melayang, laut pastel, awan.',
    latar: { siang: 'linear-gradient(#bfe6ff, #ffe1ee)', malam: 'linear-gradient(#141a40, #3a2050)' },
  },
  {
    id: 'toko',
    nama: 'Toko di trotoar',
    jenis: 'paduan',
    ket: 'Lukisan tangan + kantor jadi toko di pinggir jalan, papan nama, lampu jalan.',
    latar: { siang: 'linear-gradient(#f6c58a, #f3e2c0)', malam: 'linear-gradient(#1a1430, #3a2440)' },
  },
  {
    id: 'menara',
    nama: 'Menara neon',
    jenis: 'paduan',
    ket: 'Neon malam + kantor di puncak bangunan bertumpuk, tangga zigzag, papan AGEN.',
    latar: { siang: 'radial-gradient(130% 90% at 50% 20%, #1a0b33 0%, #05030f 70%)', malam: 'radial-gradient(130% 90% at 50% 20%, #1a0b33 0%, #05030f 70%)' },
    malam: true,
  },
  {
    id: 'taman',
    nama: 'Paviliun taman',
    jenis: 'paduan',
    ket: 'Low-poly + kantor jadi paviliun di taman: kolam, jembatan, pergola, cemara.',
    latar: { siang: 'linear-gradient(#cfe8e4, #eef6e8)', malam: 'linear-gradient(#0e1a2a, #1a2a30)' },
  },
  {
    id: 'gedung30',
    nama: 'Gedung 30 lantai',
    jenis: 'paduan',
    ket: 'Kantor di lantai 13 gedung 30 lantai, beberapa lantai dibuka (cutaway).',
    latar: { siang: 'linear-gradient(#5b6fc8, #ffb47a)', malam: 'linear-gradient(#0a0f2a, #2a1a40)' },
  },
  {
    id: 'hologram',
    nama: 'Hologram malam',
    jenis: 'paduan',
    ket: 'Blueprint malam: lantai grid cyan, dinding kaca, tepi garis cahaya, Mission Board hologram, partikel data.',
    latar: { siang: 'radial-gradient(130% 90% at 50% 20%, #0a1a33 0%, #03060d 70%)', malam: 'radial-gradient(130% 90% at 50% 20%, #0a1a33 0%, #03060d 70%)' },
    malam: true,
  },
  {
    id: 'angkringan',
    nama: 'Angkringan Malam',
    jenis: 'paduan',
    ket: 'Kaki lima malam: tikar lesehan, gerobak beratap terpal, tungku arang & ceret, untaian bohlam kuning, motor parkir.',
    latar: { siang: 'linear-gradient(#141a33, #2a2030)', malam: 'linear-gradient(#141a33, #2a2030)' },
    malam: true,
  },
] as const satisfies readonly InfoGaya[];

export type GayaId = (typeof DAFTAR_GAYA)[number]['id'];

export const cariGaya = (id: string | null | undefined): InfoGaya => DAFTAR_GAYA.find((g) => g.id === id) ?? DAFTAR_GAYA[0];
export const adaGaya = (id: string | null | undefined): id is GayaId => !!id && DAFTAR_GAYA.some((g) => g.id === id);

/** Urutan: ?gaya=<id> di URL, lalu pilihan terakhir (localStorage), lalu `GAYA` di config. */
export function gayaAwal(url: string | null, simpanan: string | null, bawaan: string): GayaId {
  if (adaGaya(url)) return url;
  if (adaGaya(simpanan)) return simpanan;
  return adaGaya(bawaan) ? bawaan : 'asli';
}

export const KUNCI_SIMPAN = 'kantor-ai-gaya';
