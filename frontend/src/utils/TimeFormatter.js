export const formatTime = (isoString, t) => {
  if (!isoString || typeof t !== 'function') return '';

  const date = new Date(isoString);
  const now = new Date();

  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let relative = '';

  if (diffDays > 1) relative = t('time.days', { count: diffDays });
  else if (diffDays === 1) relative = t('time.yesterday');
  else if (diffHours > 1) relative = t('time.hours', { count: diffHours });
  else if (diffHours === 1) relative = t('time.hour');
  else if (diffMinutes > 1) relative = t('time.minutes', { count: diffMinutes });
  else relative = t('time.just_now');

  const exact = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${exact} • ${relative}`;
};
