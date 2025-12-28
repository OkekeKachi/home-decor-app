export function getDelay(failedAttempts) {
  if (failedAttempts <= 1) return 0;
  const delays = [0, 0, 2000, 5000, 10000, 20000, 30000];
  return delays[Math.min(failedAttempts, delays.length - 1)];
}