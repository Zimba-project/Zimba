export const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();

  const exact = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const diffMs = date - now;
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let relative = '';
  if (Math.abs(diffMinutes) < 60) {
    if (diffMinutes > 0) relative = `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    else if (diffMinutes === 0) relative = 'now';
    else relative = `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''} ago`;
  } else if (Math.abs(diffHours) < 24) {
    if (diffHours > 0) relative = `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    else relative = `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
  } else {
    if (diffDays > 0) relative = `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    else relative = `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
  }
  return `${exact} • ${relative}`;
};