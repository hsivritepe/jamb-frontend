import { ALL_SERVICES } from '@/constants/services';

export function clampQuantity(serviceId: string, rawValue: number) {
  // find a service
  const svc = ALL_SERVICES.find(svc => svc.id === serviceId);
  if (!svc) return rawValue; // если не нашли, вернуть rawValue, или можно выбросить ошибку

  // get minQ, maxQ
  const minQ = svc.min_quantity ?? 1;
  const maxQ = svc.max_quantity ?? 999999;

  // use clamp
  let nextVal = rawValue;
  if (nextVal < minQ) nextVal = minQ;
  if (nextVal > maxQ) nextVal = maxQ;

  return nextVal;
}