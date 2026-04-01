export const verifiedCourses = [
  "Pebble Ridge",
  "Harbor Dunes",
  "Pine Hollow",
  "Willow Creek Club",
  "Canyon Links",
  "Oak Run Golf Club"
];

export const availabilityDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const availabilityWindows = ["Any time", "Early morning", "Mid-morning", "Afternoon", "Twilight"];
export const genderOptions = ["Prefer not to say", "Woman", "Man", "Non-binary"];
export const genderPreferenceOptions = ["Anyone", "Women", "Men", "Non-binary golfers"];

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
    homeCourse: "Pebble Ridge",
    mobilityPreference: "walking",
    musicPreference: "music_okay",
    preferredVibe: "social",
    gender: "Woman",
    availableDays: ["Sat", "Sun"],
    availabilityWindow: "Early morning",
    verifiedCourse: true,
    completedRounds: 12,
    reliabilityRating: 4.9
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
    homeCourse: "Harbor Dunes",
    mobilityPreference: "cart",
    musicPreference: "music_okay",
    preferredVibe: "social",
    gender: "Man",
    availableDays: ["Fri", "Sat"],
    availabilityWindow: "Mid-morning",
    verifiedCourse: true,
    completedRounds: 18,
    reliabilityRating: 4.8
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
    homeCourse: "Pebble Ridge",
    mobilityPreference: "walking",
    musicPreference: "no_music",
    preferredVibe: "competitive",
    gender: "Man",
    availableDays: ["Thu", "Sat", "Sun"],
    availabilityWindow: "Early morning",
    verifiedCourse: true,
    completedRounds: 26,
    reliabilityRating: 5
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
    homeCourse: "Pebble Ridge",
    mobilityPreference: "walking",
    musicPreference: "no_music",
    preferredVibe: "competitive",
    gender: "Man",
    availableDays: ["Sat", "Sun"],
    availabilityWindow: "Early morning",
    verifiedCourse: true,
    completedRounds: 9,
    reliabilityRating: 4.7
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
    homeCourse: "Pine Hollow",
    mobilityPreference: "either",
    musicPreference: "music_okay",
    preferredVibe: "social",
    gender: "Man",
    availableDays: ["Wed", "Fri", "Sat"],
    availabilityWindow: "Twilight",
    verifiedCourse: true,
    completedRounds: 7,
    reliabilityRating: 4.6
  },
  {
    id: 6,
    type: "Single",
    name: "Avery Brooks",
    age: 27,
    course: "Willow Creek Club",
    teeTime: "Sun · 9:10 AM",
    handicap: "8.7",
    slots: 1,
    vibe: "Competitive",
    pace: "Fast",
    bio: "Usually out for a focused morning loop and loves pairing with golfers who keep things moving.",
    tags: ["Low cap", "Walks 18", "Early tee times"],
    image:
      "linear-gradient(180deg, rgba(13, 41, 28, 0.14), rgba(13, 41, 28, 0.56)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80')",
    fit: "Strong pace match",
    distanceMiles: 12,
    handicapValue: 8.7,
    homeCourse: "Willow Creek Club",
    mobilityPreference: "walking",
    musicPreference: "no_music",
    preferredVibe: "competitive",
    gender: "Non-binary",
    availableDays: ["Sun"],
    availabilityWindow: "Mid-morning",
    verifiedCourse: true,
    completedRounds: 15,
    reliabilityRating: 4.9
  },
  {
    id: 7,
    type: "Group",
    name: "Oak Run Regulars",
    age: "3 golfers",
    course: "Oak Run Golf Club",
    teeTime: "Fri · 5:22 PM",
    handicap: "13 avg",
    slots: 1,
    vibe: "Social",
    pace: "Relaxed",
    bio: "End-of-week twilight group looking for one more golfer who likes a quick drink after the round.",
    tags: ["Twilight", "After-work round", "Cart friendly"],
    image:
      "linear-gradient(180deg, rgba(13, 41, 28, 0.12), rgba(13, 41, 28, 0.5)), url('https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=900&q=80')",
    fit: "Easy social fit",
    distanceMiles: 19,
    handicapValue: 13,
    homeCourse: "Oak Run Golf Club",
    mobilityPreference: "cart",
    musicPreference: "music_okay",
    preferredVibe: "social",
    gender: "Man",
    availableDays: ["Fri"],
    availabilityWindow: "Twilight",
    verifiedCourse: true,
    completedRounds: 11,
    reliabilityRating: 4.7
  },
  {
    id: 8,
    type: "Single",
    name: "Sofia Patel",
    age: 33,
    course: "Canyon Links",
    teeTime: "Thu · 7:42 AM",
    handicap: "17.1",
    slots: 1,
    vibe: "Social",
    pace: "Ready golf",
    bio: "Plays before work when possible and is great with newer golfers or anyone just trying to enjoy the morning.",
    tags: ["Early bird", "Friendly", "9-hole flexible"],
    image:
      "linear-gradient(180deg, rgba(13, 41, 28, 0.14), rgba(13, 41, 28, 0.54)), url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80')",
    fit: "Beginner-friendly fit",
    distanceMiles: 16,
    handicapValue: 17.1,
    homeCourse: "Canyon Links",
    mobilityPreference: "either",
    musicPreference: "music_okay",
    preferredVibe: "social",
    gender: "Woman",
    availableDays: ["Thu", "Fri"],
    availabilityWindow: "Early morning",
    verifiedCourse: true,
    completedRounds: 20,
    reliabilityRating: 4.8
  }
];

export const defaultUser = {
  name: "",
  homeCourse: "",
  handicap: 12.4,
  distance: 25,
  handicapRange: 8,
  playMode: "group_owner",
  groupSize: 3,
  preferredVibe: "any",
  gender: "Prefer not to say",
  genderPreference: "Anyone",
  mobilityPreference: "either",
  musicPreference: "either",
  availableDays: ["Sat", "Sun"],
  availabilityWindow: "Any time"
};

export const defaultTeeTime = {
  id: "tt-100",
  teeDate: "2026-04-04",
  teeTime: "08:12",
  dayLabel: "Saturday 8:12 AM",
  homeCourse: "Pebble Ridge",
  golfersCommitted: 3,
  openSlots: 1,
  postingType: "group_owner",
  holes: 18,
  note: "Early weekend round. Looking for someone easy to pair with and on time."
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

export const coursePagesSeed = [
  {
    id: "course-1",
    name: "Pebble Ridge",
    location: "Westchester County",
    vibe: "Fast greens, strong morning regulars, good walking culture.",
    activePostings: 4,
    bestFor: "Competitive mornings and serious but social groups"
  },
  {
    id: "course-2",
    name: "Harbor Dunes",
    location: "Long Island coast",
    vibe: "Windy, fun, and popular with buddy trips and visitors.",
    activePostings: 2,
    bestFor: "Social rounds and destination golf pairings"
  },
  {
    id: "course-3",
    name: "Oak Run Golf Club",
    location: "North Jersey",
    vibe: "Reliable after-work crowd with a strong twilight scene.",
    activePostings: 3,
    bestFor: "Quick 9s and twilight foursomes"
  }
];

export const notificationsSeed = [
  {
    id: "notif-1",
    title: "New match ready",
    body: "Brooklyn Birdies matched with your Saturday posting.",
    timeLabel: "2m ago",
    type: "match",
    unread: true
  },
  {
    id: "notif-2",
    title: "Previous partner posted again",
    body: "Sunrise Scramble has another opening this weekend.",
    timeLabel: "1h ago",
    type: "partner",
    unread: true
  },
  {
    id: "notif-3",
    title: "Rated 5 stars",
    body: "Your last round at Pebble Ridge received a 5-star review.",
    timeLabel: "Yesterday",
    type: "rating",
    unread: false
  }
];

export const roundHistorySeed = [
  {
    id: "round-1",
    matchId: "seed-round-1",
    title: "Pebble Ridge Morning Four",
    course: "Pebble Ridge",
    dateLabel: "Mar 23, 2026",
    partnerName: "Jordan Alvarez",
    result: "Played",
    rating: 5,
    note: "Great pace, strong fit, easy to rebook.",
    scorecard: {
      holes: 9,
      scores: [5, 4, 4, 5, 4, 3, 5, 4, 4],
      total: 38
    }
  },
  {
    id: "round-2",
    matchId: "seed-round-2",
    title: "Harbor Dunes Visitor Group",
    course: "Harbor Dunes",
    dateLabel: "Mar 9, 2026",
    partnerName: "Brooklyn Birdies",
    result: "Played",
    rating: 4,
    note: "Fun group, slightly slower on the back nine.",
    scorecard: {
      holes: 18,
      scores: [5, 4, 6, 4, 5, 3, 5, 5, 4, 4, 5, 4, 4, 5, 3, 5, 5, 4],
      total: 80
    }
  }
];
