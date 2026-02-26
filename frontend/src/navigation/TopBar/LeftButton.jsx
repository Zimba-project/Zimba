import { TouchableOpacity } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { navigationRef } from '../../utils/navigationRef';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

export default function LeftButton({ navigation, showBack }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const iconColor = isDark ? '#fff' : '#000';

    const onPress = () => {
        if (showBack) {
            if (navigationRef.isReady() && navigationRef.canGoBack()) {
                return navigationRef.goBack();
            }
            if (navigation.canGoBack()) {
                return navigation.goBack();
            }
        }
        try {
            let parent = navigation;
            while (parent && !parent.openDrawer && parent.getParent) parent = parent.getParent();
            if (parent?.openDrawer) return parent.openDrawer();
        } catch { }
        if (navigationRef.isReady()) navigationRef.dispatch(DrawerActions.openDrawer());
    };

    return (
        <TouchableOpacity onPress={onPress} style={{ padding: 4 }}>
            <Ionicons name={showBack ? 'chevron-back' : 'menu'} size={24} color={iconColor} />
        </TouchableOpacity>
    );
}