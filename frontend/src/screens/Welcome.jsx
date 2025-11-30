import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';

export default function Welcome() {
    const navigation = useNavigation();

    return (
        <Box className="flex-1 bg-background-0">
            <SafeAreaView style={styles.container}>
                <Box style={styles.content}>
                    {/* Header */}
                    <Text size="3xl" className="text-typography-900 font-bold mt-4">Welcome</Text>
                    <Text size="md" className="text-typography-600 mb-4 text-center">Login or signup to continue</Text>

                    {/* Illustration */}
                    <Image
                        source={require('../../assets/welcome.png')} // Replace with your illustration
                        style={styles.image}
                        resizeMode="contain"
                    />

                    {/* App name and tagline */}
                    <Text size="2xl" className="text-primary-500 font-bold mb-1">𝐙𝐢𝐦𝐛𝐚</Text>
                    <Text size="sm" className="text-typography-600 text-center mb-6">
                        Enhances your decisions with secure voting,{'\n'}
                        powerful data insights, and AI guidance
                    </Text>

                    {/* Buttons */}
                    <Button
                        size="lg"
                        className="w-full mb-3 bg-primary-500"
                        onPress={() => navigation.navigate('Register')}
                    >
                        <ButtonText className="text-typography-0 font-bold">Create Account</ButtonText>
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full mb-4 border-primary-500"
                        onPress={() => navigation.navigate('Login')}
                    >
                        <ButtonText className="text-primary-500 font-semibold">Already have an account</ButtonText>
                    </Button>
                </Box>

                {/* Guest link */}
                <Button
                    variant="link"
                    onPress={() => navigation.replace('Main')}
                >
                    <ButtonText className="text-typography-600 underline">Continue as a guest</ButtonText>
                </Button>
            </SafeAreaView>
        </Box>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 160,
        marginBottom: 16,
    },
});
