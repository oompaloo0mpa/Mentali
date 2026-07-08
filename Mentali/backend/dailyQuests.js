/** Daily quest catalog seeded into MongoDB and sampled for each user per day. */

const DAILY_QUEST_CATALOG = [{
    title: "Complete today's check-in",
    description: "Finish your daily wellbeing chat once today.",
    rewardPoints: 10,
    category: "checkin",
  },
  {
    description: 'Open your check-in summary and review the result.',
    description: "Choose how you feel on the homepage mood strip.",
    rewardPoints: 5,
    category: "checkin",
  },
  {
    title: "Read your summary",
    description: "Open your check-in summary and see how you are doing.",
    rewardPoints: 5,
    category: "checkin",
  },
  {
    title: "Keep your streak alive",
    description: "Check in on a day when your streak is still going.",
    rewardPoints: 8,
    category: "checkin",
  },
  {
    title: "Send a supportive message",
    description: "Send one encouraging message to a friend.",
    rewardPoints: 5,
    category: "social",
  },
  {
    title: "Talk to a friend",
    description: "Open a friend chat and say hello.",
    rewardPoints: 5,
    category: "social",
  },
  {
    title: "Grow your circle",
    description: "Send or accept a friend request.",
    rewardPoints: 8,
    category: "social",
  },
  {
    title: "Protect your messaging streak",
    description: "Send a message to keep a friend streak going.",
    rewardPoints: 8,
    category: "social",
  },
  {
    title: "Write a short reflection",
    description: 'Add a few words in your check-in reflection box.',
    rewardPoints: 8,
    category: "reflection",
  },
  {
    title: 'Mark one notification as read',
    description: 'Open notifications and clear one unread item.',
    rewardPoints: 5,
    category: "reflection",
  },
  {
    title: 'Change your wardrobe',
    description: 'Open the wardrobe and save a new look.',
    rewardPoints: 5,
    category: "reflection",
  },
  {
    title: 'Visit the shop',
    description: 'Open the shop tab and browse the available items.',
    rewardPoints: 6,
    category: "reflection",
  },
];

module.exports = {
  DAILY_QUEST_CATALOG
};