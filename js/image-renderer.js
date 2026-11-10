/**
 * Studio Hardware Image Generator
 * สร้างภาพสินค้าคอมพิวเตอร์แบบ Studio Vector Illustration เฉพาะตัวสำหรับสินค้าแต่ละรุ่น (ครบทั้ง 50 ชิ้น)
 * รองรับทั้งการแสดงผลแบบการ์ด ตาราง และหน้ารายละเอียดสินค้าโดยไม่มีทางภาพเสีย (Zero Broken Images)
 */

const BRAND_THEMES = {
  'Intel': { primary: '#0068B5', secondary: '#00C7FD', accent: '#E0F2FE', badgeBg: '#0068B5' },
  'AMD': { primary: '#ED1C24', secondary: '#FF6B00', accent: '#FEE2E2', badgeBg: '#1F2937' },
  'ASUS ROG': { primary: '#E11D48', secondary: '#9333EA', accent: '#FCE7F3', badgeBg: '#111827' },
  'ASUS TUF': { primary: '#F59E0B', secondary: '#78716C', accent: '#FEF3C7', badgeBg: '#1C1917' },
  'MSI': { primary: '#DC2626', secondary: '#4B5563', accent: '#FEE2E2', badgeBg: '#18181B' },
  'GIGABYTE': { primary: '#F97316', secondary: '#0EA5E9', accent: '#FFEDD5', badgeBg: '#0F172A' },
  'GALAX': { primary: '#6366F1', secondary: '#EC4899', accent: '#E0E7FF', badgeBg: '#1E1B4B' },
  'SAPPHIRE': { primary: '#2563EB', secondary: '#38BDF8', accent: '#DBEAFE', badgeBg: '#1E3A8A' },
  'PowerColor': { primary: '#DC2626', secondary: '#991B1B', accent: '#FEE2E2', badgeBg: '#09090B' },
  'ASRock': { primary: '#0284C7', secondary: '#64748B', accent: '#E0F2FE', badgeBg: '#0F172A' },
  'Kingston': { primary: '#DC2626', secondary: '#111827', accent: '#FEE2E2', badgeBg: '#111827' },
  'Corsair': { primary: '#EAB308', secondary: '#1F2937', accent: '#FEF9C3', badgeBg: '#111827' },
  'G.SKILL': { primary: '#EF4444', secondary: '#8B5CF6', accent: '#FEE2E2', badgeBg: '#18181B' },
  'KLEVV': { primary: '#38BDF8', secondary: '#818CF8', accent: '#E0F2FE', badgeBg: '#0F172A' },
  'Samsung': { primary: '#1D4ED8', secondary: '#EF4444', accent: '#DBEAFE', badgeBg: '#111827' },
  'WD_BLACK': { primary: '#F97316', secondary: '#18181B', accent: '#FFEDD5', badgeBg: '#09090B' },
  'Crucial': { primary: '#0284C7', secondary: '#334155', accent: '#E0F2FE', badgeBg: '#0F172A' },
  'Seagate': { primary: '#16A34A', secondary: '#DC2626', accent: '#DCFCE7', badgeBg: '#14532D' },
  'Thermaltake': { primary: '#EF4444', secondary: '#3B82F6', accent: '#FEE2E2', badgeBg: '#1F2937' },
  'Seasonic': { primary: '#D97706', secondary: '#1F2937', accent: '#FEF3C7', badgeBg: '#111827' },
  'NZXT': { primary: '#7C3AED', secondary: '#EC4899', accent: '#F3E8FF', badgeBg: '#2E1065' },
  'DeepCool': { primary: '#0D9488', secondary: '#14B8A6', accent: '#CCFBF1', badgeBg: '#134E4A' },
  'Lian Li': { primary: '#3B82F6', secondary: '#94A3B8', accent: '#DBEAFE', badgeBg: '#1E293B' },
  'Fractal Design': { primary: '#B45309', secondary: '#374151', accent: '#FEF3C7', badgeBg: '#1F2937' },
  'Montech': { primary: '#6366F1', secondary: '#06B6D4', accent: '#E0E7FF', badgeBg: '#1E1B4B' },
  'LG': { primary: '#E11D48', secondary: '#8B5CF6', accent: '#FFE4E6', badgeBg: '#1F2937' },
  'Dell': { primary: '#0284C7', secondary: '#38BDF8', accent: '#E0F2FE', badgeBg: '#0C4A6E' },
  'AOC': { primary: '#DC2626', secondary: '#F97316', accent: '#FEE2E2', badgeBg: '#18181B' },
  'Apple': { primary: '#334155', secondary: '#94A3B8', accent: '#F1F5F9', badgeBg: '#0F172A' },
  'Lenovo': { primary: '#E11D48', secondary: '#06B6D4', accent: '#FFE4E6', badgeBg: '#111827' },
  'Logitech G': { primary: '#00B8FC', secondary: '#3B82F6', accent: '#E0F2FE', badgeBg: '#0F172A' },
  'Razer': { primary: '#22C55E', secondary: '#10B981', accent: '#DCFCE7', badgeBg: '#052E16' },
  'HyperX': { primary: '#EF4444', secondary: '#B91C1C', accent: '#FEE2E2', badgeBg: '#18181B' },
  'APC': { primary: '#DC2626', secondary: '#374151', accent: '#FEE2E2', badgeBg: '#111827' }
};

function escapeSvgText(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getHardwareArtwork(product, theme) {
  const cat = product.category;
  const sub = product.subType || '';
  const p = theme.primary;
  const s = theme.secondary;
  const uid = product.id.replace(/[^a-zA-Z0-9]/g, '');

  switch (cat) {
    case 'CPU': {
      const isAMD = product.brand.includes('AMD');
      return `
        <!-- Retail Packaging Box in background -->
        <rect x="65" y="42" width="125" height="135" rx="8" fill="url(#gradBox_${uid})" stroke="${p}" stroke-width="1.5" opacity="0.9"/>
        <path d="M65 72 L190 52 L190 95 L65 115 Z" fill="${s}" opacity="0.22"/>
        <text x="80" y="70" fill="#ffffff" font-family="Inter, sans-serif" font-weight="800" font-size="13" letter-spacing="0.5">${escapeSvgText(product.brand)}</text>
        <text x="80" y="158" fill="#E2E8F0" font-family="JetBrains Mono, monospace" font-weight="700" font-size="11">${escapeSvgText(product.shortModel || '')}</text>
        <!-- Processor Chip Foreground -->
        <g transform="translate(145, 76)">
          <rect x="0" y="0" width="96" height="96" rx="8" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
          <!-- Gold contacts border -->
          <rect x="5" y="5" width="86" height="86" rx="5" fill="#0F172A" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3 2"/>
          <!-- Integrated Heat Spreader (IHS) -->
          <rect x="14" y="14" width="68" height="68" rx="${isAMD ? '10' : '4'}" fill="url(#ihs_${uid})" stroke="#CBD5E1" stroke-width="1.5"/>
          ${isAMD ? `
            <rect x="10" y="28" width="6" height="10" fill="#1E293B"/>
            <rect x="80" y="28" width="6" height="10" fill="#1E293B"/>
            <rect x="28" y="10" width="10" height="6" fill="#1E293B"/>
            <rect x="58" y="10" width="10" height="6" fill="#1E293B"/>
          ` : `
            <circle cx="22" cy="74" r="2.5" fill="#F59E0B"/>
          `}
          <text x="48" y="43" text-anchor="middle" fill="#0F172A" font-family="Inter, sans-serif" font-weight="900" font-size="10">${isAMD ? 'RYZEN' : 'INTEL CORE'}</text>
          <text x="48" y="57" text-anchor="middle" fill="${p}" font-family="JetBrains Mono, monospace" font-weight="800" font-size="9.5">${escapeSvgText(product.chipLabel || '')}</text>
          <text x="48" y="69" text-anchor="middle" fill="#475569" font-family="JetBrains Mono, monospace" font-size="6.5">DIFFUSED IN USA</text>
        </g>
      `;
    }

    case 'GPU': {
      const dualFan = (product.shortModel || '').includes('4060') || (product.shortModel || '').includes('7800');
      return `
        <!-- PCIe Gold Finger -->
        <rect x="75" y="166" width="95" height="9" rx="2" fill="#F59E0B"/>
        <line x1="95" y1="166" x2="95" y2="175" stroke="#0F172A" stroke-width="2"/>
        <!-- I/O Bracket -->
        <path d="M44 58 L54 58 L54 176 L48 176 L48 64 L44 64 Z" fill="#94A3B8"/>
        <!-- GPU Backplate & Shroud -->
        <rect x="52" y="66" width="208" height="102" rx="10" fill="url(#gradBox_${uid})" stroke="#475569" stroke-width="2"/>
        <!-- RGB Accent Strips -->
        <path d="M62 72 L130 72 L142 82 L248 82" stroke="url(#rgb_${uid})" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M62 160 L165 160 L177 150 L248 150" stroke="url(#rgb_${uid})" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Heatsink fins top edge -->
        <rect x="64" y="60" width="184" height="6" rx="2" fill="#334155"/>
        <!-- Cooling Fans -->
        ${dualFan ? `
          <g transform="translate(108, 117)">
            <circle r="36" fill="#09090B" stroke="${p}" stroke-width="2"/>
            <circle r="31" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="6 4"/>
            <path d="M0 0 L-14 -28 M0 0 L24 -20 M0 0 L30 10 M0 0 L8 30 M0 0 L-25 18 M0 0 L-30 -6" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
            <circle r="11" fill="${p}"/>
            <text y="3" text-anchor="middle" fill="#fff" font-size="6" font-weight="800">${escapeSvgText(product.brand.split(' ')[0])}</text>
          </g>
          <g transform="translate(198, 117)">
            <circle r="36" fill="#09090B" stroke="${s}" stroke-width="2"/>
            <circle r="31" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="6 4"/>
            <path d="M0 0 L-14 -28 M0 0 L24 -20 M0 0 L30 10 M0 0 L8 30 M0 0 L-25 18 M0 0 L-30 -6" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
            <circle r="11" fill="${s}"/>
            <text y="3" text-anchor="middle" fill="#fff" font-size="6" font-weight="800">OC</text>
          </g>
        ` : `
          <g transform="translate(88, 117)">
            <circle r="28" fill="#09090B" stroke="${p}" stroke-width="1.8"/>
            <path d="M0 0 L-10 -22 M0 0 L18 -16 M0 0 L24 8 M0 0 L6 24 M0 0 L-20 14 M0 0 L-24 -5" stroke="#475569" stroke-width="3.5" stroke-linecap="round"/>
            <circle r="9" fill="${p}"/>
          </g>
          <g transform="translate(155, 117)">
            <circle r="29" fill="#09090B" stroke="url(#rgb_${uid})" stroke-width="2.2"/>
            <path d="M0 0 L-10 -22 M0 0 L18 -16 M0 0 L24 8 M0 0 L6 24 M0 0 L-20 14 M0 0 L-24 -5" stroke="#64748B" stroke-width="3.5" stroke-linecap="round"/>
            <circle r="10" fill="#1E293B" stroke="${p}" stroke-width="1.5"/>
            <text y="3" text-anchor="middle" fill="#fff" font-size="5.5" font-weight="800">${escapeSvgText(product.brand.split(' ')[0])}</text>
          </g>
          <g transform="translate(222, 117)">
            <circle r="28" fill="#09090B" stroke="${s}" stroke-width="1.8"/>
            <path d="M0 0 L-10 -22 M0 0 L18 -16 M0 0 L24 8 M0 0 L6 24 M0 0 L-20 14 M0 0 L-24 -5" stroke="#475569" stroke-width="3.5" stroke-linecap="round"/>
            <circle r="9" fill="${s}"/>
          </g>
        `}
      `;
    }

    case 'Mainboard': {
      return `
        <!-- ATX PCB Board -->
        <rect x="82" y="34" width="136" height="154" rx="6" fill="#0F172A" stroke="#334155" stroke-width="2"/>
        <!-- VRM Heatsinks -->
        <rect x="88" y="42" width="26" height="62" rx="3" fill="url(#gradBox_${uid})" stroke="${p}" stroke-width="1.2"/>
        <rect x="118" y="40" width="56" height="20" rx="3" fill="#1E293B" stroke="#64748B" stroke-width="1"/>
        <line x1="92" y1="54" x2="110" y2="54" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
        <!-- CPU Socket -->
        <rect x="124" y="66" width="38" height="38" rx="3" fill="#334155" stroke="#94A3B8" stroke-width="1.5"/>
        <rect x="131" y="73" width="24" height="24" rx="2" fill="#0F172A" stroke="#F59E0B" stroke-width="1"/>
        <!-- 4x DDR5 RAM Slots -->
        <rect x="174" y="54" width="4" height="56" fill="${p}"/>
        <rect x="181" y="54" width="4" height="56" fill="#475569"/>
        <rect x="188" y="54" width="4" height="56" fill="${p}"/>
        <rect x="195" y="54" width="4" height="56" fill="#475569"/>
        <!-- M.2 Armor & PCIe Slots -->
        <rect x="96" y="114" width="68" height="14" rx="2" fill="#334155" stroke="#94A3B8" stroke-width="1"/>
        <line x1="94" y1="134" x2="180" y2="134" stroke="#E2E8F0" stroke-width="3"/>
        <line x1="94" y1="154" x2="175" y2="154" stroke="#475569" stroke-width="2.5"/>
        <!-- Chipset Heatsink -->
        <rect x="166" y="124" width="42" height="38" rx="4" fill="url(#gradBox_${uid})" stroke="${p}" stroke-width="1.5"/>
        <text x="187" y="147" text-anchor="middle" fill="#fff" font-size="7" font-weight="800">${escapeSvgText(product.chipLabel || 'Z790')}</text>
        <!-- Audio Capacitors -->
        <circle cx="92" cy="168" r="3" fill="#F59E0B"/>
        <circle cx="92" cy="177" r="3" fill="#F59E0B"/>
      `;
    }

    case 'RAM': {
      const isWhite = (product.name || '').toLowerCase().includes('white');
      const bodyFill = isWhite ? '#F1F5F9' : '#1E293B';
      const textFill = isWhite ? '#0F172A' : '#F8FAFC';
      return `
        <!-- Dual Channel Kit: Module 1 (Back) -->
        <g transform="translate(52, 52) rotate(-6)">
          <rect x="8" y="48" width="176" height="8" rx="1" fill="#F59E0B"/>
          <rect x="0" y="0" width="192" height="10" rx="4" fill="url(#rgb_${uid})"/>
          <rect x="0" y="8" width="192" height="42" rx="3" fill="${bodyFill}" stroke="#64748B" stroke-width="1.5"/>
          <text x="96" y="33" text-anchor="middle" fill="${textFill}" font-family="Inter, sans-serif" font-weight="800" font-size="10" letter-spacing="1">${escapeSvgText(product.brand)} DDR5</text>
        </g>
        <!-- Module 2 (Front) -->
        <g transform="translate(58, 96) rotate(-2)">
          <!-- Gold contacts -->
          <rect x="10" y="50" width="176" height="9" rx="1" fill="#F59E0B"/>
          <rect x="98" y="50" width="5" height="9" fill="#0F172A"/>
          <!-- RGB Diffuser Bar -->
          <rect x="0" y="0" width="196" height="12" rx="4" fill="url(#rgb_${uid})"/>
          <!-- Aluminum Heatspreader -->
          <rect x="0" y="10" width="196" height="42" rx="3" fill="${bodyFill}" stroke="${p}" stroke-width="1.5"/>
          <path d="M12 10 L28 52 M168 10 L152 52" stroke="${p}" stroke-width="2" opacity="0.6"/>
          <text x="98" y="32" text-anchor="middle" fill="${textFill}" font-family="Inter, sans-serif" font-weight="900" font-size="11" letter-spacing="1.2">${escapeSvgText(product.brand.toUpperCase())}</text>
          <text x="98" y="45" text-anchor="middle" fill="${p}" font-family="JetBrains Mono, monospace" font-weight="700" font-size="8.5">${escapeSvgText(product.chipLabel || 'DDR5 6000MHz')}</text>
        </g>
      `;
    }

    case 'Storage': {
      const isHDD = (product.name || '').includes('HDD') || (product.name || '').includes('IronWolf');
      if (isHDD) {
        return `
          <!-- 3.5" NAS HDD Enclosure -->
          <rect x="85" y="34" width="130" height="154" rx="8" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
          <circle cx="95" cy="44" r="3" fill="#64748B"/>
          <circle cx="205" cy="44" r="3" fill="#64748B"/>
          <circle cx="95" cy="178" r="3" fill="#64748B"/>
          <circle cx="205" cy="178" r="3" fill="#64748B"/>
          <!-- Platter Metallic Ring -->
          <circle cx="150" cy="96" r="44" fill="#334155" stroke="#CBD5E1" stroke-width="1.5"/>
          <circle cx="150" cy="96" r="14" fill="#94A3B8"/>
          <!-- Label Sticker -->
          <rect x="102" y="112" width="96" height="62" rx="4" fill="#F8FAFC"/>
          <rect x="102" y="112" width="96" height="16" rx="3" fill="${p}"/>
          <text x="150" y="123" text-anchor="middle" fill="#fff" font-weight="800" font-size="8.5">IRONWOLF PRO NAS</text>
          <text x="150" y="144" text-anchor="middle" fill="#0F172A" font-family="JetBrains Mono, monospace" font-weight="900" font-size="14">${escapeSvgText(product.chipLabel || '8TB')}</text>
          <text x="150" y="160" text-anchor="middle" fill="#475569" font-size="7.5" font-weight="700">7200 RPM SATA 6Gb/s</text>
        `;
      }
      return `
        <!-- M.2 2280 NVMe SSD Stick -->
        <g transform="translate(36, 78)">
          <!-- M-Key Gold Connector -->
          <rect x="0" y="16" width="14" height="36" rx="2" fill="#F59E0B"/>
          <rect x="0" y="22" width="6" height="5" fill="#0F172A"/>
          <!-- Black PCB -->
          <rect x="10" y="10" width="216" height="48" rx="4" fill="#09090B" stroke="#334155" stroke-width="1.5"/>
          <!-- Mounting Semicircle Notch -->
          <circle cx="226" cy="34" r="6" fill="#0F172A" stroke="#F59E0B" stroke-width="1.5"/>
          <!-- Heatsink / Controller Label -->
          <rect x="22" y="14" width="188" height="40" rx="3" fill="url(#gradBox_${uid})" stroke="${p}" stroke-width="1.5"/>
          <path d="M28 20 L65 20 L55 48 L28 48 Z" fill="${p}" opacity="0.85"/>
          <text x="45" y="38" text-anchor="middle" fill="#fff" font-family="JetBrains Mono, monospace" font-weight="900" font-size="10">${escapeSvgText(product.chipLabel || '2TB')}</text>
          <text x="135" y="32" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-weight="800" font-size="11">${escapeSvgText(product.brand.toUpperCase())}</text>
          <text x="135" y="45" text-anchor="middle" fill="#CBD5E1" font-family="JetBrains Mono, monospace" font-weight="700" font-size="8.5">${escapeSvgText(product.shortModel || 'NVMe M.2 PCIe')}</text>
        </g>
      `;
    }

    case 'PSU & Cooling': {
      const isCooler = (product.name || '').includes('Cooler') || (product.name || '').includes('Kraken') || (product.name || '').includes('AK620');
      if (isCooler) {
        return `
          <!-- Radiator / Dual Tower Heatsink -->
          <rect x="48" y="42" width="160" height="62" rx="6" fill="#1E293B" stroke="#64748B" stroke-width="1.5"/>
          <circle cx="80" cy="73" r="24" fill="#09090B" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
          <circle cx="128" cy="73" r="24" fill="#09090B" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
          <circle cx="176" cy="73" r="24" fill="#09090B" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
          <!-- Sleeved Tubes -->
          <path d="M196 104 Q215 140 176 152" stroke="#334155" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path d="M184 104 Q200 132 172 144" stroke="#475569" stroke-width="6" fill="none" stroke-linecap="round"/>
          <!-- LCD Pump Head / Digital Display -->
          <circle cx="145" cy="148" r="32" fill="#0F172A" stroke="${p}" stroke-width="3"/>
          <circle cx="145" cy="148" r="24" fill="#020617" stroke="url(#rgb_${uid})" stroke-width="1.5"/>
          <text x="145" y="146" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-weight="900" font-size="13">34°C</text>
          <text x="145" y="159" text-anchor="middle" fill="#94A3B8" font-size="6.5" font-weight="700">LIQUID TEMP</text>
        `;
      }
      return `
        <!-- ATX 3.0 Power Supply Unit -->
        <rect x="64" y="48" width="172" height="124" rx="8" fill="#18181B" stroke="#475569" stroke-width="2"/>
        <!-- Fan Grille -->
        <circle cx="122" cy="110" r="46" fill="#09090B" stroke="#334155" stroke-width="2"/>
        <circle cx="122" cy="110" r="36" fill="none" stroke="#27272A" stroke-width="1.5"/>
        <circle cx="122" cy="110" r="25" fill="none" stroke="#27272A" stroke-width="1.5"/>
        <circle cx="122" cy="110" r="14" fill="${p}"/>
        <text x="122" y="113" text-anchor="middle" fill="#fff" font-size="6.5" font-weight="800">80+ GOLD</text>
        <!-- Wattage Side Badge -->
        <rect x="178" y="64" width="48" height="92" rx="4" fill="url(#gradBox_${uid})"/>
        <text x="202" y="102" text-anchor="middle" fill="#fff" font-family="Inter, sans-serif" font-weight="900" font-size="11">${escapeSvgText(product.chipLabel || '1000W')}</text>
        <text x="202" y="118" text-anchor="middle" fill="#E2E8F0" font-size="7" font-weight="700">ATX 3.0</text>
        <text x="202" y="132" text-anchor="middle" fill="#FDE047" font-size="6.5" font-weight="800">PCIe 5.0</text>
      `;
    }

    case 'Case': {
      const isWhite = (product.name || '').toLowerCase().includes('white');
      const chassis = isWhite ? '#E2E8F0' : '#1E293B';
      return `
        <!-- Dual Chamber Panoramic Glass PC Case -->
        <rect x="86" y="30" width="128" height="160" rx="6" fill="${chassis}" stroke="#64748B" stroke-width="2"/>
        <!-- Tempered Glass Side Panel -->
        <rect x="94" y="38" width="84" height="140" rx="3" fill="#09090B" stroke="#38BDF8" stroke-width="1" opacity="0.92"/>
        <!-- Internal ARGB Fans & GPU Glow -->
        <circle cx="162" cy="62" r="11" fill="none" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
        <circle cx="162" cy="90" r="11" fill="none" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
        <circle cx="162" cy="118" r="11" fill="none" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
        <!-- AIO & GPU inside view -->
        <circle cx="124" cy="78" r="10" fill="#0F172A" stroke="${p}" stroke-width="2.5"/>
        <rect x="104" y="106" width="46" height="12" rx="2" fill="url(#rgb_${uid})"/>
        <!-- Front Glass / Walnut Mesh Panel -->
        <rect x="182" y="38" width="24" height="140" rx="2" fill="url(#gradBox_${uid})" stroke="#475569" stroke-width="1"/>
      `;
    }

    case 'Monitor': {
      const isUltrawide = (product.name || '').includes('49"');
      const w = isUltrawide ? 228 : 184;
      const x = (300 - w) / 2;
      return `
        <!-- Monitor Stand -->
        <path d="M136 146 L120 182 L180 182 L164 146 Z" fill="#334155"/>
        <path d="M105 182 L195 182" stroke="${p}" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Bezel & Screen -->
        <rect x="${x}" y="42" width="${w}" height="108" rx="6" fill="#09090B" stroke="#475569" stroke-width="2"/>
        <rect x="${x + 5}" y="47" width="${w - 10}" height="94" rx="3" fill="url(#gradBox_${uid})"/>
        <!-- Dynamic Gaming Wallpaper Graphics -->
        <circle cx="150" cy="94" r="34" fill="url(#rgb_${uid})" opacity="0.35"/>
        <path d="M${x + 15} 130 L125 75 L165 110 L195 68 L${x + w - 15} 130 Z" fill="${p}" opacity="0.45"/>
        <!-- Refresh Rate HUD Badge -->
        <rect x="${x + 12}" y="54" width="64" height="18" rx="4" fill="#09090B" opacity="0.8"/>
        <text x="${x + 44}" y="66" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-weight="800" font-size="9">${escapeSvgText(product.chipLabel || '240Hz OLED')}</text>
      `;
    }

    case 'Laptop': {
      return `
        <!-- Laptop Display Lid -->
        <rect x="74" y="42" width="152" height="96" rx="6" fill="#0F172A" stroke="#64748B" stroke-width="2"/>
        <rect x="80" y="48" width="140" height="84" rx="3" fill="url(#gradBox_${uid})"/>
        <circle cx="150" cy="90" r="26" fill="url(#rgb_${uid})" opacity="0.4"/>
        <text x="150" y="94" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-weight="900" font-size="12" letter-spacing="1">${escapeSvgText(product.brand.toUpperCase())}</text>
        <!-- Laptop Base / Keyboard Deck -->
        <path d="M52 138 L248 138 L264 168 L36 168 Z" fill="#1E293B" stroke="#94A3B8" stroke-width="1.5"/>
        <!-- RGB Keyboard Glow -->
        <path d="M72 143 L228 143 L236 156 L64 156 Z" fill="#09090B" stroke="url(#rgb_${uid})" stroke-width="1.2"/>
        <!-- Trackpad -->
        <rect x="132" y="158" width="36" height="8" rx="1.5" fill="#334155"/>
        <!-- Front RGB Lightbar -->
        <line x1="46" y1="169" x2="254" y2="169" stroke="url(#rgb_${uid})" stroke-width="3" stroke-linecap="round"/>
      `;
    }

    default: {
      // Peripherals, Networking, UPS
      const name = (product.name || '').toLowerCase();
      if (name.includes('mouse')) {
        return `
          <!-- Wireless Gaming Mouse -->
          <rect x="112" y="38" width="76" height="142" rx="38" fill="url(#gradBox_${uid})" stroke="${p}" stroke-width="2"/>
          <line x1="114" y1="88" x2="186" y2="88" stroke="#475569" stroke-width="1.5"/>
          <line x1="150" y1="38" x2="150" y2="88" stroke="#475569" stroke-width="1.5"/>
          <!-- Scroll Wheel -->
          <rect x="145" y="54" width="10" height="24" rx="5" fill="#09090B" stroke="#38BDF8" stroke-width="1.5"/>
          <!-- Glowing Logo -->
          <circle cx="150" cy="142" r="12" fill="none" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
          <text x="150" y="145" text-anchor="middle" fill="#fff" font-weight="900" font-size="9">G</text>
        `;
      }
      if (name.includes('keyboard')) {
        return `
          <!-- Mechanical RGB Gaming Keyboard -->
          <rect x="42" y="68" width="216" height="84" rx="8" fill="#09090B" stroke="url(#rgb_${uid})" stroke-width="2.5"/>
          <rect x="50" y="76" width="200" height="68" rx="4" fill="#18181B"/>
          <!-- Keycap rows -->
          <line x1="56" y1="86" x2="244" y2="86" stroke="url(#rgb_${uid})" stroke-width="6" stroke-dasharray="10 3"/>
          <line x1="56" y1="99" x2="244" y2="99" stroke="url(#rgb_${uid})" stroke-width="6" stroke-dasharray="11 3"/>
          <line x1="56" y1="112" x2="244" y2="112" stroke="url(#rgb_${uid})" stroke-width="6" stroke-dasharray="12 3"/>
          <line x1="56" y1="125" x2="244" y2="125" stroke="${p}" stroke-width="6" stroke-dasharray="18 4"/>
          <rect x="110" y="134" width="80" height="6" rx="2" fill="${p}"/>
        `;
      }
      if (name.includes('headset')) {
        return `
          <!-- Wireless Gaming Headset -->
          <path d="M92 118 A58 58 0 0 1 208 118" fill="none" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
          <path d="M98 110 A52 52 0 0 1 202 110" fill="none" stroke="${p}" stroke-width="4" stroke-linecap="round"/>
          <!-- Earcups -->
          <rect x="76" y="102" width="28" height="54" rx="14" fill="url(#gradBox_${uid})" stroke="${p}" stroke-width="2"/>
          <rect x="196" y="102" width="28" height="54" rx="14" fill="url(#gradBox_${uid})" stroke="${p}" stroke-width="2"/>
          <!-- Boom Mic -->
          <path d="M88 150 Q105 178 138 170" fill="none" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
          <circle cx="140" cy="170" r="4" fill="${p}"/>
        `;
      }
      if (name.includes('router') || name.includes('wifi')) {
        return `
          <!-- Quad-Band WiFi 7 Gaming Router -->
          <!-- 8 Antennas -->
          <line x1="68" y1="128" x2="54" y2="48" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
          <line x1="95" y1="120" x2="88" y2="42" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
          <line x1="150" y1="116" x2="150" y2="38" stroke="${p}" stroke-width="5" stroke-linecap="round"/>
          <line x1="205" y1="120" x2="212" y2="42" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
          <line x1="232" y1="128" x2="246" y2="48" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
          <!-- Router Base -->
          <polygon points="56,142 92,114 208,114 244,142 226,168 74,168" fill="#0F172A" stroke="${p}" stroke-width="2"/>
          <circle cx="150" cy="140" r="14" fill="none" stroke="url(#rgb_${uid})" stroke-width="2"/>
          <text x="150" y="143" text-anchor="middle" fill="#fff" font-size="7" font-weight="800">WiFi 7</text>
        `;
      }
      // UPS
      return `
        <!-- Sinewave UPS Tower with LCD -->
        <rect x="104" y="34" width="92" height="152" rx="6" fill="#18181B" stroke="#475569" stroke-width="2"/>
        <rect x="118" y="52" width="64" height="44" rx="4" fill="#020617" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="150" y="72" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-weight="900" font-size="12">230V</text>
        <text x="150" y="86" text-anchor="middle" fill="#22C55E" font-family="JetBrains Mono, monospace" font-weight="700" font-size="7.5">BATT 100%</text>
        <circle cx="150" cy="116" r="8" fill="#334155" stroke="${p}" stroke-width="1.5"/>
        <rect x="122" y="138" width="56" height="32" rx="3" fill="#27272A"/>
      `;
    }
  }
}

function generateProductSvgFallback(product) {
  const theme = BRAND_THEMES[product.brand] || {
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#DBEAFE',
    badgeBg: '#1E293B'
  };
  const uid = product.id.replace(/[^a-zA-Z0-9]/g, '');
  const artwork = getHardwareArtwork(product, theme);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="600" height="440">
    <defs>
      <linearGradient id="bg_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0B1120"/>
        <stop offset="55%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#1E293B"/>
      </linearGradient>
      <linearGradient id="gradBox_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.primary}"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="ihs_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F8FAFC"/>
        <stop offset="50%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#94A3B8"/>
      </linearGradient>
      <linearGradient id="rgb_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F43F5E"/>
        <stop offset="33%" stop-color="#8B5CF6"/>
        <stop offset="66%" stop-color="#06B6D4"/>
        <stop offset="100%" stop-color="#10B981"/>
      </linearGradient>
      <radialGradient id="glow_${uid}" cx="50%" cy="52%" r="48%">
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Studio Background -->
    <rect width="300" height="220" fill="url(#bg_${uid})"/>
    <!-- Subtle Tech Grid -->
    <pattern id="grid_${uid}" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" stroke-width="0.4" stroke-opacity="0.05"/>
    </pattern>
    <rect width="300" height="220" fill="url(#grid_${uid})"/>

    <!-- Studio Backlight Glow -->
    <ellipse cx="150" cy="115" rx="115" ry="75" fill="url(#glow_${uid})"/>
    <!-- Floor Reflection Shadow -->
    <ellipse cx="150" cy="186" rx="88" ry="10" fill="#000000" opacity="0.45"/>

    <!-- Top-Left Brand Pill -->
    <rect x="12" y="10" width="84" height="20" rx="5" fill="${theme.primary}" opacity="0.9"/>
    <text x="54" y="23.5" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-weight="800" font-size="9.5" letter-spacing="0.4">${escapeSvgText(product.brand.toUpperCase())}</text>

    <!-- Top-Right SKU Code -->
    <rect x="200" y="10" width="88" height="20" rx="5" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    <text x="244" y="23.5" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-weight="700" font-size="8.5">${escapeSvgText(product.id)}</text>

    <!-- Main 3D-Style Hardware Render -->
    ${artwork}

    <!-- Bottom Spec Strip -->
    <rect x="0" y="196" width="300" height="24" fill="#020617" opacity="0.88"/>
    <line x1="0" y1="196" x2="300" y2="196" stroke="${theme.primary}" stroke-width="1.2" opacity="0.7"/>
    <text x="14" y="211.5" fill="#F8FAFC" font-family="Inter, sans-serif" font-weight="700" font-size="9.5">${escapeSvgText(product.shortModel || product.category)}</text>
    <text x="286" y="211.5" text-anchor="end" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-weight="700" font-size="9">${escapeSvgText(product.chipLabel || product.warranty)}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function generateProductImageDataUri(product) {
  if (product.customImage && product.customImage.trim() !== '') {
    return product.customImage;
  }
  if (product.imageUrl && product.imageUrl.trim() !== '') {
    return product.imageUrl;
  }
  return `images/${product.id}.jpg`;
}

function handleProductImageError(imgEl, sku) {
  if (!imgEl || imgEl.dataset.fallbackApplied === 'true') return;
  imgEl.dataset.fallbackApplied = 'true';
  const prod = (window.INITIAL_PRODUCTS || []).find((p) => p.id === sku) || {
    id: sku || 'SKU-000',
    brand: 'TECH',
    category: 'CPU',
    shortModel: sku
  };
  imgEl.src = generateProductSvgFallback(prod);
}

window.generateProductSvgFallback = generateProductSvgFallback;
window.generateProductImageDataUri = generateProductImageDataUri;
window.handleProductImageError = handleProductImageError;

