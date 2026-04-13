export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const fromIsoDate = (date: string): Date => new Date(`${date}T00:00:00`);

export const addDays = (date: Date, amount: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export const startOfWeekMonday = (date: Date): Date => {
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), offset);
};

export const weekDays = (weekStart: Date): Date[] => {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

export const isWeekend = (dateIso: string): boolean => {
  const day = fromIsoDate(dateIso).getDay();
  return day === 0 || day === 6;
};

export const shortDayName = (date: Date): string => {
  return new Intl.DateTimeFormat("es-CL", { weekday: "short" }).format(date);
};

export const formatDateLabel = (dateIso: string): string => {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit"
  }).format(fromIsoDate(dateIso));
};
