export const formatMonth = (currentDate: Date) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[currentDate.getMonth()]}, ${currentDate.getDate()} ${currentDate.getFullYear()}`;
};
