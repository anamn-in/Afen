import { EventDao } from '@storage/daos/EventDao';

export async function predict(fingerprint: string, windowHours: number = 24): Promise<{ riskScore: number; expectedNextHour: number }> {
  const dao = new EventDao();
  const now = Date.now();
  const start = now - windowHours * 3600000;
  const series = dao.getTimeSeries(fingerprint, start, now);
  const total = series.reduce((sum: number, p: { count: number }) => sum + p.count, 0);
  const avgPerHour = total / Math.max(1, series.length);
  const riskScore = Math.min(1, avgPerHour / 10);
  return { riskScore, expectedNextHour: avgPerHour };
}