// AI-assisted: written with Claude (Anthropic); reviewed and tested by me.
export function isValidCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}
