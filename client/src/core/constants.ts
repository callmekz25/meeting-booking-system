export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const HOURS = Array.from({ length: 24 }, (_, h) => {
  const date = new Date();
  date.setHours(h, 0, 0, 0);

  return {
    value: h,
    label: date.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
  };
});
