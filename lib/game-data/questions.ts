export function getGameContent(
  gameId: string,
  matureContent: boolean,
  gameMode: "standard" | "challenge" | "spicy",
): string[] {
  const content: Record<string, Record<string, string[]>> = {
    "never-have-i-ever": {
      standard: [
        "Never have I ever lied about my age.",
        "Never have I ever forgotten someone's name right after being introduced.",
        "Never have I ever pretended to be sick to get out of work or school.",
        "Never have I ever stalked someone on social media.",
        "Never have I ever had a crush on a friend's sibling.",
        "Never have I ever eaten food that fell on the floor.",
        "Never have I ever laughed at something I didn't understand.",
        "Never have I ever googled myself.",
        "Never have I ever had a wardrobe malfunction in public.",
        "Never have I ever sent a text to the wrong person.",
        "Never have I ever pretended to like a song just to fit in.",
        "Never have I ever fallen asleep during a movie at the theater.",
        "Never have I ever lied about reading a book I never actually read.",
        "Never have I ever pretended to be someone else online.",
        "Never have I ever cried during a commercial.",
        "Never have I ever gotten lost in my own neighborhood.",
        "Never have I ever eaten an entire pizza by myself.",
        "Never have I ever walked into a glass door.",
        "Never have I ever forgotten to wear underwear.",
        "Never have I ever laughed at my own joke when no one else did.",
        "Never have I ever pretended to be asleep to avoid doing something.",
        "Never have I ever talked to myself in public.",
        "Never have I ever waved back at someone who wasn't waving at me.",
        "Never have I ever practiced conversations in my head.",
        "Never have I ever fallen up the stairs.",
        "Never have I ever forgotten what I was saying mid-sentence.",
        "Never have I ever looked for my phone while talking on it.",
        "Never have I ever tried to push a door that said pull.",
        "Never have I ever put something in the fridge that doesn't belong there.",
        "Never have I ever called someone by the wrong name for months.",
        "Never have I ever pretended to understand a foreign language.",
        "Never have I ever worn clothes inside out all day without noticing.",
        "Never have I ever tried to look cool and failed miserably.",
        "Never have I ever made up a story to sound more interesting.",
        "Never have I ever pretended to be busy to avoid someone.",
        "Never have I ever eaten something past its expiration date.",
        "Never have I ever lied about my weight or height.",
        "Never have I ever pretended to remember someone I completely forgot.",
        "Never have I ever used a fake accent to impress someone.",
        "Never have I ever googled how to spell a simple word.",
        "Never have I ever pretended to be good at something I'm terrible at.",
        "Never have I ever lied about watching a popular TV show.",
        "Never have I ever pretended to like someone's cooking when it was awful.",
        "Never have I ever made up an excuse to leave a boring conversation.",
        "Never have I ever pretended to be interested in someone's hobby.",
        "Never have I ever lied about being late because of traffic.",
        "Never have I ever pretended to understand a joke I didn't get.",
        "Never have I ever made a fake social media account.",
        "Never have I ever pretended to be someone's friend for personal gain.",
        "Never have I ever lied about my job or salary.",
        "Never have I ever pretended to be sick to get sympathy.",
        "Never have I ever made up a story about meeting a celebrity.",
        "Never have I ever pretended to like a movie everyone else loved.",
        "Never have I ever lied about my relationship status.",
        "Never have I ever pretended to be more cultured than I am.",
        "Never have I ever made up an allergy to avoid eating something.",
        "Never have I ever pretended to be religious for someone.",
        "Never have I ever lied about my education or grades.",
        "Never have I ever pretended to like someone's pet when I didn't.",
        "Never have I ever made up a story about my childhood.",
        "Never have I ever pretended to be more athletic than I am.",
        "Never have I ever lied about reading the news.",
        "Never have I ever pretended to understand politics better than I do.",
        "Never have I ever made up a reason to cancel plans.",
        "Never have I ever pretended to be more environmentally conscious than I am.",
        "Never have I ever lied about my music taste to fit in.",
        "Never have I ever pretended to be more social than I actually am.",
        "Never have I ever made up a story about traveling somewhere I've never been.",
        "Never have I ever pretended to be more confident than I felt.",
        "Never have I ever lied about my family background.",
        "Never have I ever pretended to understand technology better than I do.",
        "Never have I ever made up an excuse to avoid exercise.",
        "Never have I ever pretended to be more organized than I am.",
        "Never have I ever lied about my cooking skills.",
        "Never have I ever pretended to be more artistic than I am.",
        "Never have I ever made up a story about my dating history.",
        "Never have I ever pretended to be more mature than I am.",
        "Never have I ever lied about my financial situation.",
        "Never have I ever pretended to be more knowledgeable about wine than I am.",
        "Never have I ever made up an excuse to leave work early.",
        "Never have I ever pretended to be more fashionable than I am.",
        "Never have I ever lied about my sleep schedule.",
        "Never have I ever pretended to be more health-conscious than I am.",
        "Never have I ever made up a story about my weekend plans.",
        "Never have I ever pretended to be more adventurous than I am.",
        "Never have I ever lied about my driving skills.",
        "Never have I ever pretended to be more tech-savvy than I am.",
        "Never have I ever made up an excuse to avoid a family gathering.",
        "Never have I ever pretended to be more spiritual than I am.",
        "Never have I ever lied about my cleaning habits.",
        "Never have I ever pretended to be more punctual than I am.",
        "Never have I ever made up a story about my work achievements.",
        "Never have I ever pretended to be more outgoing than I naturally am.",
        "Never have I ever lied about my exercise routine.",
        "Never have I ever pretended to be more cultured about food than I am.",
        "Never have I ever made up an excuse to avoid helping someone move.",
        "Never have I ever pretended to be more interested in someone's problems than I was.",
        "Never have I ever lied about my knowledge of current events.",
        "Never have I ever pretended to be more romantic than I actually am.",
        "Never have I ever made up a story about my childhood achievements.",
        "Never have I ever pretended to be more independent than I am.",
        "Never have I ever lied about my social media usage.",
        "Never have I ever pretended to be more environmentally friendly than I am.",
        "Never have I ever made up an excuse to avoid a blind date.",
        "Never have I ever pretended to be more creative than I actually am.",
        "Never have I ever lied about my shopping habits.",
        "Never have I ever pretended to be more intellectual than I am."
      ],
      challenge: [
        "Never have I ever had a one-night stand.",
        "Never have I ever kissed someone I just met.",
        "Never have I ever lied to get out of a date.",
        "Never have I ever had a crush on my boss.",
        "Never have I ever snooped through someone's phone.",
        "Never have I ever pretended to orgasm.",
        "Never have I ever had sex in a public place.",
        "Never have I ever sent a nude photo.",
        "Never have I ever cheated on a partner.",
        "Never have I ever had a threesome fantasy.",
        "Never have I ever flirted with someone just to get free drinks.",
        "Never have I ever made out with someone at a party.",
        "Never have I ever had phone sex.",
        "Never have I ever used a dating app just for hookups.",
        "Never have I ever had a friends with benefits situation.",
        "Never have I ever kissed someone of the same gender.",
        "Never have I ever had sex on the first date.",
        "Never have I ever faked being single to flirt with someone.",
        "Never have I ever had a sexual dream about someone in this room.",
        "Never have I ever watched adult content with someone else.",
        "Never have I ever had a crush on a teacher or professor.",
        "Never have I ever sexted during work or class.",
        "Never have I ever had sex in a car.",
        "Never have I ever been to a strip club.",
        "Never have I ever had a one-night stand I regretted.",
        "Never have I ever hooked up with someone I work with.",
        "Never have I ever had sex while drunk.",
        "Never have I ever been in a relationship for the wrong reasons.",
        "Never have I ever cheated on a test or exam.",
        "Never have I ever lied about my sexual experience.",
        "Never have I ever had a crush on my friend's partner.",
        "Never have I ever been caught masturbating.",
        "Never have I ever had sex in my parents' house.",
        "Never have I ever used a fake ID.",
        "Never have I ever stolen something from a store.",
        "Never have I ever lied about my age to get into a club.",
        "Never have I ever had sex with someone whose name I didn't know.",
        "Never have I ever been arrested or detained by police.",
        "Never have I ever done drugs.",
        "Never have I ever driven under the influence.",
        "Never have I ever been in a physical fight.",
        "Never have I ever vandalized property.",
        "Never have I ever snuck out of my house as a teenager.",
        "Never have I ever been kicked out of a bar or club.",
        "Never have I ever had sex in a bathroom stall.",
        "Never have I ever been unfaithful in a relationship.",
        "Never have I ever had a sugar daddy or sugar mama.",
        "Never have I ever been to a sex shop.",
        "Never have I ever had a one-night stand with a stranger.",
        "Never have I ever been in love with two people at the same time.",
        "Never have I ever had sex outdoors.",
        "Never have I ever been caught having sex.",
        "Never have I ever used handcuffs or restraints during sex.",
        "Never have I ever had sex in a hotel room.",
        "Never have I ever been to a nude beach.",
        "Never have I ever had sex in water.",
        "Never have I ever role-played during sex.",
        "Never have I ever had sex with someone significantly older or younger.",
        "Never have I ever been to a sex party.",
        "Never have I ever had sex in an unusual location.",
        "Never have I ever been in a polyamorous relationship.",
        "Never have I ever had sex while someone else was in the room.",
        "Never have I ever used sex toys.",
        "Never have I ever had a sexual encounter I kept secret.",
        "Never have I ever been sexually attracted to a cartoon character.",
        "Never have I ever had sex multiple times in one day.",
        "Never have I ever been to a brothel or hired an escort.",
        "Never have I ever had sex in a moving vehicle.",
        "Never have I ever been part of a booty call arrangement.",
        "Never have I ever had sex while high.",
        "Never have I ever been sexually attracted to someone inappropriate.",
        "Never have I ever had sex in a public bathroom.",
        "Never have I ever been in a relationship just for the sex.",
        "Never have I ever had sex with someone I met online.",
        "Never have I ever had sex in an elevator.",
        "Never have I ever been attracted to your friend's sibling.",
        "Never have I ever had sex while my parents were home.",
        "Never have I ever been to a swingers party.",
        "Never have I ever had sex with a celebrity or famous person.",
        "Never have I ever been in a friends-with-benefits relationship that got complicated.",
        "Never have I ever had sex in a workplace.",
        "Never have I ever been sexually attracted to a teacher.",
        "Never have I ever had sex on a beach.",
        "Never have I ever been part of a love triangle.",
        "Never have I ever had sex in a tent while camping.",
        "Never have I ever been sexually attracted to someone much older.",
        "Never have I ever had sex in a library or bookstore.",
        "Never have I ever been in an open relationship.",
        "Never have I ever had sex with someone I shouldn't have.",
        "Never have I ever been sexually attracted to my boss.",
        "Never have I ever had sex in a changing room.",
        "Never have I ever been caught sexting.",
        "Never have I ever had sex with someone from a different country.",
        "Never have I ever been sexually attracted to a fictional character.",
        "Never have I ever had sex in a hot tub or jacuzzi.",
        "Never have I ever been in a relationship I kept secret.",
        "Never have I ever had sex with someone significantly different in age.",
        "Never have I ever been sexually attracted to someone of the same gender.",
        "Never have I ever had sex in a movie theater.",
        "Never have I ever been part of a sexual dare or game.",
        "Never have I ever had sex with someone I met at a bar.",
        "Never have I ever been sexually attracted to multiple people at once."
      ],
      spicy: [
        "Never have I ever had sex in my parents' bed.",
        "Never have I ever been walked in on during intimate moments.",
        "Never have I ever used food during intimate play.",
        "Never have I ever tried role-playing in the bedroom.",
        "Never have I ever had sex in a car.",
        "Never have I ever joined the mile-high club.",
        "Never have I ever used handcuffs or restraints.",
        "Never have I ever had a quickie in a bathroom stall.",
        "Never have I ever sexted during work or class.",
        "Never have I ever fantasized about someone forbidden.",
        "Never have I ever had sex on a beach.",
        "Never have I ever used toys during intimacy.",
        "Never have I ever had sex while someone was in the next room.",
        "Never have I ever recorded myself being intimate.",
        "Never have I ever had sex in a hotel pool or hot tub.",
        "Never have I ever been part of a sex game or challenge.",
        "Never have I ever had sex in an elevator.",
        "Never have I ever done it in nature.",
        "Never have I ever had sex while high or drunk.",
        "Never have I ever had an orgasm in public.",
        "Never have I ever had sex in a changing room.",
        "Never have I ever been to an adult theater or club.",
        "Never have I ever had sex in a library.",
        "Never have I ever been part of a threesome.",
        "Never have I ever had sex in a workplace after hours.",
        "Never have I ever used whipped cream or chocolate during sex.",
        "Never have I ever had sex in a moving vehicle.",
        "Never have I ever been tied up during sex.",
        "Never have I ever had sex in a public park.",
        "Never have I ever been blindfolded during intimacy.",
        "Never have I ever had sex in someone else's bed without permission.",
        "Never have I ever been spanked during sex.",
        "Never have I ever had sex in a bathroom at a party.",
        "Never have I ever used ice during foreplay.",
        "Never have I ever had sex on a rooftop.",
        "Never have I ever been part of a sexual fantasy role-play.",
        "Never have I ever had sex in a swimming pool.",
        "Never have I ever used a mirror during sex.",
        "Never have I ever had sex in a tent.",
        "Never have I ever been part of a strip poker game.",
        "Never have I ever had sex in a sauna or steam room.",
        "Never have I ever used massage oils during intimacy.",
        "Never have I ever had sex in a closet.",
        "Never have I ever been part of a body shot game.",
        "Never have I ever had sex on a kitchen counter.",
        "Never have I ever used feathers during foreplay.",
        "Never have I ever had sex in a garage.",
        "Never have I ever been part of a naked truth or dare game.",
        "Never have I ever had sex in a basement.",
        "Never have I ever used candle wax during intimacy.",
        "Never have I ever had sex on a balcony.",
        "Never have I ever been part of a strip tease.",
        "Never have I ever had sex in a shed or barn.",
        "Never have I ever used honey during foreplay.",
        "Never have I ever had sex on stairs.",
        "Never have I ever been part of a naked photo shoot.",
        "Never have I ever had sex in a boat.",
        "Never have I ever used silk ties during sex.",
        "Never have I ever had sex on a washing machine.",
        "Never have I ever been part of a body painting session.",
        "Never have I ever had sex in a treehouse.",
        "Never have I ever used flavored lubricants.",
        "Never have I ever had sex on a trampoline.",
        "Never have I ever been part of a naked massage exchange.",
        "Never have I ever had sex in a cave.",
        "Never have I ever used temperature play during sex.",
        "Never have I ever had sex on a picnic table.",
        "Never have I ever been part of a sensual food fight.",
        "Never have I ever had sex in a hammock.",
        "Never have I ever used a vibrating toy on a partner.",
        "Never have I ever had sex on a desk.",
        "Never have I ever been part of a naked cooking session.",
        "Never have I ever had sex in a phone booth.",
        "Never have I ever used edible body paint.",
        "Never have I ever had sex on a couch in a public place.",
        "Never have I ever been part of a sensual shower together.",
        "Never have I ever had sex in a storage unit.",
        "Never have I ever used a blindfold on a partner.",
        "Never have I ever had sex on a pool table.",
        "Never have I ever been part of a naked yoga session.",
        "Never have I ever had sex in a dressing room.",
        "Never have I ever used handcuffs on a partner.",
        "Never have I ever had sex on a piano.",
        "Never have I ever been part of a sensual dance.",
        "Never have I ever had sex in a photo booth.",
        "Never have I ever used a feather on a partner.",
        "Never have I ever had sex on a bar after closing.",
        "Never have I ever been part of a naked pillow fight.",
        "Never have I ever had sex in a greenhouse.",
        "Never have I ever used chocolate sauce during foreplay.",
        "Never have I ever had sex on a fire escape.",
        "Never have I ever been part of a sensual oil massage.",
        "Never have I ever had sex in a wine cellar.",
        "Never have I ever used strawberries during intimacy.",
        "Never have I ever had sex on a rooftop garden.",
        "Never have I ever been part of a naked truth game."
      ]
    },
    "truth-or-dare": {
      standard: [
        "Truth: What's the most embarrassing thing you've done in public?",
        "Dare: Do your best impression of someone in this room.",
        "Truth: What's your biggest fear?",
        "Dare: Sing the chorus of your favorite song.",
        "Truth: What's the weirdest dream you've ever had?",
        "Dare: Do 10 push-ups right now.",
        "Truth: What's your most used emoji?",
        "Dare: Call a random contact and sing happy birthday.",
        "Truth: What's your guilty pleasure?",
        "Dare: Dance with no music for 30 seconds.",
        "Truth: Who was your first celebrity crush?",
        "Dare: Speak in an accent for the next 3 rounds.",
        "Truth: What's the most childish thing you still do?",
        "Dare: Let someone tickle you for 30 seconds.",
        "Truth: What's your weirdest habit?",
        "Dare: Eat a spoonful of hot sauce.",
        "Truth: What's your biggest pet peeve?",
        "Dare: Do your best runway walk.",
        "Truth: What's the strangest food combination you enjoy?",
        "Dare: Let someone draw on your face with a washable marker."
      ],
      challenge: [
        "Truth: Describe your most awkward romantic encounter.",
        "Dare: Kiss the person to your left on the cheek.",
        "Truth: What's the kinkiest thing you've ever done?",
        "Dare: Give someone in the room a 30-second massage.",
        "Truth: Who in this room would you most like to kiss?",
        "Dare: Remove one piece of clothing.",
        "Truth: What's your biggest sexual fantasy?",
        "Dare: Do a sexy dance for 1 minute.",
        "Truth: Have you ever cheated on someone?",
        "Dare: Let someone go through your phone for 2 minutes."
      ],
      spicy: [
        "Truth: What's the riskiest place you've ever had sex?",
        "Dare: Give someone a lap dance for 1 minute.",
        "Truth: What's your favorite position?",
        "Dare: Make the most seductive face you can.",
        "Truth: Have you ever had a one-night stand you regretted?",
        "Dare: Demonstrate your signature move in bed while clothed.",
        "Truth: What's the weirdest place you've ever masturbated?",
        "Dare: Kiss the person you find most attractive in the room.",
        "Truth: Have you ever been caught having sex?",
        "Dare: Take off your shirt and keep it off for 3 rounds."
      ]
    },
    "whos-most-likely": {
      standard: [
        "Who is most likely to become a viral TikTok star?",
        "Who is most likely to spend all their money on useless stuff?",
        "Who is most likely to get arrested for a dumb reason?",
        "Who is most likely to fall asleep at a party?",
        "Who is most likely to believe in conspiracy theories?",
        "Who is most likely to forget their own birthday?",
        "Who is most likely to go a week without showering?",
        "Who is most likely to cry during a comedy movie?",
        "Who is most likely to get lost in a supermarket?",
        "Who is most likely to eat something off the floor?"
      ],
      challenge: [
        "Who is most likely to hook up with someone's ex?",
        "Who is most likely to get black-out drunk tonight?",
        "Who is most likely to have a secret double life?",
        "Who is most likely to lie to get out of a bad date?",
        "Who is most likely to ghost someone after a great date?",
        "Who is most likely to pick a fight with a stranger?",
        "Who is most likely to spend a night in jail?",
        "Who is most likely to text their ex when drunk?",
        "Who is most likely to snooped through a friends phone?",
        "Who is most likely to fake their own death to start over?"
      ],
      spicy: [
        "Who is most likely to start an OnlyFans page?",
        "Who is most likely to have an affair.",
        "Who is most likely to be into BDSM and kink.",
        "Who is most likely to send nudes to the wrong person.",
        "Who is most likely to have a threesome.",
        "Who is most likely to have a sex tape leaked.",
        "Who is most likely to hook up in a public bathroom.",
        "Who is most likely to have a friends-with-benefits deal.",
        "Who is most likely to have multiple partners at once.",
        "Who is most likely to sleep with a colleague at work."
      ]
    },
    "would-you-rather": {
      standard: [
        "Would you rather always speak in rhyme or always sing instead of speaking?",
        "Would you rather have to announce your arrival every time you enter a room or never be able to speak first?",
        "Would you rather lose the ability to read or lose the ability to speak?",
        "Would you rather have no taste buds or be colorblind?",
        "Would you rather live without the internet or without heating and air conditioning?",
        "Would you rather always have wet socks or always have sticky hands?",
        "Would you rather fight 100 toy-sized dinosaurs or one dinosaur-sized toy?",
        "Would you rather be able to fly at walking speed or run at 100mph but only backwards?"
      ],
      challenge: [
        "Would you rather show everyone in the room your search history or give someone your phone unlocked for 5 minutes?",
        "Would you rather drink a mystery concoction made by the group or let them text anyone from your contact list?",
        "Would you rather shave off your eyebrows or wear your clothes inside out for a week?",
        "Would you rather lick the bottom of your shoe or eat a raw onion?",
        "Would you rather post your most embarrassing selfie or transfer 20 dollars to the host?",
        "Would you rather reveal your worst secret or take three shots?"
      ],
      spicy: [
        "Would you rather hook up with someone in this room or have your ex back?",
        "Would you rather be caught having sex or walk in on your parents having sex?",
        "Would you rather do it with the lights fully on or completely in the dark?",
        "Would you rather try roleplay or use blindfolds?",
        "Would you rather sleep with your best friend's ex or your boss?",
        "Would you rather have an open relationship or never have sex again?"
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
        "If you had to pick one person in this room to go to prison with, who would it be?"
      ],
      spicy: [
        "If you had to sleep with one player's sibling, who would you choose?",
        "If you had to hook up with someone in this room right now, who would it be?",
        "If you had to choose between your current partner or a celebrity crush, who would it be?",
        "If you had to choose between a one-night stand or a long-term relationship, which would you pick?"
      ]
    },
    "drink-if": {
      standard: [
        "Drink if you are wearing any black clothing.",
        "Drink if you have ever lied about your age.",
        "Drink if you have a tattoo or a piercing.",
        "Drink if you are currently single.",
        "Drink if you have a dog.",
        "Drink if you have traveled to another country.",
        "Drink if you are wearing glasses."
      ],
      challenge: [
        "Drink if you have texted an ex in the last month.",
        "Drink if you checked your phone in the last 5 minutes.",
        "Drink if you have ever snooped through a partner's phone.",
        "Drink if you have ever lied to get out of a date.",
        "Drink if you have ever stalked an ex online."
      ],
      spicy: [
        "Drink if you have ever had a one-night stand.",
        "Drink if you have ever hooked up in a public place.",
        "Drink if you have ever sent an explicit photo.",
        "Drink if you have ever had sex in a car.",
        "Drink if you have ever slept with someone in this room."
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
        "What is your biggest regret in life?"
      ],
      spicy: [
        "What is your wildest bedroom fantasy?",
        "Have you ever had a crush on someone in this room?",
        "What is the most adventurous thing you've done in bed?",
        "Describe your most awkward romantic encounter in detail.",
        "What is your favorite position and why?"
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
        "Who in this room is the most dramatic?"
      ],
      spicy: [
        "Who in this room is the best kisser?",
        "Who would you most want to see in a swimsuit?",
        "Who has the highest body count here?",
        "Who would you most want to sleep with in this room?"
      ]
    },
    "kiss-marry-kill": {
      standard: [
        "Choose between Batman, Superman, and Spider-Man.",
        "Choose between Harry Potter, Ron Weasley, and Hermione Granger.",
        "Choose between Taylor Swift, Ariana Grande, and Billie Eilish.",
        "Choose between Iron Man, Captain America, and Thor."
      ],
      challenge: [
        "Choose between the three players sitting closest to you.",
        "Choose between three of your high school crushes.",
        "Choose between your ex, your current crush, and your best friend."
      ],
      spicy: [
        "Choose between three players in this room for Kiss, Marry, and Kill.",
        "Choose between three famous adult stars.",
        "Choose between three of your previous hookups."
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
        "Spin the bottle. You must kiss that person or take a shot."
      ]
    },
    "rapid-fire": {
      standard: [
        "Cats or Dogs? Answer in 1 second.",
        "Coffee or Tea? Answer in 1 second.",
        "Netflix or Cinema? Answer in 1 second.",
        "Summer or Winter? Answer in 1 second."
      ],
      challenge: [
        "Truth or Lie? Answer in 1 second.",
        "Text or Call? Answer in 1 second.",
        "Money or Love? Answer in 1 second."
      ],
      spicy: [
        "Lights on or off? Answer in 1 second.",
        "Morning or night? Answer in 1 second.",
        "Cuddling or sleeping? Answer in 1 second."
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
        "Take a double shot or exchange shirts with the person to your left."
      ]
    },
    "emoji-decode": {
      standard: [
        "Guess the movie described by: Eyes, Scream, Knife.",
        "Guess the band described by: Red, Hot, Chili, Peppers.",
        "Guess the city described by: Statue of Liberty, Apple."
      ],
      challenge: [
        "Guess the phrase described by: Cat got your tongue.",
        "Guess the movie described by: Lion, Crown, Jungle.",
        "Guess the song described by: Baby, One, More, Time."
      ],
      spicy: [
        "Guess the phrase described by: Netflix and chill.",
        "Guess the activity described by: Bedroom, handcuffs, whip.",
        "Guess the movie described by: Fifty, Shades, Grey."
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
        "Act like a dramatic soap opera character in a bedroom argument."
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
        "Rate the outfit of everyone in the room."
      ]
    }
  };

  const gameContent = content[gameId];
  if (!gameContent) {
    return [
      "What is your hottest take?",
      "Tell a secret you have never told anyone here.",
      "Do your best impression of a famous meme.",
      "Share your most embarrassing story."
    ];
  }

  if (!matureContent) {
    return gameContent.standard || gameContent[Object.keys(gameContent)[0]];
  }

  return gameContent[gameMode] || gameContent.standard || gameContent[Object.keys(gameContent)[0]];
}
