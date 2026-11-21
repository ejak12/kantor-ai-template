/** Pembangun gaya 3D aktif + gaya asli (dimuat bersama scene 3D). Data gaya untuk UI: ./daftar. */
import { asli } from './asli';
import { vinyl } from './vinyl';
import { kayu } from './kayu';
import { stickman } from './stickman';
import { pulau } from './pulau';
import { toko } from './toko';
import { menara } from './menara';
import { taman } from './taman';
import { gedung30 } from './gedung30';
import { hologram } from './hologram';
import { angkringan } from './angkringan';
import type { GayaId } from './daftar';
import type { Kit } from './alat';
import type { PembangunGaya } from './tipe';

const PEMBANGUN: Record<GayaId, PembangunGaya> = {
  asli,
  vinyl,
  kayu,
  stickman,
  pulau,
  toko,
  menara,
  taman,
  gedung30,
  hologram,
  angkringan,
};

export const buatKitGaya = (id: string | null | undefined): Kit => (PEMBANGUN[id as GayaId] ?? asli).buat();
