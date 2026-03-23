import { describe, it, expect } from 'vitest';
import {
  severityColors,
  domainColors,
  chartColors,
  getDomainColor,
  getSeverityColor,
  hexToRgba,
} from '../colors';

describe('Color Utilities', () => {
  describe('severityColors', () => {
    it('should have correct severity color mappings', () => {
      expect(severityColors.critical).toBe('#ef4444');
      expect(severityColors.major).toBe('#f59e0b');
      expect(severityColors.minor).toBe('#eab308');
      expect(severityColors.info).toBe('#60a5fa');
    });
  });

  describe('domainColors', () => {
    it('should have at least 8 domain colors', () => {
      expect(domainColors.length).toBeGreaterThanOrEqual(8);
    });

    it('should contain valid hex color codes', () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      domainColors.forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });
  });

  describe('chartColors', () => {
    it('should have correct chart color mappings', () => {
      expect(chartColors.primary).toBe('#3b82f6');
      expect(chartColors.success).toBe('#10b981');
      expect(chartColors.warning).toBe('#f59e0b');
      expect(chartColors.danger).toBe('#ef4444');
      expect(chartColors.info).toBe('#06b6d4');
    });
  });

  describe('getDomainColor', () => {
    it('should return correct color for valid index', () => {
      expect(getDomainColor(0)).toBe(domainColors[0]);
      expect(getDomainColor(1)).toBe(domainColors[1]);
      expect(getDomainColor(2)).toBe(domainColors[2]);
    });

    it('should wrap around for indices greater than array length', () => {
      const length = domainColors.length;
      expect(getDomainColor(length)).toBe(domainColors[0]);
      expect(getDomainColor(length + 1)).toBe(domainColors[1]);
      expect(getDomainColor(length * 2)).toBe(domainColors[0]);
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct color for critical severity', () => {
      expect(getSeverityColor('critical')).toBe('#ef4444');
    });

    it('should return correct color for major severity', () => {
      expect(getSeverityColor('major')).toBe('#f59e0b');
    });

    it('should return correct color for minor severity', () => {
      expect(getSeverityColor('minor')).toBe('#eab308');
    });

    it('should return correct color for info severity', () => {
      expect(getSeverityColor('info')).toBe('#60a5fa');
    });
  });

  describe('hexToRgba', () => {
    it('should convert hex to rgba with alpha 1', () => {
      expect(hexToRgba('#ff0000', 1)).toBe('rgba(255, 0, 0, 1)');
    });

    it('should convert hex to rgba with alpha 0.5', () => {
      expect(hexToRgba('#00ff00', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
    });

    it('should convert hex to rgba with alpha 0', () => {
      expect(hexToRgba('#0000ff', 0)).toBe('rgba(0, 0, 255, 0)');
    });

    it('should handle mixed hex colors', () => {
      expect(hexToRgba('#3b82f6', 0.8)).toBe('rgba(59, 130, 246, 0.8)');
    });
  });
});
