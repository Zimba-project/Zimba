import 'react-native-gesture-handler';
import * as React from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {Ionicons} from '@expo/vector-icons';
import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native';
import { Button } from '@react-navigation/elements';

function DiscussionScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    </View>
  );
}

function PollsScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  
    </View>
  );
}

function SavedScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    </View>
  );
}

function LanguageScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    </View>
  );
}

function DarkmodeScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    </View>
  );
}

// Sama logiikkka jos muita tulee: 

/*function JokuMuuScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    </View>
  );
}
  */

const Drawer = createDrawerNavigator({
  screens: {
    Discussion: {
      screen: DiscussionScreen,
      options: {
        drawerIcon: ({color, size}) => (
          <Ionicons name="chatbox-outline" size={size} color={color} />
        ),
      }
    },
    Polls: {
      screen: PollsScreen,
      options: {
        drawerIcon: ({color, size}) => (
          <Ionicons name="stats-chart-outline" size={size} color={color} />
        ),
      }
    },
    Saved: {
      screen: SavedScreen,
      options: {
        drawerIcon: ({color, size}) => (
          <Ionicons name="bookmark-outline" size={size} color={color} />
        ),
      }
    },
    Language: {
      screen: LanguageScreen,
      options: {
        drawerIcon: ({color, size}) => (
          <Ionicons name="language-outline" size={size} color={color} />
        ),
      }
    },
    Darkmode: {
      screen: DarkmodeScreen,
      options: {
        drawerIcon: ({color, size}) => (
          <Ionicons name="moon-outline" size={size} color={color} />
        ),
      }
    },
  },
});

const Navigation = createStaticNavigation(Drawer);

export default function Sidebar() {
  return <Navigation />;
}
