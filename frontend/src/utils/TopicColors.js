export const TOPIC_COLORS = {
  'asuminen ja rakentaminen': { bg: '#DBEAFE', text: '#1E40AF' },
  'kulttuuri ja vapaa-aika': { bg: '#E0E7FF', text: '#3730A3' },
  'liikenne ja kadut': { bg: '#FEE2E2', text: '#B91C1C' },
  'liikunta ja luonto': { bg: '#DCFCE7', text: '#166534' },
  'kasvatus ja opetus': { bg: '#FEF9C3', text: '#854D0E' },
  'työelämä': { bg: '#E0F2FE', text: '#075985' },
  'kaupunki ja päätöksenteko': { bg: '#EDE9FE', text: '#4C1D95' },
  'yritykset': { bg: '#FFE4E6', text: '#9D174D' },
  'matkailu': { bg: '#FFEDD5', text: '#9A3412' },
  'luonto ja kestävä kehitys': { bg: '#DCFCE7', text: '#166534' },
  'osallistu': { bg: '#F3E8FF', text: '#6B21A8' },
  'tuoreimmat': { bg: '#F1F5F9', text: '#0F172A' },
};

export const getTopicColors = (topic) => {
  return TOPIC_COLORS[topic?.toLowerCase()] || { bg: '#F3F4F6', text: '#374151' };
};
