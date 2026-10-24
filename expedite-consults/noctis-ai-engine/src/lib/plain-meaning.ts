import type { FeedPost } from "@/lib/feed-data";

export type MeaningBlock = { label: string; text: string };

const JUNK = /presented by|expedite consults|source\s*·|what belongs on this clinic|a louder clip|whatever trended/i;

const KNOWN: { test: RegExp; lines: string[] }[] = [
  {
    test: /read it as one story/i,
    lines: [
      "This film is about how to read the Bible.",
      "Do not treat it like one long list of rules, where every sentence works the same way. The Bible is many books. Some are stories about people. Some are songs. Some are laws. Some are letters. Different people wrote them, over a long time.",
      "Read them as one story. Start at the beginning, follow what happens, and notice how the later books pick up what the earlier books began.",
      "The simple point: the Bible is one story, told in more than one kind of writing.",
    ],
  },
  {
    test: /library, not one tweet/i,
    lines: [
      "This film asks what kind of book the Bible is.",
      "It is not one person's diary, and it is not a stack of short sayings. It is a shelf of books. They were written by different people, and together they tell one story.",
    ],
  },
  {
    test: /genre first/i,
    lines: [
      "This film is about why the style of a Bible passage matters.",
      "A poem is not a news report. A law is not a story. A letter is not a song. If you read every line as the same kind of sentence, you will miss what it is doing.",
      "Read each part the way it was written.",
    ],
  },
  {
    test: /one story, start to end/i,
    lines: [
      "This film walks through the Bible as one story, from the beginning to the end.",
      "It does not stop with the kings, and it does not stay in the first book. The story keeps moving, and this film says it leads to Jesus.",
    ],
  },
  {
    test: /partnership, then jesus/i,
    lines: [
      "This film is about the big promises in the Bible.",
      "A promise here is an agreement God makes with people. The film names Noah, Abraham, the people of Israel, and King David. Each promise carries the story forward, and the film says those promises point toward Jesus.",
    ],
  },
  {
    test: /from the start to exile/i,
    lines: [
      "This film is a simple walk through the first part of the Bible, the Old Testament.",
      "It starts at the beginning and follows the people until they are forced to leave their land. It is the shape of that whole story, not only the books about Jesus.",
    ],
  },
  {
    test: /from the gospels onward/i,
    lines: [
      "This film is a simple walk through the second part of the Bible, the New Testament.",
      "It starts with the four books about Jesus and continues through the letters that come after. It is not the story of the first book, and it is not only the songs.",
    ],
  },
  {
    test: /check the work/i,
    lines: [
      "This film shows how the makers check a Bible topic before they teach it.",
      "They do not just pick a verse and guess. They look at the words, the history, and how the passage fits the larger story. It is not a list of every author, and it is not a talk with no sources.",
    ],
  },
  {
    test: /four accounts, one announcement/i,
    lines: [
      "This film is about the life of Jesus, from his birth to his rising from the dead.",
      "Four books tell that life. They are old accounts of a real person, not a modern novel and not a book of laws. They announce the same news in four tellings.",
    ],
  },
  {
    test: /the sermon has a design/i,
    lines: [
      "This film is about the Sermon on the Mount, a long teaching Jesus gave.",
      "It is not a loose pile of sayings. The film shows that the sermon has a shape. The teachings sit in that sermon, not in a short story and not in the last book of the Bible.",
    ],
  },
  {
    test: /stories on the way/i,
    lines: [
      "This film follows Jesus on the road in the book of Luke.",
      "The middle of that book is full of teaching and short stories he tells while traveling. It is not a list of kings, and it is not a set of building measurements.",
    ],
  },
  {
    test: /watch what he does/i,
    lines: [
      "This film is the book of Mark, one of the four books about Jesus.",
      "Mark spends less time on long speeches and more time on what Jesus does. Watch the actions. This is not the book of laws, and it is not the story of Esther.",
    ],
  },
  {
    test: /a letter about the gospel/i,
    lines: [
      "This film is about the book of Romans.",
      "Romans is a letter. Paul wrote it. He explains the good news about Jesus. It was not written by David, and it was not written by Moses.",
    ],
  },
  {
    test: /a letter, not a panic chart/i,
    lines: [
      "This film is about the book of Revelation.",
      "Read it first as a letter of hope to churches, not as a secret code and not as a horror timetable. The pictures are there to encourage people who were under pressure.",
    ],
  },
  {
    test: /from david's line/i,
    lines: [
      "This film is about how the book of Matthew introduces Jesus.",
      "Matthew says Jesus comes from King David's family line. He presents Jesus as the promised king, a teacher in the pattern of Moses, and God with us. He is not a later editor, and he is not a Roman official.",
    ],
  },
  {
    test: /the line after david/i,
    lines: [
      "This film is about the kings who came after David.",
      "The kingdom splits into two. The kings fail the promise they were given. The story does not say every king succeeds, and it does not stay in Egypt.",
    ],
  },
  {
    test: /fifteen books, one job/i,
    lines: [
      "This film teaches you how to read the fifteen books of the prophets.",
      "Those books are not the songbook, and they are not the four books about Jesus. They have one job: they speak to the people about what God is doing, often while the nation is in trouble.",
    ],
  },
  {
    test: /the word became flesh/i,
    lines: [
      "This film is about how the book of John introduces Jesus.",
      "John says Jesus is the Word of God who became a human being. That is the claim at the start of the book. It is not a footnote, and it is not a rumor added later.",
    ],
  },
  {
    test: /heaven arriving on earth/i,
    lines: [
      "This film is about what the Bible means by heaven.",
      "It is not only a map of the clouds, and it is not a private club. In this film, heaven means God's life and justice coming to the earth.",
    ],
  },
  {
    test: /the plot repeats on purpose/i,
    lines: [
      "This film shows that Bible stories repeat their shape on purpose.",
      "You can check it yourself. Watch how a story rises, falls, and echoes an earlier story. The design is not random, and it is not just a page number.",
    ],
  },
  {
    test: /do not pretend it is simple/i,
    lines: [
      "This film is about the Trinity, the Christian way of speaking about God.",
      "It says the teaching is real, and it also says you should not pretend it is simple. It does not mean three separate gods, and it does not mean Jesus is only a symbol.",
    ],
  },
];

function clean(text: string) {
  return text.replace(/#\w+/g, " ").replace(/\s+/g, " ").trim();
}

function filmTitle(post: FeedPost) {
  const fromCaption = clean(post.caption).split(/\.\s*Film\b/i)[0]?.replace(/\.\s*presented by.+$/i, "").trim() ?? "";
  if (fromCaption.length > 6 && fromCaption.length < 90 && !JUNK.test(fromCaption)) return fromCaption.replace(/[.?!]+$/g, "");
  const stamp = post.teach.stamp.replace(/\s*clinic$/i, "").trim();
  if (stamp && !/^scripture$/i.test(stamp) && !JUNK.test(stamp)) return stamp;
  return "";
}

function soften(text: string) {
  return clean(text)
    .replace(/a library of styles that tells one story/gi, "the Bible is many kinds of writing that together tell one story")
    .replace(/\bone genre only\b/gi, "only one kind of writing")
    .replace(/\ba single rule list\b/gi, "one long list of rules")
    .replace(/\bgenre\b/gi, "kind of writing")
    .replace(/\bcovenant partners\b/gi, "people God made promises with")
    .replace(/\bcovenants\b/gi, "promises")
    .replace(/\bthe Messiah\b/gi, "the promised king")
    .replace(/[.?!]+$/g, "");
}

const IDEAS: { test: RegExp; say: string; keep: string }[] = [
  { test: /\bdns\b/i, say: "You type a website name. The internet then has to find the numbered address behind that name. DNS is that lookup. It works like a phone book.", keep: "A website name has an address. DNS finds it." },
  { test: /tariff/i, say: "A tariff is a tax on goods that come in from another country. Someone pays that tax, and the price you see can go up.", keep: "A tariff is a tax on imported goods." },
  { test: /phish/i, say: "Phishing is a trick. A message pretends to be your bank, your boss, or a friend so you will give away a password or send money.", keep: "If a message rushes you to click or pay, stop and check who sent it." },
  { test: /ransomware/i, say: "Ransomware is a program that locks your files and then asks you to pay to unlock them.", keep: "Do not decide in a panic. Learn how the lock happens and how people stop it." },
  { test: /password|authentication/i, say: "A password is how a system checks that you are you. Authentication is that check. If the check is weak, someone else can walk in as you.", keep: "The check should prove it is you, not just anyone who guessed." },
  { test: /photosynth/i, say: "A plant takes sunlight, water, and air and turns them into the food it needs to grow. That is photosynthesis.", keep: "Plants make their food from light." },
  { test: /black hole/i, say: "A black hole is a place in space where the pull is so strong that even light cannot get out.", keep: "Light cannot leave a black hole." },
  { test: /vaccine|immune/i, say: "Your body learns an enemy by meeting it. A vaccine lets the body practice on a safe version, so it is ready for the real sickness.", keep: "A vaccine trains the body before the real illness arrives." },
  { test: /diabetes/i, say: "Diabetes means the body is not keeping the sugar in the blood at a steady level. The film shows what that does and how people live with it.", keep: "It is about blood sugar, not a personal failure." },
  { test: /\bcancer\b/i, say: "Cancer is when some cells in the body keep dividing after they should have stopped.", keep: "Cancer is cells that do not stop growing." },
  { test: /\bjazz\b/i, say: "Jazz starts with a tune you can recognize. Then the players change it while they play. Listen for the tune first, then for the moment someone plays around it.", keep: "Hear the tune, then hear what the players do with it." },
  { test: /hymn|gospel|worship|amazing grace/i, say: "This is a song people sing to God. Listen for who the song is speaking to, and whether it is giving thanks or asking for help.", keep: "The song is a prayer with a melody." },
  { test: /gravity/i, say: "Gravity is the pull that draws things toward each other. It is why an apple falls and why the Moon stays near the Earth.", keep: "Gravity is a pull, not a glue." },
  { test: /\bdna\b/i, say: "DNA is the set of instructions inside a living thing. It tells the body how to build and repair itself.", keep: "DNA is the body's instruction list." },
];

function ideaFor(text: string) {
  return IDEAS.find((row) => row.test.test(text));
}

export function layTell(post: FeedPost): string[] {
  const bag = `${post.teach.hook} ${post.teach.prompt} ${post.caption} ${post.teach.stamp}`;
  const known = KNOWN.find((row) => row.test.test(bag));
  if (known) return known.lines;

  const title = filmTitle(post) || clean(post.teach.hook || post.teach.stamp || "this subject");
  const idea = ideaFor(bag);
  const answer = post.teach.options.find((option) => option.ok && !JUNK.test(option.label));
  const plainAnswer = answer ? soften(answer.label) : "";
  const lines = [`This film is about ${title}.`];
  if (idea) lines.push(idea.say);
  else if (plainAnswer && plainAnswer.toLowerCase() !== title.toLowerCase()) lines.push(plainAnswer.endsWith(".") ? plainAnswer : `${plainAnswer}.`);
  else lines.push(`The film explains ${title} from the first step, the way you would explain it to a friend who has never studied it. Follow the example on screen. When the example is clear, you have the idea.`);
  lines.push(idea?.keep ?? (plainAnswer ? `Keep this: ${plainAnswer}.` : `Keep this: ${title}.`));
  return lines;
}

export function layBlocks(post: FeedPost): MeaningBlock[] {
  const lines = layTell(post).filter((line, index, all) => all.findIndex((other) => other.trim().toLowerCase() === line.trim().toLowerCase()) === index);
  const what = lines[0] ?? "This film explains one idea.";
  const rest = lines.slice(1);
  const keep = rest.length > 1 ? rest[rest.length - 1]! : "Remember the main idea in your own words.";
  const middle = (rest.length > 1 ? rest.slice(0, -1) : rest).join(" ") || what;
  return [
    { label: "What this is", text: what },
    { label: "Said simply", text: middle },
    { label: "Keep this", text: keep === middle ? "Say that idea in your own words." : keep },
  ];
}

export function tellStory(post: FeedPost): string[] {
  return layTell(post);
}

export function plainMeaning(post: FeedPost): MeaningBlock[] {
  return layTell(post).map((text) => ({ label: "In plain words", text }));
}