import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import InfoBoard from '../components/MainPage/InfoBoard';
import PollCard from '../components/Cards/PollCard';
import DiscussionCard from '../components/Cards/DiscussionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';

const API_BASE = 'http://10.0.2.2:3001/api'; 

const MainScreen = ({ navigation, route }) => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const user = route?.params?.user;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_BASE}/posts`);
        console.log("Fetched posts:", res.data);
        const posts = Array.isArray(res.data)
          ? res.data
          : res.data.posts || [];
        const polls = posts.filter(p => p.type === 'poll');
        const discussions = posts.filter(p => p.type === 'discussion');

        const mixed = [];
        const max = Math.max(polls.length, discussions.length);
        for (let i = 0; i < max; i++) {
          if (polls[i]) mixed.push({ ...polls[i], _type: 'poll' });
          if (discussions[i]) mixed.push({ ...discussions[i], _type: 'discussion' });
        }

        setFeed(mixed);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
        if (err.response) {
          setError(`Server error: ${err.response.data?.error || err.response.statusText}`);
        } else if (err.request) {
          setError("Network error: Unable to reach the server. Check your connection.");
        } else {
          setError(`Unexpected error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            setFeed([]);
            axios.get(`${API_BASE}/posts`)
              .then(res => setFeed(res.data.posts || res.data))
              .catch(() => setError("Retry failed. Please check your network."))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <TopBar
        title="ZIMBA"
        leftIcon="menu"
        onLeftPress={() => alert('Open drawer')}
        user={user}
        rightText={!user ? 'Login' : null}
        onRightPress={() => {
          if (!user) navigation.navigate('Login');
          else navigation.navigate('Profile');
        }}
      />

      <FlatList
        data={feed}
        keyExtractor={(item, index) => `${item._type}-${item.id}-${index}`}
        renderItem={({ item }) =>
          item._type === 'poll' ? (
            <PollCard
              {...item}
              onTakePoll={() => alert('Poll opened!')}
              share={item.share}
              onSave={item.onSave}
            />
          ) : (
            <DiscussionCard
              {...item}
              share={item.share}
              onSave={item.onSave}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111' }}>
                Upcoming in your area
              </Text>
              <TouchableOpacity onPress={() => alert('Show all upcoming changes')}>
                <Text style={{ color: '#6366f1', fontWeight: '600' }}>See all</Text>
              </TouchableOpacity>
            </View>

            <InfoBoard
              items={infoItems}
              onCardPress={(it) => alert(`Info: ${it.title}`)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
};

const infoItems = [
  {
    id: 'i1',
    title: 'Traffic arrangements in downtown (wk 45)',
    subtitle: 'Road and cable works in the city center — expect detours and temporary closures.',
    image: 'https://unsplash.com/photos/HCDmcskE_Zk/download?force=true&w=800',
    background: '#fffaf0',
  },
  {
    id: 'i2',
    title: 'City park renovation begins',
    subtitle: 'Park renovation starts next month: walking paths will be adjusted and the playground renewed.',
    image: 'https://unsplash.com/photos/GjnpGl9KYL4/download?force=true&w=800',
    background: '#f9fafb',
  },
  {
    id: 'i3',
    title: 'Public transport timetable changes',
    subtitle: 'New bus schedules take effect on Monday — check routes in the app.',
    image: 'https://unsplash.com/photos/CI3UhW7AaZE/download?force=true&w=800',
    background: '#fff7ed',
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 8, fontSize: 16, color: '#555' },
  errorText: { color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 12, paddingHorizontal: 16 },
  retryButton: { backgroundColor: '#6366f1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
});

export default MainScreen;