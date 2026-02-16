import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MainTabs from './MainTabs';
import { TOPIC_COLORS } from '../utils/TopicColors';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../utils/i18n/i18n';

function CustomDrawerContent(props) {
  const { navigation } = props;
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = React.useState(false);
  const [languageOpen, setLanguageOpen] = React.useState(false);

  const { theme, toggleTheme } = useTheme();
  const tTheme = getTheme(theme);

  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageChange = async (lang) => {
    await changeLanguage(lang);
    setLanguageOpen(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[styles.content, { backgroundColor: tTheme.background }]}
      >
        {/* Topics */}
        <Box style={styles.drawerItem}>
          <TouchableOpacity
            style={styles.drawerRow}
            activeOpacity={0.7}
            onPress={() => setTopicsOpen((s) => !s)}
          >
            <Box style={styles.drawerRow}>
              <Ionicons name="list-outline" size={20} color={tTheme.text} />
              <Text style={[styles.drawerLabel, { color: tTheme.text }]}>{t('sidebartopics')}</Text>
            </Box>
            <Ionicons
              name={topicsOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={tTheme.secondaryText}
            />
          </TouchableOpacity>

          {topicsOpen && (
            <Box
              style={styles.topicsList}
              p="$3"
              mt="$1"
              bg={tTheme.cardBackground}
              rounded="md"
              shadow="1"
            >
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={styles.topicInnerRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    navigation.closeDrawer?.();
                    navigation.navigate('Home', { topic });
                  }}
                >
                  <Box style={styles.topicInnerRowContent}>
                    <Text style={[styles.topicLabel, { color: tTheme.secondaryText }]} numberOfLines={1}>
                      {topic}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </Box>
          )}
        </Box>

        <Box style={[styles.separator, { backgroundColor: tTheme.rowBorder }]} />

        {/* Language Picker */}
        <Box style={styles.drawerItem}>
          <TouchableOpacity
            style={styles.drawerRow}
            activeOpacity={0.7}
            onPress={() => setLanguageOpen((s) => !s)}
          >
            <Box style={styles.drawerRow}>
              <Ionicons name="language-outline" size={20} color={tTheme.text} />
              <Text style={[styles.drawerLabel, { color: tTheme.text }]}>
                {currentLanguage === 'en' ? 'English' : 'Finnish'}
              </Text>
            </Box>
            <Ionicons
              name={languageOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={tTheme.secondaryText}
            />
          </TouchableOpacity>

          {languageOpen && (
            <Box
              style={styles.topicsList}
              p="$2"
              mt="$1"
              bg={tTheme.cardBackground}
              rounded="md"
              shadow="1"
            >
              {['en', 'fi'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.topicInnerRowContent, { paddingVertical: 10 }]}
                  activeOpacity={0.7}
                  onPress={() => handleLanguageChange(lang)}
                >
                  <Text style={[styles.topicLabel, { color: tTheme.secondaryText }]}>
                    {lang === 'en' ? 'English' : 'Finnish'}
                  </Text>
                </TouchableOpacity>
              ))}
            </Box>
          )}
        </Box>

        <Box style={[styles.separator, { backgroundColor: tTheme.rowBorder }]} />

        {/* Dark Mode */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" p="$3">
          <Box flexDirection="row" alignItems="center">
            <Ionicons name="moon-outline" size={20} color={tTheme.moonIconColor} />
            <Text style={[styles.drawerLabel, { color: tTheme.text }]}>{t('dark_mode')}</Text>
          </Box>
          <Switch size="md" isChecked={tTheme.isDark} onToggle={toggleTheme} />
        </Box>
      </DrawerContentScrollView>
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function Sidebar({ route, navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);

  React.useEffect(() => {
    const shouldOpen = route?.params?.openDrawer;
    if (shouldOpen) {
      navigation.openDrawer?.();
      const parent = navigation.getParent?.();
      parent?.setParams({ openDrawer: false });
    }
  }, [route?.params?.openDrawer]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent key={theme} {...props} />}
      screenOptions={{ headerShown: false, drawerActiveTintColor: t.text }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  drawerItem: { paddingTop: 12, paddingHorizontal: 4, borderRadius: 8 },
  drawerRow: { flexDirection: 'row', alignItems: 'center' },
  drawerLabel: { marginLeft: 8, fontSize: 16, fontWeight: '500' },
  topicsList: {
    marginTop: 8,
    paddingLeft: 12,
    borderRadius: 6,
    paddingVertical: 4,
    elevation: 1,
  },
  topicInnerRow: { marginBottom: 0, borderBottomWidth: 0 },
  topicInnerRowContent: { paddingVertical: 10, paddingHorizontal: 6, paddingLeft: 12 },
  topicLabel: { fontSize: 14, lineHeight: 20 },
  separator: { height: 1, marginVertical: 10 },
});
