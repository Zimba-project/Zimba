import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';

export function HelpScreen({ navigation }) {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      <View style={[styles.header, { backgroundColor: tTheme.cardBackground, borderBottomColor: tTheme.rowBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={tTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tTheme.text }]}>{t('help_faq') || 'Help & FAQ'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>Frequently Asked Questions</Text>

        <View style={[styles.faqItem, { backgroundColor: tTheme.cardBackground, borderColor: tTheme.rowBorder }]}>
          <Text style={[styles.faqQuestion, { color: tTheme.text }]}>How do I create a new topic?</Text>
          <Text style={[styles.faqAnswer, { color: tTheme.secondaryText }]}>
            Navigate to your desired category and tap the "Create" button. Fill in the required information and submit.
          </Text>
        </View>

        <View style={[styles.faqItem, { backgroundColor: tTheme.cardBackground, borderColor: tTheme.rowBorder }]}>
          <Text style={[styles.faqQuestion, { color: tTheme.text }]}>How can I report inappropriate content?</Text>
          <Text style={[styles.faqAnswer, { color: tTheme.secondaryText }]}>
            Tap the three-dot menu on any post and select "Report". Choose the reason and submit your report.
          </Text>
        </View>

        <View style={[styles.faqItem, { backgroundColor: tTheme.cardBackground, borderColor: tTheme.rowBorder }]}>
          <Text style={[styles.faqQuestion, { color: tTheme.text }]}>Can I edit my posts?</Text>
          <Text style={[styles.faqAnswer, { color: tTheme.secondaryText }]}>
            Yes, you can edit your posts within 24 hours. Tap the three-dot menu and select "Edit".
          </Text>
        </View>

        <View style={[styles.faqItem, { backgroundColor: tTheme.cardBackground, borderColor: tTheme.rowBorder }]}>
          <Text style={[styles.faqQuestion, { color: tTheme.text }]}>How do I delete my account?</Text>
          <Text style={[styles.faqAnswer, { color: tTheme.secondaryText }]}>
            Go to Settings {'>'} Account {'>'} Delete Account. Note: This action is permanent and cannot be undone.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export function ReportProblemScreen({ navigation }) {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  const categories = [
    { id: 'app_crash', label: 'App Crash', icon: 'alert-circle-outline' },
    { id: 'performance', label: 'Performance Issue', icon: 'speedometer-outline' },
    { id: 'ui_bug', label: 'UI/Display Bug', icon: 'eye-outline' },
    { id: 'loading', label: 'Loading Error', icon: 'cloud-outline' },
    { id: 'other', label: 'Other', icon: 'help-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      <View style={[styles.header, { backgroundColor: tTheme.cardBackground, borderBottomColor: tTheme.rowBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={tTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tTheme.text }]}>{t('report_problem') || 'Report Problem'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>What's the issue?</Text>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category.id ? 'rgba(99, 102, 241, 0.1)' : tTheme.cardBackground,
                borderColor: selectedCategory === category.id ? 'rgb(99, 102, 241)' : tTheme.rowBorder,
              },
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons name={category.icon} size={20} color={tTheme.text} />
            <Text style={[styles.categoryLabel, { color: tTheme.text }]}>{category.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: 'rgb(99, 102, 241)' }]}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export function ContactUsScreen({ navigation }) {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      <View style={[styles.header, { backgroundColor: tTheme.cardBackground, borderBottomColor: tTheme.rowBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={tTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tTheme.text }]}>{t('contact_us') || 'Contact Us'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.contactCard, { backgroundColor: tTheme.cardBackground, borderColor: tTheme.rowBorder }]}>
          <Ionicons name="mail-outline" size={28} color={tTheme.text} />
          <Text style={[styles.contactTitle, { color: tTheme.text }]}>Email Support</Text>
          <Text style={[styles.contactValue, { color: 'rgb(99, 102, 241)' }]}>support@example.com</Text>
        </View>

        <View style={[styles.contactCard, { backgroundColor: tTheme.cardBackground, borderColor: tTheme.rowBorder }]}>
          <Ionicons name="call-outline" size={28} color={tTheme.text} />
          <Text style={[styles.contactTitle, { color: tTheme.text }]}>Phone Support</Text>
          <Text style={[styles.contactValue, { color: 'rgb(99, 102, 241)' }]}>+1 (555) 123-4567</Text>
        </View>

        <View style={[styles.contactCard, { backgroundColor: tTheme.cardBackground, borderColor: tTheme.rowBorder }]}>
          <Ionicons name="location-outline" size={28} color={tTheme.text} />
          <Text style={[styles.contactTitle, { color: tTheme.text }]}>Office Address</Text>
          <Text style={[styles.contactValue, { color: tTheme.secondaryText }]}>123 Main Street, City, State 12345</Text>
        </View>

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: 'rgb(99, 102, 241)' }]}>
          <Text style={styles.submitButtonText}>Send Email</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export function FeedbackScreen({ navigation }) {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      <View style={[styles.header, { backgroundColor: tTheme.cardBackground, borderBottomColor: tTheme.rowBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={tTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tTheme.text }]}>{t('send_feedback') || 'Send Feedback'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: tTheme.secondaryText }]}>
          We'd love to hear from you! Share your feedback, suggestions, or feature requests to help us improve.
        </Text>
      </ScrollView>
    </View>
  );
}

export function TermsOfServiceScreen({ navigation }) {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      <View style={[styles.header, { backgroundColor: tTheme.cardBackground, borderBottomColor: tTheme.rowBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={tTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tTheme.text }]}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lastUpdated, { color: tTheme.secondaryText }]}>Last Updated: 27th of February 2026 </Text>

        {/* 1. Acceptance of Terms */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          By downloading, installing, or using this application ("App"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. If you do not agree to these Terms, you may not use the App. Your continued use of the App indicates your acceptance of these Terms.
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          These Terms apply to all users, including casual browsers, registered users, and contributors.
        </Text>

        {/* 2. License Grant */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>2. License & Usage Rights</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          We grant you a personal, non-exclusive, non-transferable, revocable license to use the App solely for your personal, non-commercial purposes. You may not:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Modify, reverse engineer, or decompile the App</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Copy, rent, lease, or resell the App or any part of it</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Use the App for commercial purposes without authorization</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Create derivative works or translate the App</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Attempt to gain unauthorized access to the App's systems</Text>
        </View>

        {/* 3. User Accounts */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>3. User Accounts & Registration</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          If you create an account with us, you are responsible for:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Providing accurate, complete, and truthful information</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Maintaining the confidentiality of your password</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Notifying us immediately of any unauthorized access</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• All activities that occur under your account</Text>
        </View>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          We reserve the right to suspend or terminate accounts that violate these Terms.
        </Text>

        {/* 4. Content Standards */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>4. User Content & Conduct</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          You agree not to post, upload, or transmit any content that:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Violates any applicable laws or regulations</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Infringes on intellectual property or privacy rights</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Contains hate speech, harassment, or discrimination</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Is obscene, vulgar, or sexually explicit</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Promotes violence, illegal activities, or self-harm</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Constitutes spam, phishing, or malware</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Contains misinformation or deliberately false claims</Text>
        </View>

        {/* 5. Intellectual Property */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>5. Intellectual Property Rights</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          The App, including all content, features, and functionality, is owned by us and is protected by international copyright, trademark, and other intellectual property laws.
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Your use of the App does not grant you ownership of any intellectual property rights in the App or its content. You retain all rights to any content you create, but grant us a worldwide, royalty-free license to use it.
        </Text>

        {/* 6. Third-Party Services */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>6. Third-Party Services & Links</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          The App may contain links to third-party websites and services that we do not control. We are not responsible for:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• The availability or accuracy of third-party content</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• The practices of third-party service providers</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Any loss or damage from using third-party services</Text>
        </View>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Your use of third-party services is governed by their terms and policies.
        </Text>

        {/* 7. Disclaimers */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>7. Disclaimers & Limitations</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          We do not warrant that:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• The App will be uninterrupted or error-free</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• The App will meet your specific requirements</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Any content is accurate or reliable</Text>
        </View>

        {/* 8. Limitation of Liability */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>8. Limitation of Liability</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Our total liability for any claim arising from or relating to these Terms shall not exceed the amounts you have paid to us in the past twelve months.
        </Text>

        {/* 9. Indemnification */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>9. Indemnification</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          You agree to indemnify, defend, and hold harmless us and our officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Your use of the App</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Your violation of these Terms</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Your violation of any law or third-party rights</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Content you create or upload</Text>
        </View>

        {/* 10. Data & Privacy */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>10. Data Collection & Privacy</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          We collect and process data as described in our Privacy Policy. By using the App, you consent to our data practices described in that policy. You are responsible for understanding what data we collect and how we use it.
        </Text>

        {/* 11. Compliance with App Store Policies */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>11. App Store Compliance</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          You acknowledge that the App is subject to the App Store Terms of Service of both Apple App Store and Google Play Store. Your use of the App is subject to:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Apple's App Store Terms of Service</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• Google Play Store's Terms of Service</Text>
          <Text style={[styles.bullet, { color: tTheme.secondaryText }]}>• All applicable laws and regulations</Text>
        </View>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          In the event of conflict between these Terms and App Store policies, the more restrictive provision will apply.
        </Text>

        {/* 12. Modifications to Terms */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>12. Modifications to Terms</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          We may modify these Terms at any time. We will notify you of material changes via email or through the App. Your continued use of the App after changes constitutes acceptance of the new Terms.
        </Text>

        {/* 13. Termination */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>13. Termination</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          We may terminate or suspend your access to the App immediately, without notice, for any reason, including if you violate these Terms. Upon termination, your right to use the App ceases immediately.
        </Text>

        {/* 14. Governing Law */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>14. Governing Law & Jurisdiction</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          These Terms shall be governed by and construed in accordance with the laws of your jurisdiction, excluding its conflicts of law principles. Any legal action or proceeding must be brought exclusively in the courts of your jurisdiction.
        </Text>

        {/* 15. Dispute Resolution */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>15. Dispute Resolution</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Before initiating formal legal proceedings, we encourage you to contact us to resolve any disputes. If we cannot resolve the issue within 30 days, either party may pursue legal remedies.
        </Text>

        {/* 16. Severability */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>16. Severability</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          If any provision of these Terms is found to be invalid or unenforceable, that provision shall be removed, and the remaining provisions shall remain in full force and effect.
        </Text>

        {/* 17. Entire Agreement */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>17. Entire Agreement</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          These Terms, together with our Privacy Policy and any other policies we publish, constitute the entire agreement between you and us regarding the App and supersede all prior agreements and understandings.
        </Text>

        {/* 18. Contact Information */}
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>18. Contact Us</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          If you have questions about these Terms of Service, please contact us at:
        </Text>
        <Text style={[styles.contactInfo, { color: 'rgb(99, 102, 241)' }]}>
          Email: legal@example.com{'\n'}
          Address: [Your Company Address]{'\n'}
          Website: www.example.com
        </Text>

        {/* Acknowledgment */}
        <View style={[styles.acknowledgment, { backgroundColor: tTheme.isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)', borderColor: 'rgb(99, 102, 241)' }]}>
          <Ionicons name="checkmark-circle" size={24} color="rgb(99, 102, 241)" />
          <Text style={[styles.acknowledgmentText, { color: tTheme.text }]}>
            By using this App, you acknowledge that you have read and agree to these Terms of Service.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

export function PrivacyPolicyScreen({ navigation }) {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      <View style={[styles.header, { backgroundColor: tTheme.cardBackground, borderBottomColor: tTheme.rowBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={tTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tTheme.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>
          1. Information We Collect
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          We collect information you provide directly, such as when you create an account, participate in polls, or submit content. 
          Poll responses are collected for analytical and community insight purposes.
        </Text>

        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>
          2. Poll Participation and Anonymity
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          When participating in polls, your responses are displayed anonymously to other users. 
          Poll data is aggregated to understand trends and community perspectives. 
          Individual users are not publicly identifiable through poll participation.
        </Text>

        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>
          3. How We Use Your Information
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Your information is used to operate and improve our services, enhance user experience, 
          analyze poll data in aggregated form, and comply with legal obligations.
        </Text>

        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>
          4. AI Assistance and Data Usage
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Our AI features are designed to help users better understand context and content within the app. 
          The AI does not store, retain, or independently collect personal user data. 
          Any information processed by AI is used solely to generate contextual assistance and is not used to profile users.
        </Text>

        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>
          5. Data Security
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          We implement appropriate technical and organizational security measures to protect your information 
          against unauthorized access, alteration, disclosure, or destruction.
        </Text>

        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>
          6. Your Rights
        </Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          You have the right to access, correct, or request deletion of your personal information. 
          For inquiries regarding your data, please contact us through the support section of the app.
        </Text>

      </ScrollView>
    </View>
  );
}

export function CommunityGuidelinesScreen({ navigation }) {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);

  return (
    <View style={[styles.container, { backgroundColor: tTheme.background }]}>
      <View style={[styles.header, { backgroundColor: tTheme.cardBackground, borderBottomColor: tTheme.rowBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={tTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tTheme.text }]}>Community Guidelines</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>1. Be Respectful</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Treat all community members with respect. Harassment, bullying, and hate speech are not tolerated.
        </Text>

        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>2. Stay On Topic</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Keep discussions relevant to the topic. Off-topic posts may be removed by moderators.
        </Text>

        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>3. No Spam or Advertising</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          Spam, self-promotion, and commercial advertising are not permitted in community discussions.
        </Text>

        <Text style={[styles.sectionTitle, { color: tTheme.text }]}>4. Report Issues</Text>
        <Text style={[styles.bodyText, { color: tTheme.secondaryText }]}>
          If you encounter content that violates these guidelines, report it using the report function.
        </Text>
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
    paddingVertical: 20,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
  faqItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    gap: 10,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  contactValue: {
    fontSize: 13,
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bulletList: {
    marginVertical: 8,
    marginLeft: 8,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 8,
    fontWeight: '500',
  },
  acknowledgment: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  acknowledgmentText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },
});