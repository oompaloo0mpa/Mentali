export type StatItem = {
    icon: string;
    value: string;
    color: string;
};

export type MoodItem = {
    label: string;
    face: string;
    color: string;
};

export type QuestItem = {
    title: string;
    subtitle: string;
    points: string;
    active: boolean;
};

export type NavItem = {
    icon: string;
    active?: boolean;
};

export const stats: StatItem[] = [
    { icon: '🔥', value: '67', color: '#FF9800' },
    { icon: '🔷', value: '15', color: '#C86BFF' },
    { icon: '🧊', value: '2', color: '#71BFEA' },
];

export const moods: MoodItem[] = [
    { label: 'great', face: '😄', color: '#7CD957' },
    { label: 'good', face: '🙂', color: '#FFE06D' },
    { label: 'meh', face: '😞', color: '#FF8C42' },
    { label: 'sad', face: '☹️', color: '#B8DCF5' },
    { label: 'cry', face: '🥺', color: '#B6C9B7' },
];

export const quests: QuestItem[] = [
    {
        title: 'Daily Check-in',
        subtitle: 'Complete your daily check-in with Mentali',
        points: '+10 pts',
        active: true,
    },
    {
        title: 'How are you feeling today?',
        subtitle: 'Pick your mood depending on',
        points: '+5 pts',
        active: true,
    },
    {
        title: 'Talk to a friend!',
        subtitle: 'Send a quick message to a friend of yours',
        points: '+5 pts',
        active: false,
    },
];

export const navItems: NavItem[] = [
    { icon: '⌂', active: true },
    { icon: '◔' },
    { icon: '▮▮▮' },
    { icon: '👜' },
    { icon: '⌄' },
];
