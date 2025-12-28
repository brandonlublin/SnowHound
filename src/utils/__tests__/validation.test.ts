import { describe, it, expect } from 'vitest';
import { validateCoordinates, sanitizeSearchQuery, validateLocation } from '../validation';

describe('validation', () => {
  describe('validateCoordinates', () => {
    it('should validate correct latitude and longitude', () => {
      expect(validateCoordinates(40.7128, -74.0060)).toBe(true);
      expect(validateCoordinates(0, 0)).toBe(true);
      expect(validateCoordinates(-90, 180)).toBe(true);
      expect(validateCoordinates(90, -180)).toBe(true);
    });

    it('should reject invalid latitude', () => {
      expect(validateCoordinates(91, 0)).toBe(false);
      expect(validateCoordinates(-91, 0)).toBe(false);
      expect(validateCoordinates(100, 0)).toBe(false);
    });

    it('should reject invalid longitude', () => {
      expect(validateCoordinates(0, 181)).toBe(false);
      expect(validateCoordinates(0, -181)).toBe(false);
      expect(validateCoordinates(0, 200)).toBe(false);
    });

    it('should reject NaN values', () => {
      expect(validateCoordinates(NaN, 0)).toBe(false);
      expect(validateCoordinates(0, NaN)).toBe(false);
      expect(validateCoordinates(NaN, NaN)).toBe(false);
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should trim whitespace', () => {
      expect(sanitizeSearchQuery('  test  ')).toBe('test');
      expect(sanitizeSearchQuery('\ttest\n')).toBe('test');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeSearchQuery('test<script>alert("xss")</script>')).toBe('testalert("xss")');
      expect(sanitizeSearchQuery('test&test')).toBe('testtest');
    });

    it('should handle empty strings', () => {
      expect(sanitizeSearchQuery('')).toBe('');
      expect(sanitizeSearchQuery('   ')).toBe('');
    });

    it('should preserve normal characters', () => {
      expect(sanitizeSearchQuery('Vail, CO')).toBe('Vail, CO');
      expect(sanitizeSearchQuery('Crystal Mountain')).toBe('Crystal Mountain');
    });
  });

  describe('validateLocation', () => {
    it('should validate correct location object', () => {
      expect(validateLocation({ lat: 40.7128, lon: -74.0060 })).toBe(true);
      expect(validateLocation({ lat: 0, lon: 0 })).toBe(true);
    });

    it('should reject invalid location', () => {
      expect(validateLocation({ lat: 91, lon: 0 })).toBe(false);
      expect(validateLocation({ lat: 0, lon: 181 })).toBe(false);
      expect(validateLocation({ lat: NaN, lon: 0 })).toBe(false);
    });

    it('should handle missing properties', () => {
      expect(validateLocation({ lat: 40 } as any)).toBe(false);
      expect(validateLocation({ lon: -74 } as any)).toBe(false);
    });
  });
});

