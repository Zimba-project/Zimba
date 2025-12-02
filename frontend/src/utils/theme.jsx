export const getTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return {
    mode,
    isDark,

    // General colors
    background: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f9fafb' : '#1f2937',
    secondaryText: isDark ? '#f9fafb' : '#555',
    accent: '#2563eb', // buttons, highlights
    error: '#f87171',

    // Inputs
    inputBackground: isDark ? '#1f2937' : '#f9fafb',
    inputBorder: isDark ? '#374151' : '#d1d5db',
    placeholder: isDark ? '#9ca3af' : '#6b7280',

    // StatusBar
    statusBarStyle: isDark ? 'light-content' : 'dark-content',
    
    // Inbox / list
    rowBackground: isDark ? '#1f2937' : '#ffffff',
    rowBorder: isDark ? '#374151' : '#e5e7eb',
    avatarBackground: '#6366f1',
    emptyBackground: isDark ? '#111827' : '#f9fafb',

    // Card background
    cardBackground: isDark ? '#1e293b' : '#ffffff',
    infoCardBackground: isDark ? '#1e293b' : '#fffef4',      
    infoCardBackgroundAlt: isDark ? '#334155' : '#fffef6',   
    // Theme toggle (moon icon)
    moonIconColor: isDark ? '#facc15' : '#2563eb', // golden yellow in dark mode, accent in light
    moonIconGlow: isDark ? '#facc15' : '#2563eb',  // optional glow color
  };
};
