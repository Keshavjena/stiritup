import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import existing questions
import { getGameContent } from './questions.ts';

// Base games list from questions.ts
const gameIds = [
  "never-have-i-ever",
  "truth-or-dare",
  "whos-most-likely",
  "would-you-rather",
  "if-you-had-to",
  "drink-if",
  "hot-seat",
  "paranoia",
  "kiss-marry-kill",
  "spin-the-bottle",
  "rapid-fire",
  "strip-or-sip",
  "emoji-decode",
  "role-roulette",
  "custom-game"
];

// Let's create an expansion of questions focusing on boy/girl, relationship drama, kinks, fantasies, weird stuff, and kiss marry kill options

const kmkOptions = {
  standard: [
    "Batman", "Superman", "Spider-Man",
    "Harry Potter", "Ron Weasley", "Hermione Granger",
    "Taylor Swift", "Ariana Grande", "Billie Eilish",
    "Iron Man", "Captain America", "Thor",
    "Barbie", "Ken", "Oppenheimer",
    "Zendaya", "Timothée Chalamet", "Tom Holland",
    "Ryan Gosling", "Margot Robbie", "Cillian Murphy",
    "Wednesday Addams", "Percy Jackson", "Katniss Everdeen",
    "Sherlock Holmes", "John Watson", "Moriarty",
    "Luke Skywalker", "Princess Leia", "Han Solo",
    "Jack Dawson", "Rose DeWitt Bukater", "The Iceberg",
    "Shrek", "Fiona", "Donkey",
    "Dora the Explorer", "Diego", "Boots the Monkey"
  ],
  challenge: [
    "The person sitting to your left", "The person sitting to your right", "The host of the party",
    "Your current boss", "Your high school math teacher", "Your childhood crush",
    "Your ex", "Your ex's best friend", "Your current crush",
    "The most quiet person in the room", "The loudest person in the room", "The person with the best outfit",
    "A fitness influencer", "A crypto bro", "A corporate manager",
    "Your landlord", "Your Uber driver", "A random cashier",
    "The player sitting directly opposite to you", "Your partner's best friend", "Your best friend's sibling"
  ],
  spicy: [
    "A popular adult movie star", "A famous lingerie model", "A seductive vampire",
    "Someone you had a one-night stand with", "A coworker you find attractive", "A friends-with-benefits partner",
    "The person in this room you find most attractive", "The person in this room you find most mysterious", "The person in this room who is the best kisser",
    "A sugar daddy / sugar mama", "Your hot neighbor", "The gorgeous barista who always smiles at you",
    "An exotic dancer", "A masseuse who gave you a sensual massage", "Your secret crush's roommate",
    "The most dominant player in the room", "The most submissive player in the room", "The wild card player in the room"
  ]
};

// Generate Kiss Marry Kill questions by randomly picking 3 items from lists
function generateKMK(mode, count = 100) {
  const options = kmkOptions[mode];
  const list = [];
  const seen = new Set();
  
  for (let i = 0; i < count; i++) {
    // Pick 3 unique options
    let shuffled = [...options].sort(() => Math.random() - 0.5);
    let o1 = shuffled[0];
    let o2 = shuffled[1];
    let o3 = shuffled[2];
    
    let key = [o1, o2, o3].sort().join("|");
    if (seen.has(key)) {
      i--;
      continue;
    }
    seen.add(key);
    list.push(`Choose between: ${o1}, ${o2}, and ${o3} for Kiss, Marry, and Kill.`);
  }
  return list;
}

const wyrOptions = {
  standard: [
    ["always speak in rhyme", "always sing instead of speaking"],
    ["announce your arrival every time you enter a room", "never be able to speak first"],
    ["lose the ability to read", "lose the ability to speak"],
    ["have no taste buds", "be colorblind"],
    ["live without the internet", "live without heating and air conditioning"],
    ["always have wet socks", "always have sticky hands"],
    ["fight 100 toy-sized dinosaurs", "fight one dinosaur-sized toy"],
    ["be able to fly at walking speed", "run at 100mph but only backwards"],
    ["have a third eye", "have a third arm"],
    ["only eat sweet food", "only eat savory food"],
    ["smell like onions forever", "smell like garbage forever"],
    ["always be 15 minutes late", "always be 25 minutes early"],
    ["have your thoughts projected on a screen above your head", "have everything you do live-streamed to your family"],
    ["have hands instead of feet", "have feet instead of hands"],
    ["only speak in whispers", "only speak in shouts"],
    ["have to sleep on the floor forever", "never be able to use a pillow"],
    ["control animals with your mind", "control electronics with your mind"],
    ["live in a house shaped like a giant toilet", "live in a house shaped like a giant boot"]
  ],
  challenge: [
    ["show everyone in the room your search history", "give someone your phone unlocked for 5 minutes"],
    ["drink a mystery concoction made by the group", "let them text anyone from your contact list"],
    ["shave off your eyebrows", "wear your clothes inside out for a week"],
    ["lick the bottom of your shoe", "eat a raw onion"],
    ["post your most embarrassing selfie", "transfer 20 dollars to the host"],
    ["reveal your worst secret", "take three shots"],
    ["let someone post whatever they want on your Instagram for a day", "send an apology text to your ex"],
    ["let the person to your left do your makeup while blindfolded", "shave one of your legs"],
    ["let the group search your closet", "let the group read your last 10 DMs"],
    ["snort a line of black pepper", "let the group paint your nails whatever color they choose"]
  ],
  spicy: [
    ["hook up with someone in this room", "have your ex back"],
    ["be caught having sex by your parents", "walk in on your parents having sex"],
    ["do it with the lights fully on", "do it completely in the dark"],
    ["try roleplay in public", "use blindfolds and handcuffs in private"],
    ["sleep with your best friend's ex", "sleep with your boss"],
    ["have an open relationship", "never have sex again"],
    ["have sex on a kitchen counter in front of friends", "have sex in a public bathroom stall"],
    ["reveal your exact body count", "reveal your weirdest kink to the group"],
    ["have a threesome with two strangers", "have a threesome with your partner and their best friend"],
    ["let the group see your folder of explicit photos/videos", "let the group see your adult website history"],
    ["hook up with someone who is a terrible kisser but rich", "hook up with someone who is amazing in bed but broke"],
    ["be tied up", "be the one doing the tying up"],
    ["use food during sex (like whipped cream)", "use temperature play (like ice/wax)"],
    ["have sex in a moving car", "have sex on a beach at night"],
    ["have a one-night stand with someone in this room", "hook up with a celebrity you hate"],
    ["let your partner sleep with someone else once", "never have sex with your partner again"],
    ["roleplay as boss/employee", "roleplay as stranger/stranger in a bar"],
    ["have a quickie in an office elevator", "have a quickie in a fitting room"],
    ["try a public kink (like flashing)", "try a BDSM dungeon visit"],
    ["sleep with someone twice your age", "sleep with someone half your age (but legal)"]
  ]
};

function generateWYR(mode, count = 100) {
  const options = wyrOptions[mode];
  const list = [];
  const seen = new Set();
  
  // First add all base choices
  for (const pair of options) {
    list.push(`Would you rather ${pair[0]} or ${pair[1]}?`);
  }
  
  // If we need more, let's mix and match if possible or generate templates
  if (list.length < count) {
    // Flatten individual choices
    const choices = options.flat();
    while (list.length < count) {
      let c1 = choices[Math.floor(Math.random() * choices.length)];
      let c2 = choices[Math.floor(Math.random() * choices.length)];
      if (c1 === c2) continue;
      
      let key = [c1, c2].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      
      list.push(`Would you rather ${c1} or ${c2}?`);
    }
  }
  
  return list;
}

// Custom lists for extra questions
const extraQuestions = {
  "never-have-i-ever": {
    standard: [
      "Never have I ever stalked an ex's new partner on Instagram.",
      "Never have I ever pretended to be on the phone to avoid someone.",
      "Never have I ever peed in a swimming pool.",
      "Never have I ever lied to a doctor.",
      "Never have I ever tried to reuse a coupon that was expired.",
      "Never have I ever fallen asleep on public transit and missed my stop.",
      "Never have I ever lied about my birthday to get free dessert at a restaurant.",
      "Never have I ever double-texted someone after being ignored for a day.",
      "Never have I ever re-gifted something I received.",
      "Never have I ever spent more than $100 on a mobile game.",
      "Never have I ever practiced an award acceptance speech in the shower.",
      "Never have I ever ghosted a date because they looked different than their pictures.",
      "Never have I ever snuck food into a movie theater.",
      "Never have I ever pretended to like a gift that I absolutely hated.",
      "Never have I ever stalked someone's Venmo transactions to see who they were hanging out with.",
      "Never have I ever crop-dusted a room and walked away.",
      "Never have I ever pretended to be sick to get out of a family event.",
      "Never have I ever put someone on mute on social media because they posted too much.",
      "Never have I ever tried to open a bottle with my teeth.",
      "Never have I ever cut my own hair and instantly regretted it."
    ],
    challenge: [
      "Never have I ever had a crush on a friend's parent.",
      "Never have I ever lied about my relationship history to sound more experienced.",
      "Never have I ever snooped in a partner's drawers when left alone in their room.",
      "Never have I ever hooked up with someone from a dating app on the first day we matched.",
      "Never have I ever sent a risky text and immediately turned my phone off out of fear.",
      "Never have I ever flirted with a bartender to get free drinks.",
      "Never have I ever lied to get out of a date.",
      "Never have I ever had a crush on a coworker.",
      "Never have I ever hooked up with my ex while they were dating someone else.",
      "Never have I ever stayed in a toxic relationship just for the good sex.",
      "Never have I ever kissed someone just to make someone else jealous.",
      "Never have I ever bad-mouthed my partner to my friends.",
      "Never have I ever slept with a friend and pretended it never happened.",
      "Never have I ever ghosted someone after three or more dates.",
      "Never have I ever been caught checking out someone's assets in public.",
      "Never have I ever lied about my age on a dating profile.",
      "Never have I ever hooked up with someone in a hot tub.",
      "Never have I ever had a secret crush on someone in this room for over 6 months.",
      "Never have I ever dated someone just for their money or status.",
      "Never have I ever checked a partner's location without their knowledge."
    ],
    spicy: [
      "Never have I ever used a sex toy during a video call.",
      "Never have I ever had a fantasy about a coworker or boss that kept me awake.",
      "Never have I ever been walk in on during self-pleasure.",
      "Never have I ever slept with someone whose name I forgot the next morning.",
      "Never have I ever had a secret relationship that absolutely no one knew about.",
      "Never have I ever had sex in a public pool or beach.",
      "Never have I ever sent a dirty photo to the wrong person.",
      "Never have I ever had sex in the workplace after hours.",
      "Never have I ever roleplayed as a teacher and student.",
      "Never have I ever tried light BDSM (handcuffs, blindfolds, ropes).",
      "Never have I ever had a crush on my best friend's sibling.",
      "Never have I ever hooked up with someone in a public cinema.",
      "Never have I ever had sex in a car parked in a residential area.",
      "Never have I ever been to an adult store and bought toys.",
      "Never have I ever had a fantasy about someone in this room.",
      "Never have I ever slept with a roommate's friend.",
      "Never have I ever had a one-night stand that turned into a relationship.",
      "Never have I ever had a sex tape recorded of me.",
      "Never have I ever engaged in temperature play (hot wax, ice cube foreplay).",
      "Never have I ever hooked up with someone in a bathroom stall at a party.",
      "Never have I ever had a fantasy about a BDSM dungeon.",
      "Never have I ever tried cybersex or phone sex.",
      "Never have I ever kissed someone of the same gender while in a relationship with another.",
      "Never have I ever had a taboo fantasy that I would never share with my partner.",
      "Never have I ever hooked up with someone who was twice my age.",
      "Never have I ever had sex while my roommates or family were in the same house/apartment.",
      "Never have I ever used whipped cream, chocolate syrup, or honey in bed.",
      "Never have I ever given or received a lap dance.",
      "Never have I ever had an orgasm in a public place.",
      "Never have I ever participated in a strip game like strip poker."
    ]
  },
  "truth-or-dare": {
    standard: [
      "Truth: What's the biggest lie you've ever told your parents?",
      "Dare: Let the person to your left draw a tattoo on your arm with a pen.",
      "Truth: What is your most embarrassing childhood nickname?",
      "Dare: Speak in an accent of the group's choice for the next 2 rounds.",
      "Truth: Have you ever stalked a crush online for more than an hour?",
      "Dare: Text a random contact: 'I know what you did' and don't reply.",
      "Truth: What is your worst habit?",
      "Dare: Allow someone to go through your camera roll for 30 seconds.",
      "Truth: What's the weirdest thing you've eaten?",
      "Dare: Drink a mixture of water, salt, and pepper.",
      "Truth: Have you ever lied about reading a book or watching a movie to look cool?",
      "Dare: Let the person to your right style your hair however they want.",
      "Truth: What's the most childish thing you still do?",
      "Dare: Do 15 squats while holding a cup of water on your head.",
      "Truth: What's your biggest guilty pleasure?",
      "Dare: Put an ice cube down your shirt and keep it there until it melts."
    ],
    challenge: [
      "Truth: Who in this room do you find most attractive and why?",
      "Dare: Let the group text anything they want to your ex from your phone.",
      "Truth: What is the most illegal thing you have ever done?",
      "Dare: Take off one item of clothing (excluding jewelry).",
      "Truth: Have you ever cheated on a test or exam?",
      "Dare: Give the person sitting next to you a 2-minute back massage.",
      "Truth: What's the worst text message you've sent to the wrong person?",
      "Dare: Let someone scroll through your Instagram DMs for 1 minute.",
      "Truth: Who was your most recent crush and why didn't it work out?",
      "Dare: Blindfold yourself and guess who is touching your face.",
      "Truth: Have you ever snooped through a partner's phone?",
      "Dare: Let the group inspect your search history for 2 minutes."
    ],
    spicy: [
      "Truth: What is your absolute weirdest kink or turn-on?",
      "Dare: Give a lap dance to the person of your choice in the room for 1 minute.",
      "Truth: Describe your wildest sexual fantasy in detail.",
      "Dare: Seductively whisper a dirty secret in the ear of the person to your right.",
      "Truth: Have you ever had a one-night stand? Describe it.",
      "Dare: Remove your shirt (or a major piece of clothing) and keep it off for 3 rounds.",
      "Truth: What is your favorite sexual position and why?",
      "Dare: Make out with the person you find most attractive in this room for 30 seconds (or take a shot).",
      "Truth: What is your body count? Be honest.",
      "Dare: Seductively eat a banana or piece of fruit while looking at the person opposite to you.",
      "Truth: Have you ever had sex in a public or unusual place? Where?",
      "Dare: Let someone place an ice cube on your neck and slide it down your shirt.",
      "Truth: What is the most taboo thought or fantasy you've ever had?",
      "Dare: Seductively massage someone's thighs for 1 minute.",
      "Truth: Have you ever faked an orgasm? Tell the story.",
      "Dare: Do a sensual striptease for 1 minute or finish your drink.",
      "Truth: Have you ever sent or received explicit photos? Who was the last person?",
      "Dare: Show the group the last dirty text message you sent or received."
    ]
  },
  "whos-most-likely": {
    standard: [
      "Who is most likely to get lost in a supermarket?",
      "Who is most likely to win a reality TV show?",
      "Who is most likely to spend all their money on a dumb purchase?",
      "Who is most likely to believe a ridiculous conspiracy theory?",
      "Who is most likely to cry during a comedy film?",
      "Who is most likely to forget where they parked their car?",
      "Who is most likely to eat pizza for breakfast, lunch, and dinner?",
      "Who is most likely to survive a zombie apocalypse?",
      "Who is most likely to become a cat person/dog person with 10 pets?",
      "Who is most likely to sleep through a fire alarm?"
    ],
    challenge: [
      "Who is most likely to text their ex at 2 AM?",
      "Who is most likely to get kicked out of a bar or club?",
      "Who is most likely to lie on their resume and get hired?",
      "Who is most likely to ghost someone after a seemingly perfect date?",
      "Who is most likely to pick a fight with an internet stranger?",
      "Who is most likely to snoop through a friend's medicine cabinet?",
      "Who is most likely to have a secret tattoo they haven't told anyone about?",
      "Who is most likely to run away to join a cult?",
      "Who is most likely to marry for money instead of love?",
      "Who is most likely to become a sugar baby or sugar daddy/mama?"
    ],
    spicy: [
      "Who is most likely to start an OnlyFans account?",
      "Who is most likely to have a secret sex tape stored on their phone?",
      "Who is most likely to have a threesome or multi-partner experience?",
      "Who is most likely to sleep with a colleague or boss?",
      "Who is most likely to hook up in a public elevator or stairwell?",
      "Who is most likely to be into BDSM, chains, and whips?",
      "Who is most likely to have a body count in the double or triple digits?",
      "Who is most likely to have a secret kink diary?",
      "Who is most likely to send explicit photos to the wrong person?",
      "Who is most likely to hook up with someone in this room tonight?",
      "Who is most likely to have sex on a first date?",
      "Who is most likely to have a friend-with-benefits situation that goes horribly wrong?"
    ]
  },
  "drink-if": {
    standard: [
      "Drink if you are wearing socks.",
      "Drink if you have peed in a pool or ocean.",
      "Drink if you have a tattoo.",
      "Drink if you have a piercing.",
      "Drink if you are currently single.",
      "Drink if you have a dog.",
      "Drink if you have traveled to another country.",
      "Drink if you are wearing glasses or contacts.",
      "Drink if you have ever had a crush on a fictional character.",
      "Drink if you've lied about your age."
    ],
    challenge: [
      "Drink if you have texted an ex in the last 30 days.",
      "Drink if you checked your phone in the last 5 minutes.",
      "Drink if you have ever snooped through a partner's phone.",
      "Drink if you have ever lied to get out of a date.",
      "Drink if you have ever stalked an ex online.",
      "Drink if you have a crush on someone in this room.",
      "Drink if you've ever had a one-night stand.",
      "Drink if you've ever hooked up with a coworker.",
      "Drink if you have ever ghosted someone.",
      "Drink if you've ever been arrested or detained."
    ],
    spicy: [
      "Drink if you have ever sent an explicit photo.",
      "Drink if you have ever had sex in a car.",
      "Drink if you have ever slept with someone in this room.",
      "Drink if you've ever had sex in a public or outdoor place.",
      "Drink if you've ever used sex toys.",
      "Drink if you have ever had a threesome.",
      "Drink if you've ever been tied up or blindfolded during intimacy.",
      "Drink if you have ever faked an orgasm.",
      "Drink if you are wearing sexy underwear right now.",
      "Drink if you've ever roleplayed in the bedroom.",
      "Drink if you have ever had sex while someone else was in the room.",
      "Drink if you've ever had a sugar daddy or sugar mama."
    ]
  },
  "if-you-had-to": {
    standard: [
      "If you had to live in a video game universe for a year, which one would it be?",
      "If you had to delete all social media apps except one, which one would you keep?",
      "If you had to eat only one food for the rest of your life, what would it be?",
      "If you had to lose one of your five senses, which one would it be?",
      "If you had to become an animal for a week, which one would you choose?"
    ],
    challenge: [
      "If you had to marry one player in this room, who would you choose?",
      "If you had to swap lives with one player in this room for a week, who would it be?",
      "If you had to ignore one player in this room for the rest of the game, who would it be?",
      "If you had to pick one person in this room to go to prison with, who would it be?",
      "If you had to delete your entire search history or your entire camera roll, which would you pick?"
    ],
    spicy: [
      "If you had to sleep with one player's sibling, who would you choose?",
      "If you had to hook up with someone in this room right now, who would it be?",
      "If you had to choose between your current partner or your absolute celebrity crush, who would it be?",
      "If you had to choose between a one-night stand or a long-term relationship for the rest of your life, which would you pick?",
      "If you had to reveal your weirdest kink to your parents or post it on Facebook, which would you choose?",
      "If you had to participate in a threesome with your ex and a stranger, or with two of your partner's friends, which would you pick?",
      "If you had to let the group watch you make out with someone in this room for 1 minute or strip to your underwear, which would you choose?"
    ]
  },
  "hot-seat": {
    standard: [
      "What is the most embarrassing nickname you have ever had?",
      "What is your biggest pet peeve?",
      "What is the worst fashion trend you ever followed?",
      "What is your dream holiday destination?",
      "What is the most childish thing you still do?"
    ],
    challenge: [
      "What is the biggest lie you have ever told to get out of a date?",
      "Who in this room do you think is the most dramatic?",
      "What is the most illegal thing you have ever done?",
      "Have you ever lied about your salary or job?",
      "What is your biggest regret in life?",
      "What is the worst date you've ever been on?"
    ],
    spicy: [
      "What is your wildest bedroom fantasy?",
      "Have you ever had a crush on someone in this room? If yes, who?",
      "What is the most adventurous thing you've done in bed?",
      "Describe your most awkward romantic encounter in detail.",
      "What is your favorite position and why?",
      "What is your biggest sexual turn-off?",
      "Have you ever slept with someone significantly older or younger than you? What was the age gap?",
      "What is the weirdest place you've ever masturbated?",
      "If you could have a threesome with anyone in this room, who would you choose?",
      "What is your body count and are you happy with it?"
    ]
  },
  "paranoia": {
    standard: [
      "Who in the room has the worst fashion sense?",
      "Who is most likely to win a reality TV show?",
      "Who is the most organized person here?",
      "Who is the most likely to get lost?"
    ],
    challenge: [
      "Who in the room is the biggest flirt?",
      "Who is most likely to go through their partner's phone?",
      "Who would you trust the least with a big secret?",
      "Who in this room is the most dramatic?",
      "Who in the room makes the worst relationship choices?"
    ],
    spicy: [
      "Who in this room is the best kisser?",
      "Who would you most want to see in a swimsuit?",
      "Who has the highest body count here?",
      "Who would you most want to sleep with in this room?",
      "Who in this room has the wildest kinks?",
      "Who in this room is most likely to have a secret friends-with-benefits?",
      "Who do you think has the best bedroom skills in this room?"
    ]
  },
  "spin-the-bottle": {
    standard: [
      "Spin the bottle. The person it points to must tell a secret or take a sip.",
      "Spin the bottle. The person it points to must do their best runway walk.",
      "Spin the bottle. The person it points to must sing a song chosen by the group."
    ],
    challenge: [
      "Spin the bottle. You must hold hands with that person for the next round.",
      "Spin the bottle. Let that person write a tweet from your account.",
      "Spin the bottle. The person it points to must let you browse their gallery for 10 seconds."
    ],
    spicy: [
      "Spin the bottle. Kiss that person on the cheek or take a drink.",
      "Spin the bottle. Seductively whisper a secret to that person.",
      "Spin the bottle. You must kiss that person or take a shot.",
      "Spin the bottle. Give that person a neck kiss for 5 seconds.",
      "Spin the bottle. Blindfold that person and whisper something dirty in their ear.",
      "Spin the bottle. Take off one item of clothing or make out with that person."
    ]
  },
  "rapid-fire": {
    standard: [
      "Cats or Dogs? Answer in 1 second.",
      "Coffee or Tea? Answer in 1 second.",
      "Netflix or Cinema? Answer in 1 second.",
      "Summer or Winter? Answer in 1 second.",
      "Early bird or Night owl? Answer in 1 second.",
      "Sweet or Savory? Answer in 1 second."
    ],
    challenge: [
      "Truth or Lie? Answer in 1 second.",
      "Text or Call? Answer in 1 second.",
      "Money or Love? Answer in 1 second.",
      "Brains or Beauty? Answer in 1 second.",
      "Fame or Fortune? Answer in 1 second."
    ],
    spicy: [
      "Lights on or off? Answer in 1 second.",
      "Morning or night? Answer in 1 second.",
      "Cuddling or sleeping? Answer in 1 second.",
      "Top or Bottom? Answer in 1 second.",
      "Rough or Gentle? Answer in 1 second.",
      "Spanking: Yes or No? Answer in 1 second.",
      "Submissive or Dominant? Answer in 1 second.",
      "Public sex or Private sex? Answer in 1 second."
    ]
  },
  "strip-or-sip": {
    standard: [
      "Take 1 sip or show the group a funny selfie.",
      "Take 2 sips or let the person to your left style your hair.",
      "Take 1 sip or tell the most boring story you know."
    ],
    challenge: [
      "Take 3 sips or remove your socks.",
      "Take 2 sips or remove your belt or jewelry.",
      "Take 3 sips or let someone draw on your arm."
    ],
    spicy: [
      "Take a shot or remove an item of clothing.",
      "Take 5 sips or stay in your underwear for the next round.",
      "Take a double shot or exchange shirts with the person to your left.",
      "Remove two items of clothing or finish your entire drink.",
      "Allow the person to your right to remove one item of clothing from you, or take 4 sips.",
      "Strip down to your underwear for 3 rounds, or take 3 shots."
    ]
  },
  "emoji-decode": {
    standard: [
      "Guess the movie described by: Eyes, Scream, Knife. (Scream)",
      "Guess the band described by: Red, Hot, Chili, Peppers. (Red Hot Chili Peppers)",
      "Guess the city described by: Statue of Liberty, Apple. (New York)",
      "Guess the movie described by: Lion, Crown, Jungle. (Lion King)"
    ],
    challenge: [
      "Guess the phrase described by: Cat got your tongue. (🐱👅)",
      "Guess the song described by: Baby, One, More, Time. (Baby One More Time)",
      "Guess the movie described by: Ring, Volcano, Wizard. (Lord of the Rings)"
    ],
    spicy: [
      "Guess the phrase described by: Netflix and chill. (📺❄️🍿)",
      "Guess the activity described by: Bedroom, handcuffs, whip. (⛓️😈🛏️)",
      "Guess the movie described by: Fifty, Shades, Grey. (5️⃣0️⃣🕶️🩶)",
      "Guess the activity described by: Peach, Eggplant, Raindrops. (🍑🍆💦)"
    ]
  },
  "role-roulette": {
    standard: [
      "Act like an angry chef for 30 seconds.",
      "Act like a weather forecaster during a hurricane.",
      "Act like a tourist lost in a big city."
    ],
    challenge: [
      "Act like you are proposing to a mannequin.",
      "Act like you are a personal trainer for a lazy client.",
      "Act like a baby crying for candy."
    ],
    spicy: [
      "Act like a flirty barista taking an order.",
      "Seductively act like you are in a perfume commercial.",
      "Act like a dramatic soap opera character in a bedroom argument.",
      "Act out a fake, highly exaggerated orgasm sound for 10 seconds.",
      "Act like a dominant boss giving orders to a submissive employee.",
      "Seductively whisper your favorite food recipe to the person to your left."
    ]
  },
  "custom-game": {
    standard: [
      "Create a custom rule for the next 3 rounds.",
      "Everyone must speak with a high-pitched voice until the next turn.",
      "Tell a funny joke or take a drink."
    ],
    challenge: [
      "The host gets to choose a challenge for you.",
      "Exchange seats with the person furthest from you.",
      "Perform a 10-second plank."
    ],
    spicy: [
      "Whisper a dirty joke to the player of your choice.",
      "Take a sip from the drink of the player to your right.",
      "Rate the outfit of everyone in the room.",
      "Show the group your best bedroom face."
    ]
  }
};

// Build the final database
const db = {};

for (const gameId of gameIds) {
  db[gameId] = {
    standard: [],
    challenge: [],
    spicy: []
  };
  
  // 1. Get original questions
  const modes = ["standard", "challenge", "spicy"];
  for (const mode of modes) {
    // getGameContent is function getGameContent(gameId, matureContent, gameMode)
    // We can simulate getGameContent
    // Let's call getGameContent directly
    // Wait, getGameContent returns the questions for a specific mode/mature combo
    // Let's call it with matureContent = true and gameMode = mode
    let baseQuestions = [];
    try {
      baseQuestions = getGameContent(gameId, true, mode);
    } catch (e) {
      console.log(`Error getting original content for ${gameId}:${mode}`, e);
    }
    
    // De-duplicate base questions
    const set = new Set(baseQuestions);
    
    // 2. Add extra manually written questions for this gameId & mode
    const extraList = (extraQuestions[gameId] && extraQuestions[gameId][mode]) || [];
    for (const q of extraList) {
      set.add(q);
    }
    
    // 3. Programmatic additions for Would You Rather and Kiss Marry Kill
    if (gameId === "would-you-rather") {
      const extraWYR = generateWYR(mode, 150); // generate 150 WYR questions per mode
      for (const q of extraWYR) {
        set.add(q);
      }
    }
    
    if (gameId === "kiss-marry-kill") {
      const extraKMK = generateKMK(mode, 120); // generate 120 KMK options per mode
      for (const q of extraKMK) {
        set.add(q);
      }
    }
    
    // Let's also expand Never Have I Ever, Whos Most Likely, Drink If, Rapid Fire to have at least 150+ questions per mode!
    // We can generate variations programmatically to boost count to thousands.
    if (gameId === "never-have-i-ever") {
      const fillers = {
        standard: [
          "cried in public", "forgotten my wallet on a date", "walked into a glass door",
          "stalked someone on TikTok", "screamed during a horror movie", "spent money I didn't have",
          "pretended to know a famous person", "fallen asleep in a class or meeting", "googled how to do basic math",
          "stolen a pen from a bank/store", "taken food from a roommate without asking", "read someone's diary",
          "talked to myself in the mirror", "lied about where I was going", "pretended to be sick to stay home",
          "stayed awake for 24 hours straight", "been on TV or the news", "sung karaoke and cleared the room",
          "hidden a purchase from my family", "broken a bone doing something stupid"
        ],
        challenge: [
          "kissed a stranger on a dare", "lied about my age to get into a club", "snooped through a friend's room",
          "had a crush on a friend's partner", "texted the wrong person something private", "flirted to get out of a ticket",
          "had a one-night stand I instantly regretted", "been kicked out of a venue", "lied to my best friend",
          "fake-called someone to get out of a bad date", "stayed with an ex just to not be single", "made out with two people in one night",
          "stalked my ex's location", "been caught lying by my partner", "used a fake ID"
        ],
        spicy: [
          "had sex in a public park", "used handcuffs in the bedroom", "had a fantasy about someone in this room",
          "slept with my boss or manager", "recorded a sex tape", "sent a nude photo to the wrong contact",
          "had a threesome", "been walked in on during an intimate moment", "had sex in a moving car",
          "visited a strip club or adult store", "had an orgasm in a public place", "faked it in bed",
          "had sex in a swimming pool or hot tub", "slept with someone twice my age", "had sex in my parents' bed",
          "used food like whipped cream or chocolate during intimacy", "slept with a friend's sibling", "roleplayed in bed",
          "had sex on a kitchen counter", "tried temperature play with hot wax or ice"
        ]
      };
      
      const templates = fillers[mode];
      for (const t of templates) {
        set.add(`Never have I ever ${t}.`);
      }
    }
    
    if (gameId === "whos-most-likely") {
      const fillers = {
        standard: [
          "forget where they parked their car", "cry at a commercial", "win a game show",
          "become a millionaire and lose it all", "accidentally set something on fire while cooking",
          "survive a horror movie", "adopt 10 stray cats", "go a week without showering",
          "fall asleep in public", "get lost in their own hometown"
        ],
        challenge: [
          "text their ex at 3 AM", "get arrested for a minor public disturbance", "snoop through a friend's phone",
          "ghost someone after a great date", "spend their entire paycheck in one day", "start a physical fight",
          "get kicked out of a nightclub", "lie to get out of a social plan", "keep a massive secret for years"
        ],
        spicy: [
          "start an OnlyFans account", "have a secret sex tape leaked", "hook up with someone in this room",
          "have a threesome", "be caught doing it in public", "be into BDSM and ropes",
          "have a body count in the double digits", "sleep with their boss for a promotion", "have a friends-with-benefits",
          "send an explicit photo to the wrong chat"
        ]
      };
      
      const templates = fillers[mode];
      for (const t of templates) {
        set.add(`Who is most likely to ${t}?`);
      }
    }

    if (gameId === "drink-if") {
      const fillers = {
        standard: [
          "you are wearing blue", "you had coffee today", "you woke up after 9 AM",
          "you own a pet", "you have a tattoo", "you have broken a bone",
          "you can speak more than two languages", "you have a sibling", "you are wearing jewelry"
        ],
        challenge: [
          "you've stalked your ex today", "you are single and unhappy about it", "you've lied to someone in this room",
          "you checked your phone in the last 2 minutes", "you've ever used a fake ID", "you are currently tipsy",
          "you've ever peed in a pool", "you've ever cheated on a test"
        ],
        spicy: [
          "you have sent a nude photo in the last week", "you are wearing black underwear", "you've had sex in a car",
          "you have a crush on someone in this room", "you've ever had a threesome", "you've had sex in public",
          "you have a sex toy in your bag/room", "you've ever faked an orgasm", "you have slept with a coworker"
        ]
      };
      
      const templates = fillers[mode];
      for (const t of templates) {
        set.add(`Drink if ${t}.`);
      }
    }
    
    db[gameId][mode] = Array.from(set);
  }
}

// Print statistics
let total = 0;
for (const gameId in db) {
  const s = db[gameId].standard.length;
  const c = db[gameId].challenge.length;
  const sp = db[gameId].spicy.length;
  const sum = s + c + sp;
  total += sum;
  console.log(`Game: ${gameId} -> Standard: ${s}, Challenge: ${c}, Spicy: ${sp} | Total: ${sum}`);
}
console.log(`Grand Total Questions: ${total}`);

// Save to questions-db.json
const outputPath = path.join(__dirname, 'questions-db.json');
fs.writeFileSync(outputPath, JSON.stringify(db, null, 2), 'utf-8');
console.log(`Database saved successfully to ${outputPath}`);
