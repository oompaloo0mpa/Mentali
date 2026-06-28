import {
    useState
} from 'react';
import {
    SafeAreaProvider
} from 'react-native-safe-area-context';

import {
    FriendChatScreenContent
} from './src/components/chat/FriendChatScreenContent';
import {
    StreakGuideScreenContent
} from './src/components/chat/StreakGuideScreenContent';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import {
    SocialProvider
} from './src/store/socialStore';

export default function App() {
    const [screenState, setScreenState] = useState({
        screen: 'login'
    });
    const [homeNav, setHomeNav] = useState('home-outline');

    const openChat = (friendId, prefill) => {
        setScreenState({
            screen: 'chat',
            friendId,
            prefill,
            returnToNav: homeNav
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
                    () => setScreenState({
                        screen: 'home',
                        selectedNav: homeNav
                    })
                }
                onSocialAuthSuccess = {
                    () => setScreenState({
                        screen: 'home',
                        selectedNav: homeNav
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
                    () => setScreenState({
                        screen: 'home',
                        selectedNav: screenState.returnToNav
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