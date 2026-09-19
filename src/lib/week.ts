/** Hospital work week is Sunday–Thursday (BRD §7.2 / §18.1). */
export function currentWeekRange(reference = new Date()) {
  const day = reference.getDay(); // 0 = Sunday
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day);

  const end = new Date(start);
  end.setDate(start.getDate() + 5); // exclusive upper bound (through Thursday night)

  return { start, end };
}
