/**
/**
 * Karakter 2D Cantik & Ekspresif untuk Kantor AI 3D.
 * Menghasilkan sprite karakter 2D gaya chibi/anime beresolusi tinggi langsung dari HTML5 Canvas
 * (100% tanpa model eksternal, ringan di HP, ramah performa).
 */
import {
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import type { DeskState } from './office';

export type PoseKarakter = 'duduk_kerja' | 'duduk_santai' | 'berdiri' | 'jalan';

interface KarakterArtConfig {
  nama: string;
  peran: string;
  warnaBaju: string;
  warnaKulit: string;
  warnaRambut: string;
  tipeRambut: 'lou' | 'rouse' | 'youna' | 'umum';
  warnaMata: string;
}

const KONFIG_AGEN: Record<string, KarakterArtConfig> = {
  riset: {
    nama: 'Lou',
    peran: 'Riset',
    warnaBaju: '#e4572e',
    warnaKulit: '#fdedd8',
    warnaRambut: '#543310',
    tipeRambut: 'lou',
    warnaMata: '#743a18',
  },
  admin: {
    nama: 'Rouse',
    peran: 'Admin',
    warnaBaju: '#f2b134',
    warnaKulit: '#fceddd',
    warnaRambut: '#caa04d', // warna hijab elegan
    tipeRambut: 'rouse',
    warnaMata: '#3d2b1f',
  },
  konten: {
    nama: 'Youna',
    peran: 'Konten',
    warnaBaju: '#3a86ff',
    warnaKulit: '#fff1e6',
    warnaRambut: '#1e293b',
    tipeRambut: 'youna',
    warnaMata: '#1d4ed8',
  },
};

/**
 * Menggambar ilustrasi karakter 2D ke canvas 256x384.
 */
export function gambarKarakter2D(
  key: string,
  pose: PoseKarakter,
  blink = false,
  fase = 0
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const cfg = KONFIG_AGEN[key] || {
    nama: key,
    peran: 'Staf',
    warnaBaju: '#6366f1',
    warnaKulit: '#fdedd8',
    warnaRambut: '#2b1d16',
    tipeRambut: 'umum',
    warnaMata: '#312e81',
  };

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  // Bayangan kaki di lantai
  ctx.fillStyle = 'rgba(20, 15, 35, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, 350, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  const isDuduk = pose.startsWith('duduk');
  const isJalan = pose === 'jalan';
  const isKerja = pose === 'duduk_kerja';

  // --- 1. BADAN & BAJU ---
  const badanY = isDuduk ? 210 : 195;
  const badanH = isDuduk ? 95 : 120;

  // Celana / Rok
  if (isDuduk) {
    ctx.fillStyle = '#1e1b4b'; // celana gelap rapi
    ctx.beginPath();
    ctx.roundRect(cx - 36, badanY + 60, 72, 45, 12);
    ctx.fill();

    // Sepatu duduk
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx - 24, badanY + 110, 14, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 24, badanY + 110, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Kaki berdiri/jalan
    const swingL = isJalan ? Math.sin(fase) * 16 : 0;
    const swingR = isJalan ? -Math.sin(fase) * 16 : 0;

    ctx.fillStyle = '#1e1b4b';
    // Kaki kiri
    ctx.beginPath();
    ctx.roundRect(cx - 28 + swingL * 0.3, badanY + 65, 22, 65, 8);
    ctx.fill();
    // Kaki kanan
    ctx.beginPath();
    ctx.roundRect(cx + 6 + swingR * 0.3, badanY + 65, 22, 65, 8);
    ctx.fill();

    // Sepatu
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - 17 + swingL * 0.4, badanY + 130, 16, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 17 + swingR * 0.4, badanY + 130, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 25 + swingL * 0.4, badanY + 130, 16, 5);
    ctx.fillRect(cx + 9 + swingR * 0.4, badanY + 130, 16, 5);
  }

  // Baju Atasan / Blazer
  ctx.fillStyle = cfg.warnaBaju;
  ctx.beginPath();
  ctx.roundRect(cx - 38, badanY, 76, badanH - 30, 16);
  ctx.fill();

  // Kemeja dalam putih
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx - 14, badanY);
  ctx.lineTo(cx, badanY + 32);
  ctx.lineTo(cx + 14, badanY);
  ctx.closePath();
  ctx.fill();

  // Dasi / Aksen kerah
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(cx - 4, badanY + 12);
  ctx.lineTo(cx + 4, badanY + 12);
  ctx.lineTo(cx + 6, badanY + 36);
  ctx.lineTo(cx, badanY + 44);
  ctx.lineTo(cx - 6, badanY + 36);
  ctx.closePath();
  ctx.fill();

  // ID Card / Lanyard
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 16, badanY);
  ctx.lineTo(cx - 6, badanY + 42);
  ctx.moveTo(cx + 16, badanY);
  ctx.lineTo(cx - 6, badanY + 42);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 12, badanY + 42, 12, 16);
  ctx.fillStyle = cfg.warnaBaju;
  ctx.fillRect(cx - 10, badanY + 44, 8, 4);

  // Lengan & Tangan
  const armOffset = isKerja ? Math.sin(fase * 2) * 4 : 0;
  ctx.fillStyle = cfg.warnaBaju;

  if (isKerja) {
    // Tangan di atas meja (mengetik)
    ctx.beginPath();
    ctx.ellipse(cx - 42, badanY + 28 + armOffset, 12, 22, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + 42, badanY + 28 - armOffset, 12, 22, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Telapak tangan lucu
    ctx.fillStyle = cfg.warnaKulit;
    ctx.beginPath();
    ctx.ellipse(cx - 36, badanY + 46 + armOffset, 9, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 36, badanY + 46 - armOffset, 9, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Tangan santai
    ctx.beginPath();
    ctx.ellipse(cx - 42, badanY + 32, 10, 26, 0.15, 0, Math.PI * 2);
    ctx.ellipse(cx + 42, badanY + 32, 10, 26, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cfg.warnaKulit;
    ctx.beginPath();
    ctx.ellipse(cx - 44, badanY + 56, 8, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 44, badanY + 56, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 2. KEPALA & WAJAH (Chibi Style) ---
  const kepalaY = badanY - 78;
  const kepalaR = 64;

  // Rambut Belakang / Hijab Belakang
  if (cfg.tipeRambut === 'rouse') {
    // Hijab anggun membalut kepala & bahu
    ctx.fillStyle = cfg.warnaRambut;
    ctx.beginPath();
    ctx.ellipse(cx, kepalaY + 12, 70, 78, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Rambut belakang biasa
    ctx.fillStyle = cfg.warnaRambut;
    ctx.beginPath();
    ctx.ellipse(cx, kepalaY - 4, 68, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    if (cfg.tipeRambut === 'youna') {
      // Twin bun lucu di kiri kanan
      ctx.beginPath();
      ctx.arc(cx - 62, kepalaY - 34, 20, 0, Math.PI * 2);
      ctx.arc(cx + 62, kepalaY - 34, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Wajah (Kulit)
  ctx.fillStyle = cfg.warnaKulit;
  ctx.beginPath();
  if (cfg.tipeRambut === 'rouse') {
    // Bentuk wajah oval dalam hijab
    ctx.ellipse(cx, kepalaY + 4, 46, 52, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(cx, kepalaY + 4, 56, 56, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Pipi Merona (Blush)
  ctx.fillStyle = 'rgba(255, 120, 150, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx - 30, kepalaY + 22, 12, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 30, kepalaY + 22, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rambut Depan / Ponytail / Layer Hijab
  if (cfg.tipeRambut === 'rouse') {
    // Lipatan anggun hijab depan
    ctx.fillStyle = cfg.warnaRambut;
    ctx.beginPath();
    ctx.moveTo(cx - 48, kepalaY - 26);
    ctx.quadraticCurveTo(cx, kepalaY - 40, cx + 48, kepalaY - 26);
    ctx.quadraticCurveTo(cx + 46, kepalaY - 14, cx, kepalaY - 8);
    ctx.quadraticCurveTo(cx - 46, kepalaY - 14, cx - 48, kepalaY - 26);
    ctx.fill();

    // Bros/Aksen hijab kecil berkilau
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx + 34, kepalaY + 34, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Poni rambut anime
    ctx.fillStyle = cfg.warnaRambut;
    ctx.beginPath();
    ctx.moveTo(cx - 60, kepalaY - 12);
    ctx.quadraticCurveTo(cx - 40, kepalaY - 56, cx, kepalaY - 56);
    ctx.quadraticCurveTo(cx + 40, kepalaY - 56, cx + 60, kepalaY - 12);
    // Gerigi poni
    ctx.lineTo(cx + 48, kepalaY + 6);
    ctx.lineTo(cx + 32, kepalaY - 16);
    ctx.lineTo(cx + 12, kepalaY + 8);
    ctx.lineTo(cx - 6, kepalaY - 18);
    ctx.lineTo(cx - 28, kepalaY + 6);
    ctx.lineTo(cx - 48, kepalaY - 16);
    ctx.closePath();
    ctx.fill();

    // Kilau rambut (Highlight)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, kepalaY - 28, 38, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }

  // --- 3. MATA & EKSPRESI ---
  if (blink) {
    // Mata berkedip senang (^_^)
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - 24, kepalaY + 8, 11, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 24, kepalaY + 8, 11, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  } else {
    // Mata besar anime berbinar
    const eyeY = kepalaY + 8;
    const eyeR = 12;

    // Pupil kiri & kanan
    for (const ex of [cx - 24, cx + 24]) {
      // Putih mata
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeR, eyeR * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris berwarna
      const grad = ctx.createLinearGradient(ex, eyeY - 12, ex, eyeY + 14);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, cfg.warnaMata);
      grad.addColorStop(1, '#93c5fd');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeR - 2, eyeR * 1.2 - 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Kilau cahaya utama (Sparkle)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - 3, eyeY - 5, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 3, eyeY + 4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Bulu mata atas
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex, eyeY - 4, eyeR + 1, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
  }

  // Alis manis
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx - 24, kepalaY - 8, 12, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 24, kepalaY - 8, 12, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Senyum ramah
  ctx.strokeStyle = '#dc2626';
  ctx.fillStyle = '#fca5a5';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, kepalaY + 25, 7, 0, Math.PI);
  ctx.stroke();

  // Kacamata Lou (Riset)
  if (cfg.tipeRambut === 'lou') {
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    // Frame kacamata kiri & kanan
    ctx.strokeRect(cx - 36, kepalaY - 4, 24, 20);
    ctx.strokeRect(cx + 12, kepalaY - 4, 24, 20);
    // Jembatan kacamata
    ctx.beginPath();
    ctx.moveTo(cx - 12, kepalaY + 4);
    ctx.lineTo(cx + 12, kepalaY + 4);
    ctx.stroke();
    // Kilau lensa kacamata
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 30, kepalaY);
    ctx.lineTo(cx - 20, kepalaY + 12);
    ctx.stroke();
  }

  // Headphone / Headset Youna (Konten)
  if (cfg.tipeRambut === 'youna') {
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, kepalaY - 14, 52, Math.PI * 0.9, Math.PI * 0.1, false);
    ctx.stroke();

    // Busa earphone
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.roundRect(cx - 56, kepalaY + 2, 12, 22, 6);
    ctx.roundRect(cx + 44, kepalaY + 2, 12, 22, 6);
    ctx.fill();
  }

  // Label nama mini di atas
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.beginPath();
  ctx.roundRect(cx - 42, 12, 84, 22, 11);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${cfg.nama} (${cfg.peran})`, cx, 23);

  ctx.restore();
  return canvas;
}

/**
 * Cache Texture agar efisien dan tidak mengalokasikan ulang tiap frame.
 */
class KarakterTextureCache {
  private cache = new Map<string, CanvasTexture>();

  getTexture(key: string, pose: PoseKarakter, blink = false): CanvasTexture {
    const id = `${key}_${pose}_${blink ? '1' : '0'}`;
    let tex = this.cache.get(id);
    if (!tex) {
      const c = gambarKarakter2D(key, pose, blink);
      tex = new CanvasTexture(c);
      tex.colorSpace = SRGBColorSpace;
      this.cache.set(id, tex);
    }
    return tex;
  }

  dispose() {
    this.cache.forEach((t) => t.dispose());
    this.cache.clear();
  }
}

export const textureCache2D = new KarakterTextureCache();

/**
 * Membuat sprite 2D billboard untuk seorang agen.
 */
export function buatKarakter2DSprite(key: string): Sprite {
  const tex = textureCache2D.getTexture(key, 'duduk_kerja', false);
  const mat = new SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });

  const sprite = new Sprite(mat);
  // Ukuran sprite proporsional (tinggi ~1.65 meter)
  sprite.scale.set(1.1, 1.65, 1);
  // Anchor di bawah (kaki)
  sprite.center.set(0.5, 0.12);
  return sprite;
}
