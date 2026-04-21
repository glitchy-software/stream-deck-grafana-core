/**
 * Handles scaling and suffixes for Grafana display units.
 * 
 * @author Gerard de Jong
 * @copyright glitchysoftware 2026
 */
export class GrafanaUnitHandler {
    
    public static formatGrafanaValue(value: number, unit?: string, decimals = 1): string {
        if (!isFinite(value)) {
            return String(value);
        }

        // // Percent handling
        // if (unit === 'percent') {
        //     return `${(value * 100).toFixed(decimals)}%`; // No space between number and %
        // }

        if (unit === 'percent' || unit === 'percentunit' || unit === '%') {
            return `${value.toFixed(decimals)}%`; // No space between number and %
        }

        const scale = GrafanaUnitHandler.getScaleForUnit(unit);

        if (scale) {
            const scaled = GrafanaUnitHandler.scaleValue(value, scale);
            return `${scaled.value.toFixed(decimals)} ${scaled.suffix}`;
        }

        // Fallback: no scaling
        const suffix = GrafanaUnitHandler.resolveGrafanaUnitSuffix(unit);
        return suffix
            ? `${value.toFixed(decimals)} ${suffix}`
            : value.toFixed(decimals);
    }

    private static scaleValue(value: number,scale: UnitScale): { value: number; suffix: string } {
        let chosen = scale.units[0];

        for (const unit of scale.units) {
            if (Math.abs(value) >= unit.factor) {
                chosen = unit;
            }
            else {
                break;
            }
        }

        return {
            value: value / chosen.factor,
            suffix: chosen.suffix,
        };
    }

    private static getScaleForUnit(unit?: string): UnitScale | null {
        switch (unit) {
            case 'bytes':
            return BINARY_BYTES;
            case 'bytes_si':
            return SI_BYTES;
            case 'bits':
            case 'bits_si':
            return BITS;
            case 'ms':
            case 's':
            case 'ns':
            return TIME;
            case 'Bps':
            case 'KBps':
            case 'MBps':
            case 'GBps':
            return RATE_BYTES;
            default:
            return null;
        }
    }

    private static resolveGrafanaUnitSuffix(unit?: string): string {
        if (!unit) {
            return '';
        }

        // Exact match
        if (UNIT_SUFFIX_MAP[unit]) {
            return UNIT_SUFFIX_MAP[unit];
        }

        // Heuristic fallbacks (safe, non-breaking)
        if (unit.startsWith('currency')) {
            return unit.replace('currency', '');
        }

        // Unknown unit → Grafana-style fallback
        // Grafana would silently fall back to "short"
        return '';
    }
}
 // Known Grafana unit IDs mapped to rendered suffix text
const UNIT_SUFFIX_MAP: Record<string, string> = {
  // Generic
  short: '',
  none: '',
  string: '',

  // Percentages
  percent: '%',
  percentunit: '%',

  // Time
  ns: 'ns',
  µs: 'µs',
  us: 'µs', // seen in some dashboards
  ms: 'ms',
  s: 's',
  m: 'min',
  h: 'h',
  d: 'd',
  w: 'wk',
  mo: 'mo',
  y: 'yr',

  // Data (binary)
  bytes: 'B',
  bits: 'b',

  // Data (SI)
  bytes_si: 'B',
  bits_si: 'b',

  // Throughput
  bps: 'bps',
  Bps: 'B/s',
  KBps: 'KB/s',
  MBps: 'MB/s',
  GBps: 'GB/s',
  Kbps: 'kbps',
  Mbps: 'Mbps',
  Gbps: 'Gbps',

  // Ops / rates
  ops: 'ops/s',
  reqps: 'req/s',
  iops: 'IOPS',
  pps: 'pps',

  // Frequency
  hz: 'Hz',
  khz: 'kHz',
  mhz: 'MHz',
  ghz: 'GHz',

  // CPU / cores
  cores: 'cores',
  millicores: 'mC',

  // Temperature
  celsius: '°C',
  fahrenheit: '°F',
  kelvin: 'K',

  // Power / energy
  watt: 'W',
  kwatt: 'kW',
  mwatt: 'MW',
  gwatt: 'GW',
  joule: 'J',
  ev: 'eV',

  // Currency
  currencyUSD: '$',
  currencyEUR: '€',
  currencyGBP: '£',
  currencyJPY: '¥',
  currencyCNY: '¥',

  // Misc
  rpm: 'rpm',
  decibel: 'dB',
};

export type ScaledUnit = {
  factor: number;
  suffix: string;
};

export type UnitScale = {
  base: string;
  units: ScaledUnit[];
};

export const BINARY_BYTES: UnitScale = {
  base: 'bytes',
  units: [
    { factor: 1, suffix: 'B' },
    { factor: 1024, suffix: 'KiB' },
    { factor: 1024 ** 2, suffix: 'MiB' },
    { factor: 1024 ** 3, suffix: 'GiB' },
    { factor: 1024 ** 4, suffix: 'TiB' },
  ],
};

export const SI_BYTES: UnitScale = {
  base: 'bytes_si',
  units: [
    { factor: 1, suffix: 'B' },
    { factor: 1e3, suffix: 'kB' },
    { factor: 1e6, suffix: 'MB' },
    { factor: 1e9, suffix: 'GB' },
    { factor: 1e12, suffix: 'TB' },
  ],
};

export const BITS: UnitScale = {
  base: 'bits',
  units: [
    { factor: 1, suffix: 'b' },
    { factor: 1024, suffix: 'Kib' },
    { factor: 1024 ** 2, suffix: 'Mib' },
    { factor: 1024 ** 3, suffix: 'Gib' },
  ],
};

export const TIME: UnitScale = {
  base: 'time',
  units: [
    { factor: 1, suffix: 'ns' },
    { factor: 1e3, suffix: 'µs' },
    { factor: 1e6, suffix: 'ms' },
    { factor: 1e9, suffix: 's' },
    { factor: 60e9, suffix: 'min' },
    { factor: 3600e9, suffix: 'h' },
  ],
};

export const RATE_BYTES: UnitScale = {
  base: 'Bps',
  units: [
    { factor: 1, suffix: 'B/s' },
    { factor: 1024, suffix: 'KB/s' },
    { factor: 1024 ** 2, suffix: 'MB/s' },
    { factor: 1024 ** 3, suffix: 'GB/s' },
  ],
};
