export const getTopicColors = (topic) => {
    const colors = {
        'asuminen ja rakentaminen': { bg: '#DBEAFE', text: '#1E40AF', en: 'Housing and Construction' },
        'kulttuuri ja vapaa-aika': { bg: '#E0E7FF', text: '#3730A3', en: 'Culture and Leisure' },
        'liikenne ja kadut': { bg: '#FEE2E2', text: '#B91C1C', en: 'Transport and Streets' },
        'liikunta ja luonto': { bg: '#DCFCE7', text: '#166534', en: 'Sports and Nature' },
        'kasvatus ja opetus': { bg: '#FEF9C3', text: '#854D0E', en: 'Education and Teaching' },
        'työelämä': { bg: '#E0F2FE', text: '#075985', en: 'Work Life' },
        'kaupunki ja päätöksenteko': { bg: '#EDE9FE', text: '#4C1D95', en: 'City and Governance' },
        'yritykset': { bg: '#FFE4E6', text: '#9D174D', en: 'Businesses' },
        'matkailu': { bg: '#FFEDD5', text: '#9A3412', en: 'Tourism' },
        'luonto ja kestävä kehitys': { bg: '#DCFCE7', text: '#166534', en: 'Nature and Sustainability' },
        'osallistu': { bg: '#F3E8FF', text: '#6B21A8', en: 'Participate' },
        'tuoreimmat': { bg: '#F1F5F9', text: '#0F172A', en: 'Latest' },
    };

    return colors[topic?.toLowerCase()] || { bg: '#F3F4F6', text: '#374151', en: 'Unknown' };
};

// Export the map for other modules that iterate available topics (backwards compatible)
export const TOPIC_COLORS = {
    'asuminen ja rakentaminen': { bg: '#DBEAFE', text: '#1E40AF', en: 'Housing and Construction' },
    'kulttuuri ja vapaa-aika': { bg: '#F3E8FF', text: '#6B21A8', en: 'Culture and Leisure' },
    'liikenne ja kadut': { bg: '#FEE2E2', text: '#B91C1C', en: 'Transport and Streets' },
    'liikunta ja luonto': { bg: '#DCFCE7', text: '#166534', en: 'Sports and Nature' },
    'kasvatus ja opetus': { bg: '#FEF9C3', text: '#854D0E', en: 'Education and Teaching' },
    'työelämä': { bg: '#E0F2FE', text: '#075985', en: 'Work Life' },
    'kaupunki ja päätöksenteko': { bg: '#EDE9FE', text: '#4C1D95', en: 'City and Governance' },
    'yritykset': { bg: '#FFE4E6', text: '#9D174D', en: 'Businesses' },
    'matkailu': { bg: '#FFEDD5', text: '#9A3412', en: 'Tourism' },
    'luonto ja kestävä kehitys': { bg: '#DCFCE7', text: '#166534', en: 'Nature and Sustainability' },
    'osallistu': { bg: '#E0E7FF', text: '#3730A3', en: 'Participate' },
    'tuoreimmat': { bg: '#F1F5F9', text: '#0F172A', en: 'Latest' },
};
