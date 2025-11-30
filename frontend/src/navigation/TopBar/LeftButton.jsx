import { TouchableOpacity } from 'react-native';
import { Menu, ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { DrawerActions } from '@react-navigation/native';
import { navigationRef } from '../../App';

export default function LeftButton({ navigation, showBack }) {
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
            <Icon as={showBack ? ChevronLeft : Menu} size="xl" className="text-typography-900" />
        </TouchableOpacity>
    );
}
