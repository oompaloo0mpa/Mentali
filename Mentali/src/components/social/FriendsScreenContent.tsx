import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FriendCodeInput } from '@/components/social/FriendCodeInput';
import { FriendOptionsModal } from '@/components/social/FriendOptionsModal';
import { FriendProfileSheet } from '@/components/social/FriendProfileSheet';
import { FriendRow } from '@/components/social/FriendRow';
import { MilestoneModal } from '@/components/social/MilestoneModal';
import { MoreMenu } from '@/components/social/MoreMenu';
import { NotificationsModal } from '@/components/social/NotificationsModal';
import { RequestRow } from '@/components/social/RequestRow';
import { SearchBar } from '@/components/social/SearchBar';
import { SortFilterBar, type FriendFilter, type FriendSort } from '@/components/social/SortFilterBar';
import { StatBar } from '@/components/social/StatBar';
import { Brand, MaxContentWidth, Spacing } from '@/theme/theme';
import { type Friend } from '@/data/mockData';
import { friendBadges, friendNeedsSupport, isFriendAtRisk, isNewFriend, useSocial } from '@/storage/socialStore';
import { useUserProfile } from '@/storage/userProfileStore';
import { useSettingsOverlay } from '@/storage/settingsOverlayStore';

function lastMotivationText(messages: { text: string; sender: 'me' | 'them' }[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === 'me' && messages[i].text.trim()) return messages[i].text;
  }

  return null;
}

type Props = {
  showHeader?: boolean;
  onOpenChat?: (friend: Friend) => void;
  onSendMotivation?: (friend: Friend) => void;
};

export function FriendsScreenContent({ showHeader = true, onOpenChat, onSendMotivation }: Props) {
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
    blockFriend,
    unblockFriend,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    dismissMilestone,
  } = useSocial();
  const { profile } = useUserProfile();
  const { openSettings, requestLogout } = useSettingsOverlay();

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
          return isFriendAtRisk(f);
        case 'needs-support':
          return friendNeedsSupport(f);
        case 'new':
          return isNewFriend(f);
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

    return sorted.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [friends, search, filter, sort]);

  const openChat = (friend: Friend) => {
    onOpenChat?.(friend);
  };

  const sendMotivation = (friend: Friend) => {
    onSendMotivation?.(friend);
  };

  const openProfile = (friend: Friend) => setProfileFriend(friend);
  const hasNoFriends = friends.length === 0;

  const handleAddFriend = (code: string) => {
    const result = addFriendByCode(code);
    Alert.alert(result.ok ? 'Friend added' : 'Could not add friend', result.message);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {showHeader ? (
          <StatBar
            fire={fireStreak}
            diamonds={diamonds}
            gems={gems}
            unreadCount={unreadNotifications}
            onPressNotifications={() => setNotifVisible(true)}
            onPressMenu={() => setMenuVisible(true)}
          />
        ) : null}

        <FriendCodeInput onSubmit={handleAddFriend} />

        <Text style={styles.friendCode}>
          Your Friend Code: <Text style={styles.friendCodeValue}>{profile.friendCode}</Text>
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
              {visibleFriends.length === 0 && <Text style={styles.empty}>No friends match this view.</Text>}
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

      <MoreMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={(key) => {
          if (key === 'settings') openSettings();
          if (key === 'logout') requestLogout();
          if (key === 'statistics') {
            Alert.alert('Statistics', 'Your wellbeing stats will appear here soon.');
          }
        }}
      />

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
        onBlock={(f) => blockFriend(f.id)}
        onUnblock={(f) => unblockFriend(f.id)}
      />

      <MilestoneModal
        visible={pendingMilestone !== null}
        friendName={pendingMilestone?.friend.name ?? ''}
        milestone={pendingMilestone?.milestone ?? 0}
        onClose={dismissMilestone}
      />
    </>
  );
}

const styles = StyleSheet.create({
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