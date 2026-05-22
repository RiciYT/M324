export function useFormattedDate(
  value: string | undefined,
  formatter: Intl.DateTimeFormat
): string {
  if (!value) {
    return "";
  }

  return formatter.format(new Date(value));
}
