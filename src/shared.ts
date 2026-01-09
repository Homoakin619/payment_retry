import { randomUUID } from "crypto";

export function generateTransactionReference(): string {
    return randomUUID();
}

export function getPastDate(daysAgo: number): Date {
  const today = new Date();
  today.setDate(today.getDate() - daysAgo);
  return today;
}