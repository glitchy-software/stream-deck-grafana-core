import { GrafanaUnitHandler } from '../src/grafana-unit-handler'

describe('Testing Grafana Unit Handler', () => {
  
    test('Test byte formatting', async () => {
        const suffix = GrafanaUnitHandler.formatGrafanaValue(1536, "bytes", 2);
        expect(suffix).toBe('1.50 KiB');
    });
    
    test('Test percent unit formatting', async () => {
        const suffix = GrafanaUnitHandler.formatGrafanaValue(100, "percentunit", 1);
        expect(suffix).toBe('100.0%');
    });

    test.skip('Test percent formatting', async () => {
        const suffix = GrafanaUnitHandler.formatGrafanaValue(0.42, "percent", 1);
        expect(suffix).toBe('42.0%');
    });

    test('Test percent sign formatting', async () => {
        const suffix = GrafanaUnitHandler.formatGrafanaValue(0.49, "%", 1);
        expect(suffix).toBe('0.5%');
    });

    test('Test Bps formatting', async () => {
        const suffix = GrafanaUnitHandler.formatGrafanaValue(5_000_000, "Bps", 2);
        expect(suffix).toBe('4.77 MB/s');
    });
    
});
