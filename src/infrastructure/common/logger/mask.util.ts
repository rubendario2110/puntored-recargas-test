export function maskIdentifier(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.length <= 2) return '*'.repeat(trimmed.length);
  if (trimmed.length === 3) return `${trimmed[0]}*${trimmed[2]}`;
  if (trimmed.length === 4) return `${trimmed[0]}**${trimmed[3]}`;

  const prefix = trimmed.slice(0, 2);
  const suffix = trimmed.slice(-2);
  const maskedMiddle = '*'.repeat(trimmed.length - 4);
  return `${prefix}${maskedMiddle}${suffix}`;
}
