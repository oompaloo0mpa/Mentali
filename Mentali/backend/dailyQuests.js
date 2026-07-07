/** Daily quest catalog seeded into MongoDB and sampled for each user per day. */

const DAILY_QUEST_CATALOG = [
  {
    title: "Complete today's check-in",
    description: "Finish your daily wellbeing chat once today.",
    rewardPoints: 10,
    category: "checkin",
  },
  {
    title: "Pick your mood",
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
    description: "Add a few words about how today felt for you.",
    rewardPoints: 8,
    category: "reflection",
  },
  {
    title: "Name one good thing",
    description: "Think of one small thing that went okay today.",
    rewardPoints: 5,
    category: "reflection",
  },
  {
    title: "Take a mindful pause",
    description: "Spend one minute noticing your breath or surroundings.",
    rewardPoints: 5,
    category: "reflection",
  },
  {
    title: "Plan a gentle next step",
    description: "Choose one small thing that might help you tomorrow.",
    rewardPoints: 6,
    category: "reflection",
  },
];

module.exports = { DAILY_QUEST_CATALOG };
