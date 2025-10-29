import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import TabSwitcher from '../components/MainPage/TabSwitcher';
import PollCard from '../components/MainPage/PollCard';
import DiscussionCard from '../components/MainPage/DiscussionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';

const pollData = [
    {
        id: '1',
        author: { name: 'Matt Hardy', time: '25 min ago', avatar: 'https://i.pravatar.cc/150?img=1' },
        image: 'https://picsum.photos/seed/poll1/600/400',
        title: 'Maceenas mattis hendrerit enim ac vest...',
        description: 'Phasellus interdum neque nunc, non tempor dui auctor eu...',
        votes: 25000,
        comments: 657,
        endTime: '17/12/2024, 5:00PM',
        topic: 'Poll',
        share: {
            title: 'Poll: Maceenas mattis',
            message: 'Check out this poll: Maceenas mattis hendrerit enim ac vest...',
            url: 'https://picsum.photos/seed/poll1/600/400',
        },
        onSave: () => alert('Poll saved!'),
    },
];

const discussionData = [
    {
        id: '2',
        author: { name: 'Claudia Klaus', time: '1 min ago', avatar: 'https://i.pravatar.cc/150?img=2' },
        image: 'https://picsum.photos/seed/disc1/600/400',
        title: 'Maceenas mattis hendrerit enim ac vest...',
        preview: 'Phasellus interdum neque nunc, non tempor dui auctor eu...',
        comments: 657,
        topic: 'zimba',
        views: 8900,
        share: {
            title: 'Discussion: Maceenas mattis',
            message: 'Join the discussion: Maceenas mattis hendrerit enim ac vest...',
            url: 'https://picsum.photos/seed/disc1/600/400',
        },
        onSave: () => alert('Discussion saved!'),
    },
];

const MainScreen = ({ navigation, route }) => {
    const [activeTab, setActiveTab] = useState('polls');
    const user = route && route.params && route.params.user;
    const initials = user ? `${(user.first_name || user.firstName || '').charAt(0) || ''}${(user.last_name || user.lastName || '').charAt(0) || ''}`.toUpperCase() : null;
    const data = activeTab === 'polls' ? pollData : discussionData;

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <TopBar
                title="ZIMBA"
                leftIcon="menu"
                onLeftPress={() => alert('Open drawer')}
                rightText={!initials ? 'Login' : null}
                rightAvatar={initials}
                onRightPress={() => {
                    if (!initials) navigation.navigate('Login');
                    else navigation.navigate('Profile');
                }}
            />
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) =>
                    activeTab === 'polls' ? (
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
            />

            {/* <-- SWITCHER at the bottom --> */}
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
});

export default MainScreen;