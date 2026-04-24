import type { CompatibilityAnswers, CompatibilityResult } from '../types';

function scoreSchedule(a: CompatibilityAnswers, b: CompatibilityAnswers): number {
  const sleepOrder = { early: 0, normal: 1, late: 2, very_late: 3 };
  const wakeOrder = { very_early: 0, early: 1, normal: 2, late: 3 };
  const sleepDiff = Math.abs(sleepOrder[a.sleepTime] - sleepOrder[b.sleepTime]);
  const wakeDiff = Math.abs(wakeOrder[a.wakeTime] - wakeOrder[b.wakeTime]);
  const studyMatch = a.studySchedule === b.studySchedule ? 100 : 60;
  return Math.round((((3 - sleepDiff) / 3) * 100 + ((3 - wakeDiff) / 3) * 100 + studyMatch) / 3);
}

function scoreCleanliness(a: CompatibilityAnswers, b: CompatibilityAnswers): number {
  const levelDiff = Math.abs(a.cleanlinessLevel - b.cleanlinessLevel);
  const freqOrder = { daily: 3, weekly: 2, biweekly: 1, monthly: 0 };
  const freqDiff = Math.abs(freqOrder[a.cleaningFrequency] - freqOrder[b.cleaningFrequency]);
  return Math.round((((4 - levelDiff) / 4) * 100 + ((3 - freqDiff) / 3) * 100) / 2);
}

function scoreNoise(a: CompatibilityAnswers, b: CompatibilityAnswers): number {
  const noiseOrder = { silent: 0, quiet: 1, moderate: 2, loud: 3 };
  const studyOrder = { silence: 0, ambient: 1, music: 2, any: 3 };
  const noiseDiff = Math.abs(noiseOrder[a.noiseLevel] - noiseOrder[b.noiseLevel]);
  const studyDiff = Math.abs(studyOrder[a.studyEnvironment] - studyOrder[b.studyEnvironment]);
  return Math.round((((3 - noiseDiff) / 3) * 100 + ((3 - studyDiff) / 3) * 100) / 2);
}

function scoreGuests(a: CompatibilityAnswers, b: CompatibilityAnswers): number {
  const guestOrder = { never: 0, rarely: 1, sometimes: 2, often: 3 };
  const diff = Math.abs(guestOrder[a.guestsFrequency] - guestOrder[b.guestsFrequency]);
  const overnightMatch = a.overnightGuests === b.overnightGuests ? 100 : 40;
  return Math.round((((3 - diff) / 3) * 100 + overnightMatch) / 2);
}

function scoreSocial(a: CompatibilityAnswers, b: CompatibilityAnswers): number {
  const socialOrder = { introvert: 0, ambivert: 1, extrovert: 2 };
  const sharedOrder = { prefer_alone: 0, neutral: 1, enjoy_together: 2 };
  const socialDiff = Math.abs(socialOrder[a.socialStyle] - socialOrder[b.socialStyle]);
  const sharedDiff = Math.abs(sharedOrder[a.sharedSpaces] - sharedOrder[b.sharedSpaces]);
  const petsOk = (!a.hasPets || b.acceptsPets) && (!b.hasPets || a.acceptsPets) ? 100 : 0;
  const smokeOk = (!a.smokes || b.acceptsSmoking) && (!b.smokes || a.acceptsSmoking) ? 100 : 0;
  return Math.round((((2 - socialDiff) / 2) * 100 + ((2 - sharedDiff) / 2) * 100 + petsOk + smokeOk) / 4);
}

function scoreBudget(a: CompatibilityAnswers, b: CompatibilityAnswers): number {
  const budgetOrder = { under_400: 0, '400_600': 1, '600_800': 2, over_800: 3 };
  const expenseMatch = a.expenseSplit === b.expenseSplit ? 100 : 60;
  const budgetDiff = Math.abs(budgetOrder[a.budgetRange] - budgetOrder[b.budgetRange]);
  return Math.round((expenseMatch + ((3 - budgetDiff) / 3) * 100) / 2);
}

export function calculateCompatibility(a: CompatibilityAnswers, b: CompatibilityAnswers): CompatibilityResult {
  const breakdown = {
    schedule: scoreSchedule(a, b),
    cleanliness: scoreCleanliness(a, b),
    noise: scoreNoise(a, b),
    guests: scoreGuests(a, b),
    social: scoreSocial(a, b),
    budget: scoreBudget(a, b),
  };

  // Weighted average — schedule and cleanliness matter most
  const score = Math.round(
    breakdown.schedule * 0.20 +
    breakdown.cleanliness * 0.20 +
    breakdown.noise * 0.18 +
    breakdown.guests * 0.15 +
    breakdown.social * 0.15 +
    breakdown.budget * 0.12
  );

  const label =
    score >= 80 ? 'excellent' :
    score >= 65 ? 'good' :
    score >= 50 ? 'fair' : 'poor';

  return { score, breakdown, label };
}

export function getCompatibilityColor(score: number): string {
  if (score >= 80) return '#1D9E75';
  if (score >= 65) return '#4CAF50';
  if (score >= 50) return '#FF9800';
  return '#F44336';
}

export function getCompatibilityLabel(label: CompatibilityResult['label']): string {
  const labels = { excellent: 'Excelente', good: 'Buena', fair: 'Regular', poor: 'Baja' };
  return labels[label];
}
