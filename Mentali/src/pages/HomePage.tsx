import { useEffect, useState, type ComponentProps } from 'react';
import {
  Modal,
  Image,
  type ImageSourcePropType,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  initialNotifications,
  moods,
  navItems,
  quests,
  stats,
  type AppNotification,
  type MoodItem,
  type QuestItem,
  type StatItem,
} from '../hooks/homepageData';
import { FriendsScreenContent } from '../components/social/FriendsScreenContent';
import { BottomNav } from '@/components/nav/BottomNav';
import { useSettingsOverlay } from '@/storage/settingsOverlayStore';
import { moodById, moodFromHomeIndex } from '@/data/checkInContent';
import type { Friend } from '@/data/mockData';
import type { MoodOption } from '@/logic/checkin';
import { useUserProfile } from '@/storage/userProfileStore';

type HomePageProps = {
  initialSelectedNav?: string;
  onSelectedNavChange?: (selectedNav: string) => void;
  onOpenChat?: (friend: Friend, prefillMotivation?: boolean) => void;
  onOpenCheckIn?: (mood: MoodOption) => void;
  onOpenWardrobe?: () => void;
};

const bronzeTrophy = require('../../assets/images/BronzeTrophy.png') as ImageSourcePropType;
const thinkingMascot = require('../../assets/images/thinkingMascot.png') as ImageSourcePropType;
const arrowIcon = require('../../assets/images/ArrowIcon.png') as ImageSourcePropType;
const statsIcon = require('../../assets/images/StatsIcon.png') as ImageSourcePropType;
const diamondIcon = require('../../assets/images/DiamondIcon.png') as ImageSourcePropType;

type NotificationPanelProps = {
  visible: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  onClose: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onClearNotifications: () => void;
  topInset: number;
};

type MoreMenuPanelProps = {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  topInset: number;
};

type MoodButtonProps = {
  mood: MoodItem;
  selected: boolean;
  onPress: () => void;
};

function StatPill({ icon, value, color }: StatItem) {
  return (
    <View style={styles.statPill}>
      <Image source={icon} resizeMode="contain" style={[styles.statIconImage, { tintColor: color }]} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function MoodButton({ mood, selected, onPress }: MoodButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.moodItem}>
      <View style={[styles.moodButton, selected && styles.moodButtonSelected, { backgroundColor: mood.color }]}>
        <Image source={mood.image} resizeMode="contain" style={styles.moodImage} />
      </View>
      <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>{mood.label}</Text>
    </Pressable>
  );
}

function QuestCard({ item }: { item: QuestItem }) {
  return (
    <View style={[styles.questCard, item.active ? styles.questCardActive : styles.questCardInactive]}>
      <View style={styles.questTextWrap}>
        <Text numberOfLines={1} style={styles.questTitle}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={styles.questSubtitle}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.pointsPill}>
        <Text style={styles.pointsText}>{item.points}</Text>
      </View>
    </View>
  );
}

function MascotArt() {
  return <Image source={thinkingMascot} resizeMode="contain" style={styles.mascotImage} />;
}

function NavPlaceholder({ title, icon }: { title: string; icon: ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={styles.placeholderScreen}>
      <View style={styles.placeholderCard}>
        <Ionicons name={icon} size={44} color="#FF5DE7" />
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderSubtitle}>Placeholder screen for testing the navigation bar.</Text>
      </View>
    </View>
  );
}

function NotificationPanel({
  visible,
  notifications,
  unreadCount,
  onClose,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearNotifications,
  topInset,
}: NotificationPanelProps) {
  const todayNotifications = notifications.filter((notification) => notification.recent);
  const earlierNotifications = notifications.filter((notification) => !notification.recent);

  const sections = [
    { label: 'Today', items: todayNotifications },
    { label: 'Earlier', items: earlierNotifications },
  ].filter((section) => section.items.length > 0);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={[styles.notificationsBackdrop, { paddingTop: topInset + 56 }]} onPress={onClose}>
        <Pressable style={styles.notificationsCard} onPress={() => {}}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notifications</Text>

            <View style={styles.notificationsHeaderActions}>
              {unreadCount > 0 ? (
                <Pressable onPress={onMarkAllNotificationsRead} hitSlop={8}>
                  <Text style={styles.markAllReadText}>Mark all read</Text>
                </Pressable>
              ) : null}

              <Pressable onPress={onClose} style={styles.notificationsCloseButton} hitSlop={8}>
                <Ionicons name="close" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.notificationsEmptyState}>
              <Text style={styles.notificationsEmptyText}>You are all caught up!</Text>
            </View>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.notificationsScrollContent}>
                {sections.map((section) => (
                  <View key={section.label} style={styles.notificationsSection}>
                    <Text style={styles.notificationsSectionLabel}>{section.label}</Text>

                    {section.items.map((notification) => {
                      const unread = !notification.read;

                      return (
                        <Pressable
                          key={notification.id}
                          style={styles.notificationRow}
                          onPress={() => onMarkNotificationRead(notification.id)}
                        >
                          <View
                            style={[
                              styles.notificationIconCircle,
                              unread && styles.notificationIconCircleUnread,
                            ]}
                          >
                            <Ionicons
                              name={notification.icon}
                              size={16}
                              color={unread ? '#FF4DEA' : '#BCAFC2'}
                            />
                          </View>

                          <View style={styles.notificationTextColumn}>
                            <Text style={[styles.notificationItemTitle, unread && styles.notificationItemTitleUnread]}>
                              {notification.title}
                            </Text>
                            <Text style={styles.notificationTime}>{notification.time}</Text>
                          </View>

                          {unread ? <View style={styles.notificationUnreadDot} /> : <View style={styles.notificationUnreadDotSpacer} />}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>

              <View style={styles.notificationsFooter}>
                <Pressable
                  onPress={onClearNotifications}
                  style={({ pressed }) => [styles.clearAllButton, pressed && styles.clearAllButtonPressed]}
                >
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                  <Text style={styles.clearAllText}>Clear all</Text>
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MoreMenuPanel({ visible, onClose, onLogout, onOpenSettings, topInset }: MoreMenuPanelProps) {
  const menuItems = [
    { icon: 'stats-chart-outline' as const, label: 'Statistics', key: 'statistics' as const },
    { icon: 'settings-outline' as const, label: 'Settings', key: 'settings' as const },
    { icon: 'log-out-outline' as const, label: 'Logout', key: 'logout' as const },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={[styles.moreBackdrop, { paddingTop: topInset + 48 }]} onPress={onClose}>
        <Pressable style={styles.moreCard} onPress={() => {}}>
          <View style={styles.moreHeader}>
            <Pressable onPress={onClose} style={styles.moreCloseButton} hitSlop={8}>
              <Ionicons name="close" size={18} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.moreMenuList}>
            {menuItems.map((item, index) => (
              <View key={item.label}>
                <Pressable
                  style={styles.moreMenuItem}
                  onPress={() => {
                    onClose();
                    if (item.key === 'logout') {
                      onLogout?.();
                    } else if (item.key === 'settings') {
                      onOpenSettings?.();
                    }
                  }}
                >
                  <Ionicons name={item.icon} size={28} color="#FF5DE7" />
                  <Text style={styles.moreMenuItemText}>{item.label}</Text>
                </Pressable>

                {index < menuItems.length - 1 ? <View style={styles.moreMenuDivider} /> : null}
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function HomePage({
  initialSelectedNav = navItems.find((item) => item.active)?.icon ?? navItems[0].icon,
  onSelectedNavChange,
  onOpenChat,
  onOpenCheckIn,
  onOpenWardrobe,
}: HomePageProps) {
  const { openSettings, requestLogout } = useSettingsOverlay();
  const { profile, setCurrentMood } = useUserProfile();
  const [selectedNav, setSelectedNav] = useState(initialSelectedNav);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const completedCount = 2;
  const insets = useSafeAreaInsets();
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const isHomeSelected = selectedNav === 'home-outline';
  const selectedMood = Math.max(
    0,
    moods.findIndex((m) => m.id === profile.currentMoodId),
  );

  useEffect(() => {
    setSelectedNav(initialSelectedNav);
  }, [initialSelectedNav]);

  useEffect(() => {
    onSelectedNavChange?.(selectedNav);
  }, [selectedNav, onSelectedNavChange]);

  const navLabels: Record<string, { title: string; icon: ComponentProps<typeof Ionicons>['name'] }> = {
    'home-outline': { title: 'Home', icon: 'home-outline' },
    'people-outline': { title: 'Friends', icon: 'people-outline' },
    'trophy-outline': { title: 'Rewards', icon: 'trophy-outline' },
    'bag-outline': { title: 'Shop', icon: 'bag-outline' },
    'shirt-outline': { title: 'Wardrobe', icon: 'shirt-outline' },
  };

  const markNotificationRead = (id: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, read: true })),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#282425" />

      <View style={[styles.content, { paddingTop: insets.top - 100 }]}>
        <View style={styles.topRow}>
          <View style={styles.statGroup}>
            {stats.map((item) => (
              <StatPill key={item.value} {...item} />
            ))}
          </View>

          <View style={styles.actionGroup}>
            <Pressable
              accessibilityLabel={`Notifications, ${unreadCount} unread`}
              onPress={() => setNotificationsVisible(true)}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={20} color="#fff" />

              {unreadCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : String(unreadCount)}</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              accessibilityLabel="More options"
              onPress={() => setMoreMenuVisible(true)}
              style={styles.actionButton}
            >
              <Ionicons name="menu-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        <NotificationPanel
          visible={notificationsVisible}
          notifications={notifications}
          unreadCount={unreadCount}
          onClose={() => setNotificationsVisible(false)}
          onMarkNotificationRead={markNotificationRead}
          onMarkAllNotificationsRead={markAllNotificationsRead}
          onClearNotifications={clearNotifications}
          topInset={insets.top}
        />

        <MoreMenuPanel
          visible={moreMenuVisible}
          onClose={() => setMoreMenuVisible(false)}
          onLogout={requestLogout}
          onOpenSettings={openSettings}
          topInset={insets.top}
        />

        {isHomeSelected ? (
          <>
            <View style={styles.heroRow}>
              <View style={styles.quoteBubble}>
                <Text style={styles.quoteText}>{'“Small steps every day lead to\nbig changes.”'}</Text>
                <View style={styles.quoteTail} />
              </View>

              <MascotArt />
            </View>

            <View style={styles.moodsRow}>
              {moods.map((mood, index) => (
                <MoodButton
                  key={mood.label}
                  mood={mood}
                  selected={selectedMood === index}
                  onPress={() => {
                    const picked = moodById(mood.id) ?? moodFromHomeIndex(index);
                    setCurrentMood({ id: picked.id, emoji: picked.emoji });
                  }}
                />
              ))}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Daily Quest</Text>
              <Text style={styles.sectionMeta}>
                <Text style={styles.sectionMetaHighlight}>{completedCount}/3</Text> Completed
              </Text>
            </View>

            <View style={styles.questList}>
              {quests.map((item) => (
                <QuestCard key={item.title} item={item} />
              ))}
            </View>

            <View style={styles.ctaCard}>
              <View style={styles.ctaTextWrap}>
                <Text style={styles.ctaTitle}>{'Lets do a quick\nCheck-in today!'}</Text>
                <Text style={styles.ctaSubtitle}>It only takes a minute.</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.ctaButton}
                onPress={() => onOpenCheckIn?.(moodFromHomeIndex(selectedMood))}
              >
                <Text style={styles.ctaButtonText}>Start Check-in</Text>
                <Text style={styles.ctaArrow}>→</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rankRow}>
              <View style={styles.rankCardLeft}>
                <Text style={styles.rankLabel}>Current Rank</Text>
                <View style={styles.rankBody}>
                  <Image source={bronzeTrophy} resizeMode="contain" style={styles.trophyImage} />
                  <View style={styles.rankInfo}>
                    <View style={styles.rankNameRow}>
                      <Text style={styles.rankName}>Bronze</Text>
                      <Text style={styles.rankPosition}>#10</Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View style={styles.progressBarFill} />
                    </View>
                    <Text style={styles.rankPoints}>210 pts</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rankCardRight}>
                <View style={styles.rankStatItem}>
                  <View style={styles.rankStatIconSlot}>
                    <Image source={statsIcon} resizeMode="contain" style={styles.rankStatIconImage} />
                  </View>
                  <View>
                    <Text style={styles.rankStatValue}>#10</Text>
                    <Text style={styles.rankStatLabel}>Current Position</Text>
                  </View>
                </View>
                <View style={styles.rankDivider} />
                <View style={styles.rankStatItem}>
                  <View style={styles.rankStatIconSlot}>
                    <Image source={diamondIcon} resizeMode="contain" style={styles.rankStatIconImage} />
                  </View>
                  <View>
                    <Text style={[styles.rankStatValue, { color: '#C86BFF' }]}>15</Text>
                    <Text style={styles.rankStatLabel}>Points this week</Text>
                  </View>
                </View>
                <View style={styles.rankDivider} />
                <View style={styles.rankStatItem}>
                  <View style={styles.rankStatIconSlot}>
                    <View style={styles.arrowIconCircle}>
                      <Image source={arrowIcon} resizeMode="contain" style={styles.rankStatIconImage} />
                    </View>
                  </View>
                  <View>
                    <Text style={styles.rankStatValue}>20</Text>
                    <Text style={styles.rankStatLabel}>Positions</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : selectedNav === 'people-outline' ? (
          <FriendsScreenContent
            showHeader={false}
            onOpenChat={(friend) => onOpenChat?.(friend)}
            onSendMotivation={(friend) => onOpenChat?.(friend, true)}
          />
        ) : (
          <NavPlaceholder title={navLabels[selectedNav].title} icon={navLabels[selectedNav].icon} />
        )}
      </View>

      <BottomNav
        activeIcon={selectedNav}
        onSelect={(icon) => {
          if (icon === 'shirt-outline') {
            onOpenWardrobe?.();
          } else {
            setSelectedNav(icon);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282425',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statIconImage: {
    width: 22,
    height: 22,
    marginRight: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FF9ADA',
    borderWidth: 1,
    borderColor: '#FFF4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FF9ADA',
    borderWidth: 1,
    borderColor: '#FFF4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#282425',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  notificationsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    zIndex: 20,
  },
  notificationsCard: {
    width: '88%',
    maxWidth: 360,
    maxHeight: '64%',
    borderRadius: 22,
    backgroundColor: '#231F21',
    borderWidth: 2,
    borderColor: '#FF6DEB',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notificationsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  notificationsHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllReadText: {
    color: '#FF6DEB',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 12,
  },
  notificationsCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationsScrollContent: {
    paddingBottom: 8,
  },
  notificationsSection: {
    marginBottom: 14,
  },
  notificationsSectionLabel: {
    color: '#BCAFC2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  notificationIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#312C2E',
    marginRight: 10,
  },
  notificationIconCircleUnread: {
    backgroundColor: '#FFE2F8',
  },
  notificationTextColumn: {
    flex: 1,
    paddingRight: 10,
  },
  notificationItemTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  notificationItemTitleUnread: {
    color: '#FFF4FD',
  },
  notificationTime: {
    color: '#BCAFC2',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  notificationUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5DE7',
  },
  notificationUnreadDotSpacer: {
    width: 8,
    height: 8,
  },
  notificationsFooter: {
    paddingTop: 8,
  },
  clearAllButton: {
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#FF6DEB',
    backgroundColor: '#B03AB4',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  clearAllButtonPressed: {
    opacity: 0.85,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
  notificationsEmptyState: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  notificationsEmptyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  moreBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    zIndex: 25,
  },
  moreCard: {
    width: '40%',
    maxWidth: 360,
    maxHeight: '64%',
    borderRadius: 22,
    backgroundColor: '#231F21',
    borderWidth: 2,
    borderColor: '#FF6DEB',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  moreHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  moreCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  moreMenuList: {
    paddingBottom: 4,
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  moreMenuItemText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 12,
  },
  moreMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quoteBubble: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FF8DED',
    minHeight: 88,
    justifyContent: 'center',
  },
  quoteText: {
    color: '#F59AD3',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 19,
  },
  quoteTail: {
    position: 'absolute',
    right: -8,
    top: 38,
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FF8DED',
    transform: [{ rotate: '315deg' }],
  },
  mascotImage: {
    width: 126,
    height: 110,
    marginRight: -2,
  },
  moodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  moodItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  moodButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F5F1F4',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  moodLabelSelected: {
    color: '#FF9ADA',
    fontWeight: '700',
  },
  moodButtonSelected: {
    borderWidth: 3,
    borderColor: '#FF5DE7',
  },
  moodImage: {
    width: 46,
    height: 46,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionMetaHighlight: {
    color: '#E56AE5',
    fontWeight: '800',
  },
  questList: {
    marginBottom: 10,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#FF4DEA',
    borderRadius: 12,
    backgroundColor: '#F7C7F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    minHeight: 44,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  questCardInactive: {
    backgroundColor: '#fff',
    borderColor: '#F2D5F0',
  },
  questCardActive: {
    backgroundColor: '#F7C7F3',
  },
  questTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  questTitle: {
    color: '#111',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 1,
  },
  questSubtitle: {
    color: '#6E6E6E',
    fontSize: 9,
    fontWeight: '700',
  },
  pointsPill: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F48FD4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pointsText: {
    color: '#8F2A86',
    fontSize: 10,
    fontWeight: '800',
  },
  ctaCard: {
    backgroundColor: '#F8C9FA',
    borderWidth: 2,
    borderColor: '#FF49EA',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ctaTextWrap: {
    marginBottom: 10,
  },
  ctaTitle: {
    color: '#111',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 4,
  },
  ctaSubtitle: {
    color: '#7E6679',
    fontSize: 11,
    fontWeight: '700',
  },
  ctaButton: {
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B03AB4',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 10,
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  rankCardLeft: {
    flex: 0.9,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF49EA',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  rankLabel: {
    color: '#C150D2',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  rankBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyImage: {
    width: 52,
    height: 52,
    marginRight: 8,
  },
  rankInfo: {
    flex: 1,
  },
  rankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankName: {
    color: '#8B5C35',
    fontSize: 18,
    fontWeight: '800',
  },
  progressBarTrack: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    backgroundColor: '#D8D8D8',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F47DF1',
    borderRadius: 6,
  },
  rankPoints: {
    color: '#C150D2',
    fontSize: 12,
    fontWeight: '800',
    alignSelf: 'flex-end',
  },
  rankPosition: {
    color: '#8B5C35',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  rankCardRight: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF49EA',
    overflow: 'hidden',
  },
  rankStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  rankStatIconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  rankStatIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#74B7FF',
  },
  rankStatIconImage: {
    width: 18,
    height: 18,
  },
  arrowIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 16,
    backgroundColor: '#0d4a0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankStatValue: {
    color: '#111',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 1,
  },
  rankStatLabel: {
    color: '#6E6E6E',
    fontSize: 10,
    fontWeight: '700',
  },
  rankDivider: {
    height: 2,
    backgroundColor: '#FF49EA',
  },
  ctaArrowImage: {
    width: 16,
    height: 16,
  },
  placeholderScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FF6DEB',
    backgroundColor: '#231F21',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  placeholderTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    color: '#D2C6CC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});
