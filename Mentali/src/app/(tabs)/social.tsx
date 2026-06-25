import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FriendCodeInput } from '@/components/social/FriendCodeInput';
import { FriendOptionsModal } from '@/components/social/FriendOptionsModal';
import { FriendProfileSheet } from '@/components/social/FriendProfileSheet';
import { FriendRow } from '@/components/social/FriendRow';
import { MilestoneModal } from '@/components/social/MilestoneModal';
import { MoreMenu } from '@/components/social/MoreMenu';
import { NotificationsModal } from '@/components/social/NotificationsModal';
import { QuestCard } from '@/components/social/QuestCard';
import { RequestRow } from '@/components/social/RequestRow';
import { SearchBar } from '@/components/social/SearchBar';
import { SortFilterBar, type FriendFilter, type FriendSort } from '@/components/social/SortFilterBar';
import { StatBar } from '@/components/social/StatBar';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { CURRENT_USER, type Friend } from '@/constants/mockData';
import { friendBadges, useSocial } from '@/store/socialStore';

function lastMotivationText(messages: { text: string; sender: 'me' | 'them' }[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === 'me' && messages[i].text.trim()) return messages[i].text;
  }
  return null;
}

export default function SocialScreen() {
  const router = useRouter();
  const {
    friends,
    requests,
    quests,
    notifications,
    gems,
    diamonds,
    fireStreak,
    unreadNotifications,
    pendingMilestone,
    chatFor,
    addFriendByCode,
    acceptRequest,
    rejectRequest,
    togglePin,
    muteFriend,
    unmuteFriend,
    removeFriend,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    dismissMilestone,
  } = useSocial();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FriendSort>('recent');
  const [filter, setFilter] = useState<FriendFilter>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [optionsFriend, setOptionsFriend] = useState<Friend | null>(null);
  const [profileFriend, setProfileFriend] = useState<Friend | null>(null);

  const questActive = quests.some((q) => q.id === 'q-motivate' && q.progress < q.goal);

  const visibleFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = friends.filter((f) => (q ? f.name.toLowerCase().includes(q) : true));

    list = list.filter((f) => {
      switch (filter) {
        case 'at-risk':
          return f.streak >= 10 && !f.streakDone;
        case 'needs-support':
          return !f.streakDone;
        case 'new':
          return f.streak === 0;
        default:
          return true;
      }
    });

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case 'streak':
          return b.streak - a.streak;
        case 'alpha':
          return a.name.localeCompare(b.name);
        case 'recent':
        default:
          return (b.lastMessagedAt ?? 0) - (a.lastMessagedAt ?? 0);
      }
    });

    // Pinned friends always float to the top, keeping the chosen sort within each group.
    return sorted.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [friends, search, filter, sort]);

  const openChat = (friend: Friend) => {
    router.push({ pathname: '/chat/[friendId]', params: { friendId: friend.id } });
  };

  const sendMotivation = (friend: Friend) => {
    router.push({ pathname: '/chat/[friendId]', params: { friendId: friend.id, prefill: '1' } });
  };

  const openProfile = (friend: Friend) => setProfileFriend(friend);

  const hasNoFriends = friends.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StatBar
          fire={fireStreak}
          diamonds={diamonds}
          gems={gems}
          unreadCount={unreadNotifications}
          onPressNotifications={() => setNotifVisible(true)}
          onPressMenu={() => setMenuVisible(true)}
        />

        <QuestCard quests={quests} />

        <FriendCodeInput onSubmit={addFriendByCode} />

        <Text style={styles.friendCode}>
          Your Friend Code: <Text style={styles.friendCodeValue}>{CURRENT_USER.friendCode}</Text>
        </Text>

        {requests.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incoming requests</Text>
            {requests.map((req) => (
              <RequestRow key={req.id} request={req} onAccept={acceptRequest} onReject={rejectRequest} />
            ))}
          </View>
        ) : null}

        <View style={[styles.section, styles.friendsHeader]}>
          <Text style={styles.sectionTitle}>Your Friends</Text>
        </View>

        {hasNoFriends ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={40} color={Brand.textSecondary} />
            <Text style={styles.emptyTitle}>No friends yet</Text>
            <Text style={styles.emptyBody}>Add someone you trust to start support quests together.</Text>
          </View>
        ) : (
          <>
            <SearchBar value={search} onChangeText={setSearch} />
            <SortFilterBar sort={sort} filter={filter} onSortChange={setSort} onFilterChange={setFilter} />

            <View style={styles.friendsList}>
              {visibleFriends.map((friend) => (
                <FriendRow
                  key={friend.id}
                  friend={friend}
                  badges={friendBadges(friend, questActive)}
                  onPress={openChat}
                  onLongPress={setOptionsFriend}
                  onPressProfile={openProfile}
                  onSendMotivation={sendMotivation}
                />
              ))}
              {visibleFriends.length === 0 && (
                <Text style={styles.empty}>No friends match this view.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <NotificationsModal
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onClear={clearNotifications}
      />

      <MoreMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <FriendProfileSheet
        friend={profileFriend}
        lastMotivation={profileFriend ? lastMotivationText(chatFor(profileFriend.id)) : null}
        onClose={() => setProfileFriend(null)}
        onMessage={(friend) => {
          setProfileFriend(null);
          openChat(friend);
        }}
      />

      <FriendOptionsModal
        visible={optionsFriend !== null}
        friend={optionsFriend}
        onClose={() => setOptionsFriend(null)}
        onTogglePin={(f) => togglePin(f.id)}
        onMute={(f, duration) => muteFriend(f.id, duration)}
        onUnmute={(f) => unmuteFriend(f.id)}
        onRemove={(f) => removeFriend(f.id)}
        onBlock={(f) => removeFriend(f.id)}
      />

      <MilestoneModal
        visible={pendingMilestone !== null}
        friendName={pendingMilestone?.friend.name ?? ''}
        milestone={pendingMilestone?.milestone ?? 0}
        onClose={dismissMilestone}
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
  empty: { color: Brand.textSecondary, fontSize: 14, paddingVertical: Spacing.two },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  emptyTitle: { color: Brand.text, fontSize: 16, fontWeight: '800' },
  emptyBody: { color: Brand.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
