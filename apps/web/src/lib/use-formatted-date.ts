import { useEffect, useState } from "react";

export function useFormattedDate(
  value: string | undefined,
  formatter: Intl.DateTimeFormat
): string {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    if (!value) {
      setFormattedDate("");
      return;
    }

    setFormattedDate(formatter.format(new Date(value)));
  }, [formatter, value]);

  return formattedDate;
}
