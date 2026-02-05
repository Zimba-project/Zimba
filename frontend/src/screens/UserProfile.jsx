import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { getUserById } from '../api/auth';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { normalizeAvatarUrl } from '../utils/urlHelper';
import { formatTime } from '../utils/TimeFormatter';
import PollCard from '../components/Cards/PollCard';
import DiscussionCard from '../components/Cards/DiscussionCard';
import Avatar from '../components/Profile/Avatar';

export default function UserProfileScreen({ navigation, route }) {
  const { userId } = route.params || {};
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Posts'); // Posts, About

  const { theme } = useTheme();
  const t = getTheme(theme);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching user profile for userId:', userId);
      const response = await getUserById(userId);
      console.log('User profile response:', response);
      setUserData(response.user);
      setUserPosts(response.posts || []);
    } catch (error) {
      console.log('Failed to load user profile:', error);
      console.log('Error details:', error.message, error.stack);
      Alert.alert('Error', 'Unable to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!userData) return 'User';
    const first = userData.first_name || '';
    const last = userData.last_name || '';
    if (first || last) return `${first} ${last}`.trim();
    return userData.name || userData.username || 'User';
  };

  const getInitials = () => {
    if (!userData) return '?';
    const first = userData.first_name || '';
    const last = userData.last_name || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
        <Box style={styles.centered}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loadingText, { color: t.secondaryText }]}>Loading profile...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
        <Box style={styles.centered}>
          <Text style={[styles.errorText, { color: t.error }]}>User not found</Text>
          <Pressable 
            style={[styles.backButton, { backgroundColor: t.accent }]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <Box style={[styles.headerSection, { backgroundColor: t.cardBackground }]}>
          {/* Profile Picture */}
          <Box style={styles.avatarContainer}>
            <Avatar 
              uri={userData.avatar ? normalizeAvatarUrl(userData.avatar) : null}
              style={styles.avatar}
              imageStyle={{ resizeMode: 'cover' }}
              fallbackText={getInitials()}
            />
            {userData.verified && (
              <Box style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={32} color="#1DA1F2" />
              </Box>
            )}
          </Box>

          {/* Name */}
          <Text style={[styles.displayName, { color: t.text }]}>
            {getDisplayName()}
          </Text>

          {/* Email (if available) */}
          {userData.email && (
            <Text style={[styles.email, { color: t.secondaryText }]}>
              {userData.email}
            </Text>
          )}

          {/* Stats Row */}
          <Box style={styles.statsRow}>
            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>
                {userPosts.length}
              </Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>
                Posts
              </Text>
            </Box>

            <Box style={[styles.statDivider, { backgroundColor: t.border }]} />

            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>
                {userPosts.reduce((sum, post) => sum + (post.votes || 0), 0)}
              </Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>
                Total Votes
              </Text>
            </Box>

            <Box style={[styles.statDivider, { backgroundColor: t.border }]} />

            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>
                {userPosts.reduce((sum, post) => sum + (post.comments || 0), 0)}
              </Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>
                Comments
              </Text>
            </Box>
          </Box>

          {/* Member Since */}
          {userData.created_at && (
            <Text style={[styles.memberSince, { color: t.secondaryText }]}>
              Member since {formatTime(userData.created_at)}
            </Text>
          )}
        </Box>

        {/* Tab Selector */}
        <Box style={[styles.tabContainer, { backgroundColor: t.cardBackground, borderBottomColor: t.border }]}>
          <Pressable 
            style={[
              styles.tab, 
              selectedTab === 'Posts' && { borderBottomColor: t.accent, borderBottomWidth: 2 }
            ]}
            onPress={() => setSelectedTab('Posts')}
          >
            <Text style={[
              styles.tabText, 
              { color: selectedTab === 'Posts' ? t.accent : t.secondaryText }
            ]}>
              Posts ({userPosts.length})
            </Text>
          </Pressable>

          <Pressable 
            style={[
              styles.tab, 
              selectedTab === 'About' && { borderBottomColor: t.accent, borderBottomWidth: 2 }
            ]}
            onPress={() => setSelectedTab('About')}
          >
            <Text style={[
              styles.tabText, 
              { color: selectedTab === 'About' ? t.accent : t.secondaryText }
            ]}>
              About
            </Text>
          </Pressable>
        </Box>

        {/* Content Section */}
        {selectedTab === 'Posts' ? (
          <Box style={styles.postsContainer}>
            {userPosts.length > 0 ? (
              userPosts.map((post, index) => (
                <Pressable 
                  key={`${post.type}-${post.id}-${index}`}
                  onPress={() => {
                    if (post.type === 'poll') {
                      navigation.navigate('Poll', { postData: post });
                    } else {
                      navigation.navigate('Discuss', { postData: post });
                    }
                  }}
                >
                  {post.type === 'poll' ? (
                    <PollCard {...post} theme={theme} />
                  ) : (
                    <DiscussionCard {...post} theme={theme} />
                  )}
                </Pressable>
              ))
            ) : (
              <Box style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={t.secondaryText} />
                <Text style={[styles.emptyText, { color: t.secondaryText }]}>
                  No posts yet
                </Text>
              </Box>
            )}
          </Box>
        ) : (
          <Box style={[styles.aboutContainer, { backgroundColor: t.cardBackground }]}>
            <Text style={[styles.aboutTitle, { color: t.text }]}>About</Text>
            {userData.about ? (
              <Text style={[styles.aboutText, { color: t.secondaryText }]}>
                {userData.about}
              </Text>
            ) : (
              <Text style={[styles.aboutText, { color: t.secondaryText, fontStyle: 'italic' }]}>
                No bio available
              </Text>
            )}

            {userData.phone && (
              <Box style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color={t.secondaryText} />
                <Text style={[styles.infoText, { color: t.secondaryText }]}>
                  {userData.phone}
                </Text>
              </Box>
            )}

            {userData.birthdate && (
              <Box style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={t.secondaryText} />
                <Text style={[styles.infoText, { color: t.secondaryText }]}>
                  {new Date(userData.birthdate).toLocaleDateString()}
                </Text>
              </Box>
            )}
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSection: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  memberSince: {
    fontSize: 12,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  postsContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  aboutContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
  },
});
