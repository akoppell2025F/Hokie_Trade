const VT_EMAIL = /^[A-Za-z0-9._%+-]+@vt\.edu$/i;

export function isVtEmail(value: string): boolean {
  return VT_EMAIL.test(value.trim());
}