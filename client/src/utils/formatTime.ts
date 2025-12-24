export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
