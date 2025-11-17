import { TouchableOpacity } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { navigationRef } from '../../App';
import { useTheme } from '../../theme/ThemeProvider';

export default function LeftButton({ navigation, showBack }) {
    const { colors } = useTheme();
    const onPress = () => {
        if (showBack && navigation.canGoBack()) return navigation.goBack();
        try {
            let parent = navigation;
            while (parent && !parent.openDrawer && parent.getParent) parent = parent.getParent();
            if (parent?.openDrawer) return parent.openDrawer();
        } catch { }
        if (navigationRef.isReady()) navigationRef.dispatch(DrawerActions.openDrawer());
    };

    return (
        <TouchableOpacity onPress={onPress} style={{ padding: 4 }}>
            <Icon name={showBack ? 'arrow-left' : 'menu'} size={24} color={colors?.text} />
        </TouchableOpacity>
    );
}
