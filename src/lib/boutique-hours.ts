/** Live boutique open/closed status for Palm Shades Osu (Africa/Accra). */

export type BoutiqueStatus = {
  isOpen: boolean;
  label: string;
  detail: string;
  todayHours: string;
};

const TZ = "Africa/Accra";

type DaySlot = {
  days: number[];
  open: number;
  close: number;
};

const SCHEDULE: DaySlot[] = [
  { days: [0], open: 12, close: 17 },
  { days: [1, 2, 3, 4, 5], open: 10, close: 19 },
  { days: [6], open: 10, close: 20 },
];

function nowInAccra(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${period}`;
}

export function getBoutiqueStatus(at: Date = nowInAccra()): BoutiqueStatus {
  const day = at.getDay();
  const hour = at.getHours() + at.getMinutes() / 60;
  const slot = SCHEDULE.find((s) => s.days.includes(day)) ?? SCHEDULE[1];

  const isOpen = hour >= slot.open && hour < slot.close;
  const todayHours = `${formatHour(slot.open)} — ${formatHour(slot.close)}`;

  if (isOpen) {
    return {
      isOpen: true,
      label: `Open until ${formatHour(slot.close)}`,
      detail: "Oxford Street, Osu · Accra",
      todayHours,
    };
  }

  if (hour < slot.open) {
    return {
      isOpen: false,
      label: `Opens at ${formatHour(slot.open)} today`,
      detail: "Oxford Street, Osu · Accra",
      todayHours,
    };
  }

  const tomorrow = new Date(at);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextSlot =
    SCHEDULE.find((s) => s.days.includes(tomorrow.getDay())) ?? SCHEDULE[1];

  return {
    isOpen: false,
    label: `Closed · Opens ${formatHour(nextSlot.open)}`,
    detail: "Oxford Street, Osu · Accra",
    todayHours,
  };
}

export const boutiqueDirectionsUrl =
  "https://www.google.com/maps/search/?api=1&query=Oxford+Street+Osu+Accra+Ghana";
