import type { TranslationKey } from './i18n';

export type EmployeeValues = { name: string; position: string; salary: number };
export function validateEmployeeForm(name: string, position: string, salary: string):
  { values: EmployeeValues; error?: never } | { error: TranslationKey; values?: never } {
  if (!name.trim() || !position.trim() || !salary.trim()) return { error: 'formRequired' };
  const numericSalary = Number(salary);
  if (!/^\d+(\.\d{1,2})?$/.test(salary.trim()) || !Number.isFinite(numericSalary) || numericSalary < 0 || numericSalary > Number.MAX_SAFE_INTEGER) {
    return { error: 'salaryInvalid' };
  }
  if ([name, position].some(value => [...value.trim()].length > 255)) return { error: 'fieldsTooLong' };
  return { values: { name: name.trim(), position: position.trim(), salary: numericSalary } };
}
