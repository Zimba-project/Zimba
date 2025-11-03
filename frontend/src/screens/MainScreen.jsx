import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import InfoBoard from '../components/MainPage/InfoBoard';
import PollCard from '../components/Cards/PollCard';
import DiscussionCard from '../components/Cards/DiscussionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';

const pollData = [
    {
        id: 'p1',
        author: { name: 'Aisha Khan', time: '5 min ago', avatar: 'https://i.pravatar.cc/150?img=12' },
        image: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=800&q=80',
        title: 'Should we adopt a 4-day work week company-wide?',
        description: 'A growing number of companies are experimenting with 4-day work weeks. Would this improve productivity and wellbeing at our organization?',
        votes: 4821,
        comments: 124,
        endTime: 'Nov 15, 2025, 5:00 PM',
        topic: 'Työelämä',
        share: {
            title: 'Poll: 4-day work week',
            message: 'Vote in this poll: Should we adopt a 4-day work week company-wide?',
            url: 'https://example.com/polls/p1',
        },
        onSave: () => alert('Poll saved!'),
    },
    {
        id: 'p2',
        author: { name: 'Diego Rivera', time: '2 hours ago', avatar: 'https://i.pravatar.cc/150?img=5' },
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
        title: 'Which feature should we prioritize next quarter?',
        description: 'The product team is preparing the roadmap for next quarter and would like input on which capability would deliver the most value to our users and business. Consider the trade-offs: Offline mode could improve reliability for users with intermittent connectivity; Advanced analytics would provide deeper insights and retention-driving dashboards for power users; Dark theme is a relatively low-effort improvement that boosts accessibility and user comfort for evening usage; Social sharing could increase organic growth and engagement by making it easy to spread content. Please vote for the option you believe will have the biggest impact and share any context or specific use cases that would help the team prioritize correctly.',
        votes: 1390,
        comments: 58,
        endTime: 'Nov 10, 2025, 8:00 PM',
        topic: 'Yritykset',
        share: {
            title: 'Poll: Product priorities',
            message: "Help choose our next feature: Offline mode, Advanced analytics, Dark theme or Social sharing.",
            url: 'https://example.com/polls/p2',
        },
        onSave: () => alert('Poll saved!'),
    },
    {
        id: 'p3',
        author: { name: 'Emily Stone', time: '1 day ago', avatar: 'https://i.pravatar.cc/150?img=8' },
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
        title: 'Best weeknight meal for quick cooking?',
        description: 'Share your favorite quick and healthy weeknight meals — we will compile top recipes.',
        votes: 870,
        comments: 46,
        endTime: 'Nov 1, 2025, 8:00 PM',
        topic: 'Kulttuuri ja vapaa-aika',
        share: {
            title: 'Poll: Weeknight meals',
            message: 'What is your go-to quick weeknight meal? Vote now!',
            url: 'https://example.com/polls/p3',
        },
        onSave: () => alert('Poll saved!'),
    },
];

const discussionData = [
    {
        id: 'd1',
        author: { name: 'Samira Patel', time: '12 min ago', avatar: 'https://i.pravatar.cc/150?img=14' },
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
        title: 'How do you stay motivated working remotely?',
        preview: 'Remote work has many benefits but staying motivated can be hard. Share tips, tools, or routines that help you stay focused.',
        comments: 42,
        topic: 'Työelämä',
        views: 2300,
        share: {
            title: 'Discussion: Remote work motivation',
            message: 'Share your tips on staying motivated while working remotely.',
            url: 'https://example.com/discussions/d1',
        },
        onSave: () => alert('Discussion saved!'),
    },
    {
        id: 'd2',
        author: { name: 'Liam O’Connor', time: '3 hours ago', avatar: 'https://i.pravatar.cc/150?img=18' },
        image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
        title: 'Favorite productivity tools in 2025?',
        preview: 'From calendar hacks to automation — what tools have changed how you work?',
        comments: 87,
        topic: 'Yritykset',
        views: 5400,
        share: {
            title: 'Discussion: Productivity tools',
            message: 'Join the discussion about the best productivity tools in 2025.',
            url: 'https://example.com/discussions/d2',
        },
        onSave: () => alert('Discussion saved!'),
    },
    {
        id: 'd3',
        author: { name: 'Noah Zhang', time: 'Yesterday', avatar: 'https://i.pravatar.cc/150?img=20' },
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
        title: 'Local weekend events: share recommendations',
        preview: 'Looking for things to do this weekend — concerts, markets, hikes. Post recommendations and links.',
        comments: 19,
        topic: 'Kaupunki ja päätöksenteko',
        views: 760,
        share: {
            title: 'Discussion: Weekend events',
            message: 'Share local events you recommend for the weekend.',
            url: 'https://example.com/discussions/d3',
        },
        onSave: () => alert('Discussion saved!'),
    },
];

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


const MainScreen = ({ navigation }) => {
    // create a mixed feed by alternating poll and discussion items
    const [feed] = useState(() => {
        const mixed = [];
        const max = Math.max(pollData.length, discussionData.length);
        for (let i = 0; i < max; i++) {
            if (pollData[i]) mixed.push({ ...pollData[i], _type: 'poll' });
            if (discussionData[i]) mixed.push({ ...discussionData[i], _type: 'discussion' });
        }
        return mixed;
    });

    const renderItem = ({ item }) => {
        if (item._type === 'poll') {
            return (
                <PollCard
                    {...item}
                    onTakePoll={() => alert('Poll opened!')}
                    share={item.share}
                    onSave={item.onSave}
                />
            );
        }

        return (
            <DiscussionCard
                {...item}
                share={item.share}
                onSave={item.onSave}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <TopBar
                title="ZIMBA"
                leftIcon="menu"
                onLeftPress={() => alert('Open drawer')}
                rightText="Login"
                onRightPress={() => navigation.navigate('Login')}
            />

            <FlatList
                data={feed}
                keyExtractor={(item, index) => `${item._type}-${item.id}-${index}`}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111' }}>Upcoming in your area</Text>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
});
export default MainScreen;