import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';

export function OpenSourceLicensesScreen({ navigation }) {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const { t } = useTranslation();

  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          t('common.error'),
          t('openSource.cannotOpenLink')
        );
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('openSource.failedToOpenLink', { message: error.message })
      );
    }
  };

  const licenses = [
    {
      name: '@expo/html-elements',
      version: '0.12.5',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: '@expo/vector-icons',
      version: '15.0.3',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: '@gluestack-style/react',
      version: '1.0.57',
      license: 'MIT',
      author: 'Gluestack',
      url: 'https://github.com/gluestack/gluestack-ui'
    },
    {
      name: '@gluestack-ui/core',
      version: '3.0.10',
      license: 'MIT',
      author: 'Gluestack',
      url: 'https://github.com/gluestack/gluestack-ui'
    },
    {
      name: '@gluestack-ui/themed',
      version: '1.1.73',
      license: 'MIT',
      author: 'Gluestack',
      url: 'https://github.com/gluestack/gluestack-ui'
    },
    {
      name: '@gluestack-ui/utils',
      version: '3.0.11',
      license: 'MIT',
      author: 'Gluestack',
      url: 'https://github.com/gluestack/gluestack-ui'
    },
    {
      name: '@gorhom/bottom-sheet',
      version: '5.0.0-alpha.11',
      license: 'MIT',
      author: 'Gorhom',
      url: 'https://github.com/gorhom/bottom-sheet'
    },
    {
      name: '@legendapp/motion',
      version: '2.4.0',
      license: 'MIT',
      author: 'Legend',
      url: 'https://github.com/LegendApp/legend'
    },
    {
      name: '@react-native-async-storage/async-storage',
      version: '2.2.0',
      license: 'MIT',
      author: 'React Native Community',
      url: 'https://github.com/react-native-async-storage/async-storage'
    },
    {
      name: '@react-native-community/checkbox',
      version: '0.5.20',
      license: 'MIT',
      author: 'React Native Community',
      url: 'https://github.com/react-native-community/react-native-checkbox'
    },
    {
      name: '@react-native-community/datetimepicker',
      version: '8.4.4',
      license: 'MIT',
      author: 'React Native Community',
      url: 'https://github.com/react-native-community/react-native-datetimepicker'
    },
    {
      name: '@react-navigation/bottom-tabs',
      version: '7.8.1',
      license: 'MIT',
      author: 'React Navigation',
      url: 'https://github.com/react-navigation/react-navigation'
    },
    {
      name: '@react-navigation/drawer',
      version: '7',
      license: 'MIT',
      author: 'React Navigation',
      url: 'https://github.com/react-navigation/react-navigation'
    },
    {
      name: '@react-navigation/native',
      version: '7',
      license: 'MIT',
      author: 'React Navigation',
      url: 'https://github.com/react-navigation/react-navigation'
    },
    {
      name: '@react-navigation/native-stack',
      version: '7',
      license: 'MIT',
      author: 'React Navigation',
      url: 'https://github.com/react-navigation/react-navigation'
    },
    {
      name: 'axios',
      version: '1.13.2',
      license: 'MIT',
      author: 'Matt Zabriskie',
      url: 'https://github.com/axios/axios'
    },
    {
      name: 'babel-plugin-module-resolver',
      version: '5.0.2',
      license: 'MIT',
      author: 'Tleuyen',
      url: 'https://github.com/tleunen/babel-plugin-module-resolver'
    },
    {
      name: 'date-fns',
      version: '4.1.0',
      license: 'MIT',
      author: 'Sasha Koss',
      url: 'https://github.com/date-fns/date-fns'
    },
    {
      name: 'expo',
      version: '54.0.23',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-blur',
      version: '15.0.8',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-checkbox',
      version: '5.0.7',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-font',
      version: '14.0.9',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-image-picker',
      version: '17.0.8',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-linear-gradient',
      version: '15.0.8',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-localization',
      version: '17.0.8',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-navigation-bar',
      version: '5.0.9',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-secure-store',
      version: '15.0.7',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-splash-screen',
      version: '31.0.11',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'expo-status-bar',
      version: '3.0.8',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo'
    },
    {
      name: 'i18next',
      version: '25.7.2',
      license: 'MIT',
      author: 'i18next',
      url: 'https://github.com/i18next/i18next'
    },
    {
      name: 'jwt-decode',
      version: '4.0.0',
      license: 'MIT',
      author: 'Auth0',
      url: 'https://github.com/auth0/jwt-decode'
    },
    {
      name: 'lucide-react-native',
      version: '0.510.0',
      license: 'MIT',
      author: 'Lucide',
      url: 'https://github.com/lucide-icons/lucide'
    },
    {
      name: 'nativewind',
      version: '4.1.23',
      license: 'MIT',
      author: 'Marvin Lohmann',
      url: 'https://github.com/marklawlor/nativewind'
    },
    {
      name: 'react',
      version: '19.1.0',
      license: 'MIT',
      author: 'Meta Platforms, Inc.',
      url: 'https://github.com/facebook/react'
    },
    {
      name: 'react-aria',
      version: '3.33.0',
      license: 'Apache 2.0',
      author: 'Adobe',
      url: 'https://github.com/adobe/react-spectrum'
    },
    {
      name: 'react-dom',
      version: '19.1.0',
      license: 'MIT',
      author: 'Meta Platforms, Inc.',
      url: 'https://github.com/facebook/react'
    },
    {
      name: 'react-i18next',
      version: '16.4.0',
      license: 'MIT',
      author: 'i18next',
      url: 'https://github.com/i18next/react-i18next'
    },
    {
      name: 'react-native',
      version: '0.81.5',
      license: 'MIT',
      author: 'Meta Platforms, Inc.',
      url: 'https://github.com/facebook/react-native'
    },
    {
      name: 'react-native-dotenv',
      version: '3.4.11',
      license: 'MIT',
      author: 'ENNGAGE',
      url: 'https://github.com/enngage/react-native-dotenv'
    },
    {
      name: 'react-native-gesture-handler',
      version: '2.28.0',
      license: 'MIT',
      author: 'Software Mansion',
      url: 'https://github.com/software-mansion/react-native-gesture-handler'
    },
    {
      name: 'react-native-reanimated',
      version: '4.1.0',
      license: 'MIT',
      author: 'Software Mansion',
      url: 'https://github.com/software-mansion/react-native-reanimated'
    },
    {
      name: 'react-native-safe-area-context',
      version: '5.6.1',
      license: 'MIT',
      author: 'Th3rd',
      url: 'https://github.com/th3rdwave/react-native-safe-area-context'
    },
    {
      name: 'react-native-screens',
      version: '4.16.0',
      license: 'MIT',
      author: 'Software Mansion',
      url: 'https://github.com/software-mansion/react-native-screens'
    },
    {
      name: 'react-native-svg',
      version: '15.12.1',
      license: 'MIT',
      author: 'react-native-svg contributors',
      url: 'https://github.com/react-native-svg/react-native-svg'
    },
    {
      name: 'react-native-svg-transformer',
      version: '1.5.2',
      license: 'MIT',
      author: 'Nenad Gledic',
      url: 'https://github.com/nenad/react-native-svg-transformer'
    },
    {
      name: 'react-native-vector-icons',
      version: '10.3.0',
      license: 'MIT',
      author: 'Oblador',
      url: 'https://github.com/oblador/react-native-vector-icons'
    },
    {
      name: 'react-native-web',
      version: '0.21.0',
      license: 'MIT',
      author: 'Nicolas Gallagher',
      url: 'https://github.com/necolas/react-native-web'
    },
    {
      name: 'react-native-worklets',
      version: '0.5.1',
      license: 'MIT',
      author: 'react-native-worklets contributors',
      url: 'https://github.com/margelo/react-native-worklets'
    },
    {
      name: 'react-stately',
      version: '3.39.0',
      license: 'Apache 2.0',
      author: 'Adobe',
      url: 'https://github.com/adobe/react-spectrum'
    },
    {
      name: 'tailwind-variants',
      version: '0.1.20',
      license: 'MIT',
      author: 'Jepser Bernado',
      url: 'https://github.com/nextui-org/tailwind-variants'
    },
    {
      name: 'tailwindcss',
      version: '3.4.17',
      license: 'MIT',
      author: 'Tailwind Labs',
      url: 'https://github.com/tailwindlabs/tailwindcss'
    }
  ];

  const getLicenseColor = (license) => {
    if (license === 'MIT') return 'rgb(34, 197, 94)'; // Green
    if (license === 'Apache 2.0') return 'rgb(59, 130, 246)'; // Blue
    return 'rgb(168, 85, 247)'; // Purple for others
  };

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: tTheme.cardBackground,
            borderBottomColor: tTheme.rowBorder,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={tTheme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: tTheme.text }]}>
          {t('openSource.title')}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Intro */}
        <View
          style={[
            styles.intro,
            {
              backgroundColor: tTheme.isDark
                ? 'rgba(99, 102, 241, 0.1)'
                : 'rgba(99, 102, 241, 0.05)',
              borderColor: tTheme.rowBorder,
            },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color="rgb(99, 102, 241)"
          />
          <Text
            style={[styles.introText, { color: tTheme.secondaryText }]}
          >
            {t('openSource.intro')}
          </Text>
        </View>

        {/* Stats */}
        <Text style={[styles.statsText, { color: tTheme.secondaryText }]}>
          {t('openSource.stats', { count: licenses.length })}
        </Text>

        {/* License Cards */}
        {licenses.map((pkg, index) => (
          <View
            key={index}
            style={[
              styles.licenseCard,
              {
                backgroundColor: tTheme.cardBackground,
                borderColor: tTheme.rowBorder,
              },
            ]}
          >
            <View style={styles.licenseHeader}>
              <View style={styles.licenseInfo}>
                <Text
                  style={[styles.packageName, { color: tTheme.text }]}
                  numberOfLines={1}
                >
                  {pkg.name}
                </Text>
                <Text
                  style={[styles.packageAuthor, { color: tTheme.secondaryText }]}
                >
                  {pkg.author}
                </Text>
              </View>

              <View
                style={[
                  styles.licenseBadge,
                  { backgroundColor: getLicenseColor(pkg.license) },
                ]}
              >
                <Text style={styles.licenseBadgeText}>
                  {pkg.license}
                </Text>
              </View>
            </View>

            <Text style={[styles.version, { color: tTheme.secondaryText }]}>
              {t('openSource.version', { version: pkg.version })}
            </Text>

            <TouchableOpacity
              onPress={() => openURL(pkg.url)}
              style={[
                styles.linkButton,
                { borderColor: 'rgb(99, 102, 241)' },
              ]}
            >
              <Ionicons
                name="open-outline"
                size={14}
                color="rgb(99, 102, 241)"
              />
              <Text
                style={[styles.linkText, { color: 'rgb(99, 102, 241)' }]}
              >
                {t('openSource.viewOnGithub')}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Footer */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: tTheme.isDark
                ? 'rgba(100, 100, 100, 0.1)'
                : 'rgba(0, 0, 0, 0.05)',
              borderColor: tTheme.rowBorder,
            },
          ]}
        >
          <Text style={[styles.footerTitle, { color: tTheme.text }]}>
            {t('openSource.mitTitle')}
          </Text>

          <Text style={[styles.footerText, { color: tTheme.secondaryText }]}>
            {t('openSource.mitDescription')}
          </Text>

          <Text
            style={[
              styles.footerTitle,
              { color: tTheme.text, marginTop: 16 },
            ]}
          >
            {t('openSource.apacheTitle')}
          </Text>

          <Text style={[styles.footerText, { color: tTheme.secondaryText }]}>
            {t('openSource.apacheDescription')}
          </Text>

          <Text style={[styles.thankYou, { color: tTheme.text }]}>
            {t('openSource.thankYou')}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  intro: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  introText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  licenseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  licenseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  licenseInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  packageAuthor: {
    fontSize: 12,
    fontWeight: '500',
  },
  licenseBadge: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  licenseBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  version: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
    width: '100%',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  thankYou: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});