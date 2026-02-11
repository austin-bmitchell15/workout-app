export const generateLocalId = () =>
  `local-${Math.random().toString(36).substring(2, 9)}`;

export const LBS_TO_KG = 2.20462;

export const kgToLbs = (kg: number) => kg * LBS_TO_KG;
export const lbsToKg = (lbs: number) => lbs / LBS_TO_KG;
