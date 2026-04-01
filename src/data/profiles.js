export const profiles = [
  {
    id: 1,
    type: "Single",
    name: "Maya Chen",
    age: 29,
    course: "Pebble Ridge",
    teeTime: "Sat · 8:20 AM",
    handicap: "11.4",
    slots: 1,
    vibe: "Social",
    pace: "Ready golf",
    bio: "Walks fast, keeps the round light, and is always down for a post-round breakfast burrito.",
    tags: ["Weekend regular", "Walks 18", "Friendly banter"],
    image:
      "linear-gradient(180deg, rgba(13, 41, 28, 0.15), rgba(13, 41, 28, 0.55)), url('https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80')",
    fit: "Best for social rounds",
    distanceMiles: 8,
    handicapValue: 11.4,
    homeCourse: "Pebble Ridge"
  },
  {
    id: 2,
    type: "Group",
    name: "Brooklyn Birdies",
    age: "3 golfers",
    course: "Harbor Dunes",
    teeTime: "Sat · 8:06 AM",
    handicap: "16 avg",
    slots: 1,
    vibe: "Social",
    pace: "Music okay",
    bio: "Three friends visiting for the weekend and looking for a fourth who wants a fun but on-time round.",
    tags: ["Cart crew", "Relaxed", "Mid-round beer"],
    image:
      "linear-gradient(180deg, rgba(13, 41, 28, 0.12), rgba(13, 41, 28, 0.52)), url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=900&q=80')",
    fit: "Close tee time overlap",
    distanceMiles: 14,
    handicapValue: 16,
    homeCourse: "Harbor Dunes"
  },
  {
    id: 3,
    type: "Single",
    name: "Jordan Alvarez",
    age: 34,
    course: "Pebble Ridge",
    teeTime: "Sat · 8:14 AM",
    handicap: "6.8",
    slots: 1,
    vibe: "Competitive",
    pace: "Brisk",
    bio: "Former mini-tour grinder who still loves a money game, but respects pace and good company.",
    tags: ["Low cap", "Skin game", "Dialed wedges"],
    image:
      "linear-gradient(180deg, rgba(13, 41, 28, 0.14), rgba(13, 41, 28, 0.5)), url('https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80')",
    fit: "High skill match",
    distanceMiles: 3,
    handicapValue: 6.8,
    homeCourse: "Pebble Ridge"
  },
  {
    id: 4,
    type: "Group",
    name: "Sunrise Scramble",
    age: "2 golfers",
    course: "Pebble Ridge",
    teeTime: "Sat · 8:28 AM",
    handicap: "9 avg",
    slots: 2,
    vibe: "Competitive",
    pace: "Tournament pace",
    bio: "A duo looking to combine with another partial group for a solid match and an early finish.",
    tags: ["Duo", "Walkers", "Serious but kind"],
    image:
      "linear-gradient(180deg, rgba(13, 41, 28, 0.14), rgba(13, 41, 28, 0.52)), url('https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=900&q=80')",
    fit: "Two open spots",
    distanceMiles: 1,
    handicapValue: 9,
    homeCourse: "Pebble Ridge"
  },
  {
    id: 5,
    type: "Single",
    name: "Ethan Ross",
    age: 31,
    course: "Pine Hollow",
    teeTime: "Sat · 8:18 AM",
    handicap: "14.9",
    slots: 1,
    vibe: "Social",
    pace: "Steady",
    bio: "New-ish to the city, likes meeting golfers, and prefers a laid-back group that still keeps moving.",
    tags: ["New in town", "Easygoing", "Weekend golfer"],
    image:
      "linear-gradient(180deg, rgba(13, 41, 28, 0.12), rgba(13, 41, 28, 0.48)), url('https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?auto=format&fit=crop&w=900&q=80')",
    fit: "Great vibe fit",
    distanceMiles: 22,
    handicapValue: 14.9,
    homeCourse: "Pine Hollow"
  }
];

export const defaultUser = {
  name: "",
  homeCourse: "",
  handicap: 12.4,
  distance: 25,
  handicapRange: 8,
  playMode: "group_owner",
  groupSize: 3
};

export const defaultTeeTime = {
  id: "tt-100",
  dayLabel: "Saturday 8:12 AM",
  homeCourse: "Pebble Ridge",
  golfersCommitted: 3,
  openSlots: 1,
  postingType: "group_owner"
};

export const previousPartnersSeed = [
  {
    id: "partner-1",
    profileId: 2,
    lastPlayed: "Last played 2 weeks ago",
    chemistry: "Easygoing match",
    availablePosting: {
      course: "Harbor Dunes",
      teeTime: "Sun · 7:54 AM",
      openSlots: 1,
      note: "Need one more walker for an early loop."
    }
  },
  {
    id: "partner-2",
    profileId: 3,
    lastPlayed: "Last played in February",
    chemistry: "Competitive fit",
    availablePosting: null
  },
  {
    id: "partner-3",
    profileId: 4,
    lastPlayed: "Played together last month",
    chemistry: "Great pace match",
    availablePosting: {
      course: "Pebble Ridge",
      teeTime: "Sat · 1:18 PM",
      openSlots: 2,
      note: "Looking to pair back up for an afternoon game."
    }
  }
];
