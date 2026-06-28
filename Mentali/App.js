import {
    useState
} from 'react';
import {
    SafeAreaProvider
} from 'react-native-safe-area-context';

import {
    FriendChatScreenContent
} from '@/components/chat/FriendChatScreenContent';
import {
    StreakGuideScreenContent
} from '@/components/chat/StreakGuideScreenContent';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import {
    CheckInChatScreen
} from '@/pages/CheckInChatScreen';
import {
    SocialProvider
} from '@/storage/socialStore';
import {
    MOODS,
    PHQ4_QUESTIONS
} from '@/data/checkInContent';

export default function App() {
    const [screenState, setScreenState] = useState({
        screen: 'login',
    });
    const [homeNav, setHomeNav] = useState('home-outline');

    const openChat = (friendId, prefill) => {
        setScreenState({
            screen: 'chat',
            friendId,
            prefill,
            returnToNav: homeNav,
        });
    };

    return ( <
        SafeAreaProvider >
        <
        SocialProvider > {
            screenState.screen === 'login' ? ( <
                LoginPage mode = "phone"
                onToggleMode = {
                    () => {}
                }
                onSignupPress = {
                    () => {}
                }
                onForgotPasswordPress = {
                    () => {}
                }
                onLoginPress = {
                    () =>
                    setScreenState({
                        screen: 'home',
                        selectedNav: homeNav,
                    })
                }
                onSocialAuthSuccess = {
                    () =>
                    setScreenState({
                        screen: 'home',
                        selectedNav: homeNav,
                    })
                }
                />
            ) : screenState.screen === 'home' ? ( <
                HomePage initialSelectedNav = {
                    screenState.selectedNav || homeNav
                }
                onSelectedNavChange = {
                    setHomeNav
                }
                onOpenChat = {
                    (friend, prefill) => openChat(friend.id, prefill)
                }
                onOpenCheckIn = {
                    () => setScreenState({
                        screen: 'check-in'
                    })
                }
                />
            ) : screenState.screen === 'check-in' ? ( <
                CheckInChatScreen mood = {
                    MOODS[2]
                }
                questions = {
                    PHQ4_QUESTIONS
                }
                headerTitle = "Check-in"
                completeLabel = "Complete"
                onBack = {
                    () => setScreenState({
                        screen: 'home',
                        selectedNav: homeNav
                    })
                }
                onComplete = {
                    () => setScreenState({
                        screen: 'home',
                        selectedNav: homeNav
                    })
                }
                />
            ) : screenState.screen === 'streak-guide' ? ( <
                StreakGuideScreenContent onClose = {
                    () =>
                    setScreenState({
                        screen: 'chat',
                        friendId: screenState.friendId,
                        prefill: screenState.prefill,
                        returnToNav: screenState.returnToNav,
                    })
                }
                />
            ) : ( <
                FriendChatScreenContent friendId = {
                    screenState.friendId
                }
                prefill = {
                    screenState.prefill ? '1' : undefined
                }
                onBack = {
                    () =>
                    setScreenState({
                        screen: 'home',
                        selectedNav: screenState.returnToNav,
                    })
                }
                onOpenStreakGuide = {
                    () =>
                    setScreenState({
                        screen: 'streak-guide',
                        friendId: screenState.friendId,
                        prefill: screenState.prefill,
                        returnToNav: screenState.returnToNav,
                    })
                }
                />
            )
        } <
        /SocialProvider> <
        /SafeAreaProvider>
    );
}