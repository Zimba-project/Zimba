import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupsList from '../screens/GroupsList';
import GroupDetail from '../screens/GroupDetail';
import CreateGroup from '../screens/CreateGroup';
import GroupSettings from '../screens/GroupSettings';

const Stack = createNativeStackNavigator();

export default function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsList" component={GroupsList} />
      <Stack.Screen name="GroupDetail" component={GroupDetail} />
      <Stack.Screen name="GroupSettings" component={GroupSettings} />
      <Stack.Screen name="CreateGroup" component={CreateGroup} />
    </Stack.Navigator>
  );
}