import { generateLocalId, kgToLbs, lbsToKg, LBS_TO_KG } from '../helpers';

describe('helpers', () => {
  describe('generateLocalId', () => {
    it('should return a string with "local-" prefix', () => {
      const id = generateLocalId();
      expect(id).toMatch(/^local-[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateLocalId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('LBS_TO_KG', () => {
    it('should equal 2.20462', () => {
      expect(LBS_TO_KG).toBe(2.20462);
    });
  });

  describe('kgToLbs', () => {
    it('should convert kg to lbs', () => {
      expect(kgToLbs(1)).toBeCloseTo(2.20462);
      expect(kgToLbs(100)).toBeCloseTo(220.462);
    });

    it('should handle 0', () => {
      expect(kgToLbs(0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(kgToLbs(-1)).toBeCloseTo(-2.20462);
    });
  });

  describe('lbsToKg', () => {
    it('should convert lbs to kg', () => {
      expect(lbsToKg(2.20462)).toBeCloseTo(1);
      expect(lbsToKg(220.462)).toBeCloseTo(100);
    });

    it('should handle 0', () => {
      expect(lbsToKg(0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(lbsToKg(-2.20462)).toBeCloseTo(-1);
    });
  });

  describe('kgToLbs and lbsToKg round-trip', () => {
    it('should be inverse operations', () => {
      const original = 75;
      expect(lbsToKg(kgToLbs(original))).toBeCloseTo(original);
    });
  });
});
