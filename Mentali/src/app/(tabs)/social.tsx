import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FriendCodeInput } from '@/components/social/FriendCodeInput';
import { FriendOptionsModal, type FriendOption } from '@/components/social/FriendOptionsModal';
import { FriendRow } from '@/components/social/FriendRow';
import { MoreMenu } from '@/components/social/MoreMenu';
import { NotificationsModal } from '@/components/social/NotificationsModal';
import { RequestRow } from '@/components/social/RequestRow';
import { SearchBar } from '@/components/social/SearchBar';
import { StatBar } from '@/components/social/StatBar';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  CURRENT_USER,
  FRIENDS,
  INCOMING_REQUESTS,
  type Friend,
  type FriendRequest,
} from '@/constants/mockData';

export default function SocialScreen() {
  const router = useRouter();

  const [requests, setRequests] = useState<FriendRequest[]>(INCOMING_REQUESTS);
  const [friends, setFriends] = useState<Friend[]>(FRIENDS);
  const [search, setSearch] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [optionsFriend, setOptionsFriend] = useState<Friend | null>(null);

  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(q));
  }, [friends, search]);

  const acceptRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (req) {
      setFriends((prev) => [
        ...prev,
        { id: `f-${req.id}`, name: req.name, streak: 0, mood: '😊', lastSeen: 'Just now', streakDone: false },
      ]);
    }
  };

  const rejectRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const openChat = (friend: Friend) => {
    router.push({ pathname: '/chat/[friendId]', params: { friendId: friend.id } });
  };

  const handleFriendOption = (option: FriendOption, friend: Friend) => {
    if (option === 'remove' || option === 'block' || option === 'archive') {
      setFriends((prev) => prev.filter((f) => f.id !== friend.id));
    }
    // Mute is not persisted yet.
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StatBar
          fire={CURRENT_USER.fireStreak}
          diamonds={CURRENT_USER.diamonds}
          gems={CURRENT_USER.gems}
          onPressNotifications={() => setNotifVisible(true)}
          onPressMenu={() => setMenuVisible(true)}
        />

        <FriendCodeInput />

        <Text style={styles.friendCode}>
          Your Friend Code: <Text style={styles.friendCodeValue}>{CURRENT_USER.friendCode}</Text>
        </Text>

        {requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incoming requests</Text>
            {requests.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
                onAccept={acceptRequest}
                onReject={rejectRequest}
              />
            ))}
          </View>
        )}

        <View style={[styles.section, styles.friendsHeader]}>
          <Text style={styles.sectionTitle}>Your Friends</Text>
        </View>

        <SearchBar value={search} onChangeText={setSearch} />

        <View style={styles.friendsList}>
          {filteredFriends.map((friend) => (
            <FriendRow
              key={friend.id}
              friend={friend}
              onPress={openChat}
              onLongPress={setOptionsFriend}
            />
          ))}
          {filteredFriends.length === 0 && <Text style={styles.empty}>No friends found.</Text>}
        </View>
      </ScrollView>

      <NotificationsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />

      <MoreMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <FriendOptionsModal
        visible={optionsFriend !== null}
        friend={optionsFriend}
        onClose={() => setOptionsFriend(null)}
        onSelect={handleFriendOption}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.background },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  friendCode: { color: Brand.text, fontSize: 15, fontWeight: '700' },
  friendCodeValue: { color: Brand.text, fontWeight: '800' },
  section: { gap: Spacing.two },
  friendsHeader: { marginTop: Spacing.three },
  sectionTitle: { color: Brand.text, fontSize: 15, fontWeight: '700' },
  friendsList: { gap: Spacing.one },
  empty: { color: Brand.textMuted, fontSize: 14, paddingVertical: Spacing.two },
});
