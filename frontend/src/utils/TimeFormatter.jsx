export const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);

    const exact = date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric',});

    const diffDays = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    let relative = '';
    if (diffDays > 0) relative = `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    else if (diffDays === 0) relative = 'today';
    else relative = `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;

    return `${exact} • ${relative}`;
};