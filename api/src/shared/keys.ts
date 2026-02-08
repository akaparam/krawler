export const metadataSk = "METADATA";

export function linkPk(shortCode: string): string {
  return `LINK#${shortCode}`;
}

export function statsSk(date: string): string {
  return `STATS#${date}`;
}
