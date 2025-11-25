export const generateLocalId = () =>
  `local-${Math.random().toString(36).substring(2, 9)}`;

export const kgToLbs = (kg: number) => kg * 2.20462;
export const lbsToKg = (lbs: number) => lbs / 2.20462;
