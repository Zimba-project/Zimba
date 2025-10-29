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
        topic: 'My Love',
    },
];

const MainScreen = () => {
    const [activeTab, setActiveTab] = useState('polls');
    const data = activeTab === 'polls' ? pollData : discussionData;

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <TopBar
                title="ZIMBA"
                leftIcon="menu"
                onLeftPress={() => alert('Open drawer')}
                rightText="Login"
                onRightPress={() => alert('Open login')}
            />
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) =>
                    activeTab === 'polls' ? (
                        <PollCard
                            {...item}
                            onTakePoll={() => alert('Poll opened!')}
                        />
                    ) : (
                        <DiscussionCard {...item} />
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