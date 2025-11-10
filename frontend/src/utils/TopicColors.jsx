export const getTopicColors = (topic) => {
    const colors = {
        'asuminen ja rakentaminen': { bg: '#DBEAFE', text: '#1E40AF' }, // blue
        'kulttuuri ja vapaa-aika': { bg: '#F3E8FF', text: '#6B21A8' }, // purple
        'liikenne ja kadut': { bg: '#FEE2E2', text: '#B91C1C' }, // red
        'liikunta ja luonto': { bg: '#DCFCE7', text: '#166534' }, // green
        'kasvatus ja opetus': { bg: '#FEF9C3', text: '#854D0E' }, // yellow
        'työelämä': { bg: '#E0F2FE', text: '#075985' }, // sky blue
        'kaupunki ja päätöksenteko': { bg: '#EDE9FE', text: '#4C1D95' }, // indigo
        'yritykset': { bg: '#FFE4E6', text: '#9D174D' }, // rose
        'matkailu': { bg: '#FFEDD5', text: '#9A3412' }, // orange
        'luonto ja kestävä kehitys': { bg: '#DCFCE7', text: '#166534' }, // greenish
        'osallistu': { bg: '#E0E7FF', text: '#3730A3' }, // indigo/blue
        'tureimmat': { bg: '#F1F5F9', text: '#0F172A' }, // gray
    };

    return colors[topic?.toLowerCase()] || { bg: '#F3F4F6', text: '#374151' }; // default gray
};

// Export the map for other modules that iterate available topics (backwards compatible)
export const TOPIC_COLORS = {
    'asuminen ja rakentaminen': { bg: '#DBEAFE', text: '#1E40AF' },
    'kulttuuri ja vapaa-aika': { bg: '#F3E8FF', text: '#6B21A8' },
    'liikenne ja kadut': { bg: '#FEE2E2', text: '#B91C1C' },
    'liikunta ja luonto': { bg: '#DCFCE7', text: '#166534' },
    'kasvatus ja opetus': { bg: '#FEF9C3', text: '#854D0E' },
    'työelämä': { bg: '#E0F2FE', text: '#075985' },
    'kaupunki ja päätöksenteko': { bg: '#EDE9FE', text: '#4C1D95' },
    'yritykset': { bg: '#FFE4E6', text: '#9D174D' },
    'matkailu': { bg: '#FFEDD5', text: '#9A3412' },
    'luonto ja kestävä kehitys': { bg: '#DCFCE7', text: '#166534' },
    'osallistu': { bg: '#E0E7FF', text: '#3730A3' },
    'tureimmat': { bg: '#F1F5F9', text: '#0F172A' },
};
