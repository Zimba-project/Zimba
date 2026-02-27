import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MainTabs from './MainTabs';
import GroupsStack from './GroupsStack';
import {
  HelpScreen,
  ReportProblemScreen,
  ContactUsScreen,
  FeedbackScreen,
  TermsOfServiceScreen,
  PrivacyPolicyScreen,
  CommunityGuidelinesScreen,
} from '../screens/Supportlegalscreens';
import { TOPIC_COLORS, getTopicColors } from '../utils/TopicColors';
import { TOPIC_ICONS } from '../utils/TopicIcons';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../utils/i18n/i18n';
import { OpenSourceLicensesScreen } from '../screens/Opensourcelicensesscreen';

// Enable layout animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CollapsibleSection({ icon, label, isOpen, onToggle, children, tTheme, showBorder = true }) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
      );
    }

    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <>
      <TouchableOpacity
        style={[styles.sectionHeader, { backgroundColor: tTheme.background }]}
        activeOpacity={0.6}
        onPress={onToggle}
      >
        <View style={styles.sectionHeaderLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: tTheme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
            ]}
          >
            <Ionicons name={icon} size={18} color={tTheme.text} />
          </View>
          <Text style={[styles.sectionLabel, { color: tTheme.text }]}>{label}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons name="chevron-down" size={20} color={tTheme.secondaryText} />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && <View style={styles.sectionContent}>{children}</View>}

      {showBorder && <View style={[styles.divider, { backgroundColor: tTheme.rowBorder }]} />}
    </>
  );
}

function CustomDrawerContent(props) {
  const { navigation } = props;
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: tTheme.rowBorder }]}>
        <View
          style={[
            styles.headerGradient,
            {
              backgroundColor: tTheme.isDark
                ? 'rgba(99, 102, 241, 0.15)'
                : 'rgba(99, 102, 241, 0.08)',
            },
          ]}
        >
          <Ionicons name="compass-outline" size={28} color={tTheme.text} />
          <Text style={[styles.appName, { color: tTheme.text }]}>Menu</Text>
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: tTheme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Topics Section */}
        <CollapsibleSection
          icon="list-outline"
          label={t('sidebartopics') || 'Topics'}
          isOpen={topicsOpen}
          onToggle={() => setTopicsOpen(!topicsOpen)}
          tTheme={tTheme}
          showBorder={true}
        >
          <View style={styles.topicsGrid}>
            {topics.map((topic) => {
              const colors = getTopicColors(topic);
              const iconName = TOPIC_ICONS[topic?.toLowerCase()] || 'bookmark';
              
              return (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.topicButton,
                    {
                      backgroundColor: colors.bg,
                      borderColor: colors.text,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    navigation.closeDrawer?.();
                    navigation.navigate('Home', { topic });
                  }}
                >
                  <Ionicons
                    name={iconName}
                    size={16}
                    color={colors.text}
                    style={styles.topicIcon}
                  />
                  <Text
                    style={[styles.topicButtonText, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </CollapsibleSection>

        {/* Groups Section */}
        <TouchableOpacity
          style={[styles.sectionHeader, { backgroundColor: tTheme.background }]}
          activeOpacity={0.6}
          onPress={() => navigation.navigate('Groups')}
        >
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: tTheme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Ionicons name="people-outline" size={18} color={tTheme.text} />
            </View>
            <Text style={[styles.sectionLabel, { color: tTheme.text }]}>
              {t('groups') || 'Groups'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={tTheme.secondaryText} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: tTheme.rowBorder }]} />

        {/* Language Section */}
        <CollapsibleSection
          icon="language-outline"
          label={currentLanguage === 'en' ? 'English' : 'Finnish'}
          isOpen={languageOpen}
          onToggle={() => setLanguageOpen(!languageOpen)}
          tTheme={tTheme}
          showBorder={true}
        >
          <View style={styles.languageList}>
            {['en', 'fi'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      currentLanguage === lang
                        ? tTheme.isDark
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(99, 102, 241, 0.1)'
                        : 'transparent',
                    borderLeftColor: currentLanguage === lang ? 'rgb(99, 102, 241)' : 'transparent',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleLanguageChange(lang)}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    {
                      color: currentLanguage === lang ? tTheme.text : tTheme.secondaryText,
                      fontWeight: currentLanguage === lang ? '600' : '500',
                    },
                  ]}
                >
                  {lang === 'en' ? '🇬🇧 English' : '🇫🇮 Finnish'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </CollapsibleSection>

        {/* Theme Toggle */}
        <View style={styles.themeSection}>
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: tTheme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Ionicons
                name={tTheme.isDark ? 'moon' : 'sunny'}
                size={18}
                color={tTheme.isDark ? '#FDB813' : '#FF9500'}
              />
            </View>
            <Text style={[styles.sectionLabel, { color: tTheme.text }]}>
              {t('dark_mode') || 'Dark Mode'}
            </Text>
          </View>
          <Switch size="md" isChecked={tTheme.isDark} onToggle={toggleTheme} />
        </View>

        <View style={[styles.divider, { backgroundColor: tTheme.rowBorder }]} />

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={[styles.supportSectionTitle, { color: tTheme.secondaryText }]}>
            {t('support') || 'Support'}
          </Text>

          <TouchableOpacity
            style={[styles.supportButton, { borderBottomColor: tTheme.rowBorder }]}
            activeOpacity={0.6}
            onPress={() => {
              // Navigate to help/FAQ
              navigation.closeDrawer?.();
              navigation.navigate('Help');
            }}
          >
            <Ionicons name="help-circle-outline" size={18} color={tTheme.text} />
            <Text style={[styles.supportButtonText, { color: tTheme.text }]}>
              {t('help_faq') || 'Help & FAQ'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.supportButton, { borderBottomColor: tTheme.rowBorder }]}
            activeOpacity={0.6}
            onPress={() => {
              // Navigate to report problem
              navigation.closeDrawer?.();
              navigation.navigate('ReportProblem');
            }}
          >
            <Ionicons name="bug-outline" size={18} color={tTheme.text} />
            <Text style={[styles.supportButtonText, { color: tTheme.text }]}>
              {t('report_problem') || 'Report Problem'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.supportButton, { borderBottomColor: tTheme.rowBorder }]}
            activeOpacity={0.6}
            onPress={() => {
              // Navigate to contact us
              navigation.closeDrawer?.();
              navigation.navigate('ContactUs');
            }}
          >
            <Ionicons name="mail-outline" size={18} color={tTheme.text} />
            <Text style={[styles.supportButtonText, { color: tTheme.text }]}>
              {t('contact_us') || 'Contact Us'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            activeOpacity={0.6}
            onPress={() => {
              // Navigate to send feedback
              navigation.closeDrawer?.();
              navigation.navigate('Feedback');
            }}
          >
            <Ionicons name="chatbubble-outline" size={18} color={tTheme.text} />
            <Text style={[styles.supportButtonText, { color: tTheme.text }]}>
              {t('send_feedback') || 'Send Feedback'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: tTheme.rowBorder }]} />

        {/* Legal Section */}
        <View style={styles.legalSection}>
          <TouchableOpacity
            style={[styles.legalButton, { borderBottomColor: tTheme.rowBorder }]}
            activeOpacity={0.6}
            onPress={() => {
              navigation.closeDrawer?.();
              navigation.navigate('TermsOfService');
            }}
          >
            <Text style={[styles.legalButtonText, { color: tTheme.secondaryText }]}>
              {t('terms_of_service') || 'Terms of Service'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.legalButton, { borderBottomColor: tTheme.rowBorder }]}
            activeOpacity={0.6}
            onPress={() => {
              navigation.closeDrawer?.();
              navigation.navigate('PrivacyPolicy');
            }}
          >
            <Text style={[styles.legalButtonText, { color: tTheme.secondaryText }]}>
              {t('privacy_policy') || 'Privacy Policy'}
            </Text>
          </TouchableOpacity>
          
           <TouchableOpacity
            style={[styles.legalButton, { borderBottomColor: tTheme.rowBorder }]}
            activeOpacity={0.6}
            onPress={() => {
              navigation.closeDrawer?.();
              navigation.navigate('OpenSourceLicenses');
            }}
          >
            <Text style={[styles.legalButtonText, { color: tTheme.secondaryText }]}>
              {t('open_source_licenses') || 'Open Source Licenses'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalButton}
            activeOpacity={0.6}
            onPress={() => {
              navigation.closeDrawer?.();
              navigation.navigate('CommunityGuidelines');
            }}
          >
            <Text style={[styles.legalButtonText, { color: tTheme.secondaryText }]}>
              {t('community_guidelines') || 'Community Guidelines'}
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: tTheme.rowBorder }]}>
        <Text style={[styles.footerText, { color: tTheme.secondaryText }]}>Zimba v1.0.0</Text>
      </View>
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
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: t.text,
        drawerWidth: 280,
        drawerType: 'front',
      }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen name="Groups" component={GroupsStack} options={{ headerShown: false }} />
      
      {/* Support Screens */}
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="ReportProblem"
        component={ReportProblemScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="ContactUs"
        component={ContactUsScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      
      {/* Legal Screens */}
      <Drawer.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="OpenSourceLicenses"
        component={OpenSourceLicensesScreen}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="CommunityGuidelines"
        component={CommunityGuidelinesScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sectionContent: {
    marginLeft: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  topicsGrid: {
    flexDirection: 'column',
    gap: 8,
    paddingBottom: 8,
  },
  topicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 10,
  },
  topicIcon: {
    marginRight: 2,
  },
  topicButtonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  languageList: {
    flexDirection: 'column',
    gap: 6,
    paddingBottom: 8,
  },
  languageButton: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginHorizontal: 0,
  },
  languageButtonText: {
    fontSize: 14,
  },
  themeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 12,

    borderRadius: 8,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  supportSection: {
    paddingVertical: 8,
  },
  supportSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  legalSection: {
    paddingVertical: 8,
  },
  legalButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  legalButtonText: {
    fontSize: 12,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});