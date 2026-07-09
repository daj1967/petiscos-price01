export function calculateAssetCostPerHour(
  powerKw: number,
  consumptionPerHour: number,
  costPerHour: number,
): number {
  return powerKw * consumptionPerHour * costPerHour
}

export function calculateLaborCostPerHour(
  hourlyRate: number,
  benefitsMultiplier: number = 1,
): number {
  return hourlyRate * benefitsMultiplier
}
