import { FACE, type FeedPost, type Teach } from "@/lib/feed-data";

export type HymnRoom =
  | "hymns"
  | "gaither"
  | "southern"
  | "quartet"
  | "black"
  | "africa"
  | "ghana"
  | "nigeria"
  | "kenya"
  | "uganda"
  | "congo"
  | "liberia"
  | "zimbabwe"
  | "southafrica"
  | "ccm"
  | "worship"
  | "sunday"
  | "communion"
  | "easter"
  | "christmas"
  | "memorial"
  | "children"
  | "oldtime"
  | "choir"
  | "instrumental"
  | "study";

export type HymnWingId = "classic" | "need" | "tradition" | "world" | "choir" | "calendar";

export type HymnCard = {
  id: string;
  title: string;
  writer: string;
  year: number;
  rights: "pd" | "embed";
  rooms: HymnRoom[];
  verse: string;
  history: string;
  scripture: string;
  theme: string;
  form?: string;
  youtubeId?: string;
  query: string;
  prompt: string;
  ok: string;
  wrong: [string, string];
};

export const HYMN_ROOMS: { id: HymnRoom | "all"; label: string; hint: string }[] = [
  { id: "all", label: "All", hint: "Every hymn the ledger seats" },
  { id: "hymns", label: "Classic hymns", hint: "The church's memory" },
  { id: "study", label: "Learn the hymn", hint: "History, text, Scripture" },
  { id: "gaither", label: "Gaither", hint: "Homecoming and the Vocal Band" },
  { id: "southern", label: "Southern gospel", hint: "Hoppers, Isaacs, Booth Brothers" },
  { id: "quartet", label: "Gospel quartet", hint: "Fairfield Four to Gold City" },
  { id: "black", label: "Black gospel", hint: "Choirs, legends, hymn arrangements" },
  { id: "ccm", label: "Contemporary", hint: "Worship, praise, Christian pop" },
  { id: "worship", label: "Worship", hint: "Praise that names Jesus" },
  { id: "africa", label: "African gospel", hint: "The continent sings" },
  { id: "ghana", label: "Ghana", hint: "Twi, Ga, Ewe, highlife gospel" },
  { id: "nigeria", label: "Nigeria", hint: "Yoruba, Igbo, contemporary worship" },
  { id: "kenya", label: "Kenya", hint: "East African praise" },
  { id: "uganda", label: "Uganda", hint: "Ugandan gospel" },
  { id: "congo", label: "Congo", hint: "Congolese gospel" },
  { id: "liberia", label: "Liberia", hint: "Liberian gospel" },
  { id: "zimbabwe", label: "Zimbabwe", hint: "Zimbabwean gospel" },
  { id: "southafrica", label: "South Africa", hint: "Choir and choral gospel" },
  { id: "sunday", label: "Sunday morning", hint: "Congregational hymns" },
  { id: "communion", label: "Communion", hint: "The table" },
  { id: "easter", label: "Easter", hint: "He lives" },
  { id: "christmas", label: "Christmas", hint: "The birth sung" },
  { id: "memorial", label: "Memorial", hint: "Abide, it is well" },
  { id: "children", label: "Children", hint: "Bible songs for the young" },
  { id: "oldtime", label: "Old-time", hint: "Vintage gospel" },
  { id: "choir", label: "Choirs", hint: "Church, campus, cathedral, SATB" },
  { id: "instrumental", label: "Instrumental", hint: "Piano, organ, guitar, orchestra" },
];

export const HYMN_WINGS: { id: HymnWingId; label: string; hint: string; rooms: (HymnRoom | "all")[] }[] = [
  { id: "classic", label: "Classic", hint: "The hymn itself", rooms: ["all", "hymns", "study"] },
  { id: "need", label: "By need", hint: "Hope, grief, Sunday, the table", rooms: [] },
  { id: "tradition", label: "Traditions", hint: "Gaither, quartet, Black gospel, CCM", rooms: ["gaither", "southern", "quartet", "black", "ccm", "worship"] },
  { id: "world", label: "World", hint: "Ghana to South Africa", rooms: ["africa", "ghana", "nigeria", "kenya", "uganda", "congo", "liberia", "zimbabwe", "southafrica"] },
  { id: "choir", label: "Choirs", hint: "Voices and instruments", rooms: ["choir", "instrumental", "children", "oldtime"] },
  { id: "calendar", label: "Calendar", hint: "Sunday, Easter, Christmas", rooms: ["sunday", "communion", "easter", "christmas", "memorial"] },
];

export const HYMN_NEEDS: { id: string; label: string; hint: string; hymns: string[] }[] = [
  { id: "hope", label: "When you need hope", hint: "It is well. He is faithful.", hymns: ["it-is-well", "faithfulness", "blessed-assurance"] },
  { id: "grief", label: "When you are grieving", hint: "Abide. A friend in Jesus.", hymns: ["abide", "what-a-friend", "nearer"] },
  { id: "sunday", label: "Sunday morning", hint: "Holy, great, glory.", hymns: ["holy-holy", "how-great", "glory"] },
  { id: "table", label: "Communion", hint: "The wondrous cross.", hymns: ["wondrous-cross", "nothing-but-the-blood", "old-rugged-cross"] },
  { id: "easter", label: "Easter", hint: "He arose. He lives.", hymns: ["christ-arose", "he-lives", "risen-today"] },
  { id: "christmas", label: "Christmas", hint: "The night of His birth.", hymns: ["holy-night", "silent-night", "come-faithful"] },
];

/** First stanzas of U.S. public-domain hymns (published 1930 or earlier). Recordings stay YouTube embeds. */
export const HYMNS: HymnCard[] = [
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    writer: "John Newton",
    year: 1779,
    rights: "pd",
    rooms: ["hymns", "sunday", "gaither", "memorial", "study"],
    verse: "Amazing grace! how sweet the sound, that saved a wretch like me. I once was lost, but now am found; was blind, but now I see.",
    history: "Newton, a former slave-ship captain, wrote this after conversion. The American tune New Britain was joined to the text in the 19th century.",
    scripture: "Ephesians 2:8–9 · Luke 15",
    theme: "Grace finds the lost.",
    youtubeId: "qNuQbJst4Lk",
    query: "Amazing Grace Gaither Homecoming Wintley Phipps official",
    prompt: "What does Amazing Grace teach first?",
    ok: "The lost are found by grace",
    wrong: ["Try harder", "Sing louder"],
  },
  {
    id: "how-great",
    title: "How Great Thou Art",
    writer: "Carl Boberg / Stuart K. Hine",
    year: 1885,
    rights: "embed",
    rooms: ["hymns", "sunday", "gaither", "worship", "study"],
    verse: "O Lord my God, when I in awesome wonder consider all the worlds Thy hands have made…",
    history: "Swedish poem by Carl Boberg; English hymn by Stuart Hine. The cross stanza is the Gospel: the Son not spared.",
    scripture: "Psalm 8 · John 3:16",
    theme: "Creation, then the cross.",
    youtubeId: "mohUSkfCL0M",
    query: "How Great Thou Art Gaither Homecoming official",
    prompt: "Where does How Great Thou Art land?",
    ok: "The Son sent to die for sin",
    wrong: ["Only the weather", "A travel song"],
  },
  {
    id: "it-is-well",
    title: "It Is Well with My Soul",
    writer: "Horatio Spafford",
    year: 1873,
    rights: "pd",
    rooms: ["hymns", "memorial", "study", "sunday"],
    verse: "When peace like a river attendeth my way, when sorrows like sea billows roll; whatever my lot, Thou hast taught me to say, it is well, it is well with my soul.",
    history: "Spafford wrote it after his four daughters drowned at sea. The hymn does not deny sorrow; it names Christ's blood for the soul.",
    scripture: "Philippians 4:7 · Isaiah 26:3",
    theme: "Christ regards the helpless.",
    youtubeId: "r5kUSkm0wis",
    query: "It Is Well with My Soul hymn story Jesus official",
    prompt: "What holds the soul in It Is Well?",
    ok: "Christ shed His blood for my soul",
    wrong: ["Ignoring sorrow", "A louder chorus"],
  },
  {
    id: "faithfulness",
    title: "Great Is Thy Faithfulness",
    writer: "Thomas Chisholm",
    year: 1923,
    rights: "pd",
    rooms: ["hymns", "sunday", "study"],
    verse: "Great is Thy faithfulness, O God my Father; there is no shadow of turning with Thee.",
    history: "Chisholm, in ordinary health and ordinary work, wrote a hymn of daily mercies — not a crisis song.",
    scripture: "Lamentations 3:22–23",
    theme: "Morning by morning, new mercies.",
    youtubeId: "G1CZzheVH-I",
    query: "Great Is Thy Faithfulness hymn Gaither official",
    prompt: "What does Great Is Thy Faithfulness rest on?",
    ok: "God's unchanging mercy",
    wrong: ["Our mood that morning", "A bigger choir"],
  },
  {
    id: "blessed-assurance",
    title: "Blessed Assurance",
    writer: "Fanny Crosby",
    year: 1873,
    rights: "pd",
    rooms: ["hymns", "sunday", "black", "study"],
    verse: "Blessed assurance, Jesus is mine! O what a foretaste of glory divine! Heir of salvation, purchase of God, born of His Spirit, washed in His blood.",
    history: "Blind hymn writer Fanny Crosby dictated thousands of gospel songs. This one is a confession, not a wish.",
    scripture: "1 John 5:13 · Romans 8:16",
    theme: "Jesus is mine — a fact, not a feeling.",
    youtubeId: "6vANGkp9Ovs",
    query: "Blessed Assurance hymn Gaither Homecoming official",
    prompt: "What is the assurance in Blessed Assurance?",
    ok: "Jesus is mine, washed in His blood",
    wrong: ["I hope I am good enough", "The choir agrees"],
  },
  {
    id: "holy-holy",
    title: "Holy, Holy, Holy",
    writer: "Reginald Heber",
    year: 1826,
    rights: "pd",
    rooms: ["hymns", "sunday", "study"],
    verse: "Holy, holy, holy! Lord God Almighty! Early in the morning our song shall rise to Thee.",
    history: "Heber wrote it for Trinity Sunday. The thrice-holy is Isaiah's vision, not a mood word.",
    scripture: "Isaiah 6:3 · Revelation 4:8",
    theme: "The Trinity named in worship.",
    youtubeId: "2qCmtUhiKcA",
    query: "Holy Holy Holy Lord God Almighty hymn choir official",
    prompt: "What does Holy, Holy, Holy name?",
    ok: "The thrice-holy God, Father, Son, and Spirit",
    wrong: ["A pretty sunrise", "Only the angels"],
  },
  {
    id: "rock-of-ages",
    title: "Rock of Ages",
    writer: "Augustus Toplady",
    year: 1776,
    rights: "pd",
    rooms: ["hymns", "sunday", "study"],
    verse: "Rock of Ages, cleft for me, let me hide myself in Thee; let the water and the blood, from Thy wounded side which flowed, be of sin the double cure.",
    history: "Toplady's plea is empty hands: nothing in my hand I bring. The cleft rock is Christ.",
    scripture: "Exodus 33:22 · 1 Corinthians 10:4",
    theme: "Hide in Christ, not in works.",
    query: "Rock of Ages cleft for me hymn official",
    prompt: "Where does Rock of Ages tell you to hide?",
    ok: "In Christ, the cleft rock",
    wrong: ["In your record", "In the choir loft"],
  },
  {
    id: "what-a-friend",
    title: "What a Friend We Have in Jesus",
    writer: "Joseph Scriven",
    year: 1855,
    rights: "pd",
    rooms: ["hymns", "sunday", "study"],
    verse: "What a friend we have in Jesus, all our sins and griefs to bear! What a privilege to carry everything to God in prayer.",
    history: "Scriven wrote it to comfort his mother. The friend is not a slogan; He bears sin and grief.",
    scripture: "John 15:15 · Philippians 4:6",
    theme: "Prayer because Jesus is friend.",
    youtubeId: "0GI_qr2BrC4",
    query: "What a Friend We Have in Jesus hymn Gaither official",
    prompt: "What privilege does the hymn name?",
    ok: "Carry everything to God in prayer",
    wrong: ["Keep grief private", "Wait until you feel strong"],
  },
  {
    id: "old-rugged-cross",
    title: "The Old Rugged Cross",
    writer: "George Bennard",
    year: 1913,
    rights: "pd",
    rooms: ["hymns", "sunday", "communion", "study"],
    verse: "On a hill far away stood an old rugged cross, the emblem of suffering and shame; and I love that old cross where the dearest and best for a world of lost sinners was slain.",
    history: "Bennard wrote the Gospel in wood and hill: the cross is shame that saves.",
    scripture: "Galatians 6:14 · 1 Corinthians 1:18",
    theme: "The cross is the emblem of the Gospel.",
    youtubeId: "YGAHQr_DirY",
    query: "The Old Rugged Cross hymn Gaither Homecoming official",
    prompt: "What stands on the hill in this hymn?",
    ok: "The cross where Christ was slain for sinners",
    wrong: ["A monument to effort", "A pretty view"],
  },
  {
    id: "just-as-i-am",
    title: "Just As I Am",
    writer: "Charlotte Elliott",
    year: 1835,
    rights: "pd",
    rooms: ["hymns", "sunday", "study"],
    verse: "Just as I am, without one plea, but that Thy blood was shed for me, and that Thou bidst me come to Thee, O Lamb of God, I come.",
    history: "Elliott, an invalid, wrote the invitation hymn of the 19th century. Come as you are — because of the blood.",
    scripture: "John 1:29 · Revelation 22:17",
    theme: "Come without a plea except the blood.",
    youtubeId: "Ij9wSObNtJQ",
    query: "Just As I Am hymn Billy Graham Gaither official",
    prompt: "What is the only plea in Just As I Am?",
    ok: "Thy blood was shed for me",
    wrong: ["I improved first", "The crowd invited me"],
  },
  {
    id: "abide",
    title: "Abide with Me",
    writer: "Henry Francis Lyte",
    year: 1847,
    rights: "pd",
    rooms: ["hymns", "memorial", "sunday", "study", "choir"],
    verse: "Abide with me; fast falls the eventide; the darkness deepens; Lord, with me abide.",
    history: "Lyte wrote it facing death. Eventide is not only evening; it is the last hour, and Christ stays.",
    scripture: "Luke 24:29 · Psalm 23",
    theme: "Stay with us, Lord.",
    youtubeId: "MII2Ngxh0Vw",
    query: "Abide with Me Tabernacle Choir official",
    prompt: "What does Abide with Me ask?",
    ok: "That Christ stay when the dark deepens",
    wrong: ["That the day last forever", "That we never sleep"],
  },
  {
    id: "vision",
    title: "Be Thou My Vision",
    writer: "Irish, tr. Eleanor Hull",
    year: 1905,
    rights: "pd",
    rooms: ["hymns", "sunday", "study", "worship", "choir"],
    verse: "Be Thou my vision, O Lord of my heart; naught be all else to me, save that Thou art.",
    history: "An Irish poem (Rop tú mo baile) set to Slane. The vision is a Person, not a technique.",
    scripture: "Psalm 27 · Colossians 1:18",
    theme: "Christ first in the heart.",
    youtubeId: "Snn08RiMP6g",
    query: "Be Thou My Vision Tabernacle Choir Mack Wilberg",
    prompt: "What is the 'vision' in Be Thou My Vision?",
    ok: "The Lord of my heart",
    wrong: ["A career plan", "A prettier lyric"],
  },
  {
    id: "fortress",
    title: "A Mighty Fortress Is Our God",
    writer: "Martin Luther",
    year: 1529,
    rights: "pd",
    rooms: ["hymns", "sunday", "study"],
    verse: "A mighty fortress is our God, a bulwark never failing; our helper He amid the flood of mortal ills prevailing.",
    history: "Luther's battle hymn. The fortress is God; the prince of darkness is named and defeated in Christ.",
    scripture: "Psalm 46 · 1 John 4:4",
    theme: "God is the fortress, not we.",
    youtubeId: "z4EoLm3_luM",
    query: "A Mighty Fortress Is Our God Luther hymn choir official",
    prompt: "Who is the fortress?",
    ok: "God Himself",
    wrong: ["The church building", "A strong choir"],
  },
  {
    id: "all-hail",
    title: "All Hail the Power of Jesus' Name",
    writer: "Edward Perronet",
    year: 1779,
    rights: "pd",
    rooms: ["hymns", "sunday", "worship", "study"],
    verse: "All hail the power of Jesus' name! Let angels prostrate fall; bring forth the royal diadem, and crown Him Lord of all.",
    history: "The coronation hymn. Every tribe is summoned to the Name.",
    scripture: "Philippians 2:9–11 · Revelation 5",
    theme: "Crown Him Lord of all.",
    query: "All Hail the Power of Jesus Name hymn choir official",
    prompt: "What does the hymn tell every tribe to do?",
    ok: "Crown Jesus Lord of all",
    wrong: ["Wait for a better king", "Crown the choir"],
  },
  {
    id: "fount",
    title: "Come Thou Fount of Every Blessing",
    writer: "Robert Robinson",
    year: 1758,
    rights: "pd",
    rooms: ["hymns", "sunday", "study", "choir"],
    verse: "Come, Thou Fount of every blessing, tune my heart to sing Thy grace; streams of mercy, never ceasing, call for songs of loudest praise.",
    history: "Robinson wrote of a wandering heart bound by grace. Ebenezer: thus far the Lord has helped.",
    scripture: "1 Samuel 7:12 · Psalm 36:8–9",
    theme: "Grace tunes the wandering heart.",
    youtubeId: "gPKpkrqBwNs",
    query: "Come Thou Fount of Every Blessing Tabernacle Choir",
    prompt: "What does Come Thou Fount ask to be tuned?",
    ok: "The heart, to sing grace",
    wrong: ["The organ only", "A louder room"],
  },
  {
    id: "need-thee",
    title: "I Need Thee Every Hour",
    writer: "Annie Hawks",
    year: 1872,
    rights: "pd",
    rooms: ["hymns", "sunday", "study"],
    verse: "I need Thee every hour, most gracious Lord; no tender voice like Thine can peace afford.",
    history: "Hawks wrote it in ordinary housework. Need is not only for crisis.",
    scripture: "John 15:5 · Psalm 42:1",
    theme: "Need Him every hour, not only in trouble.",
    query: "I Need Thee Every Hour hymn Gaither official",
    prompt: "When does the hymn say we need Him?",
    ok: "Every hour",
    wrong: ["Only on Sunday", "Only in disaster"],
  },
  {
    id: "surrender",
    title: "I Surrender All",
    writer: "Judson Van DeVenter",
    year: 1896,
    rights: "pd",
    rooms: ["hymns", "sunday", "study", "black"],
    verse: "All to Jesus I surrender, all to Him I freely give; I will ever love and trust Him, in His presence daily live.",
    history: "Van DeVenter wrote after yielding a calling he had delayed. Surrender is daily presence, not a one-time mood.",
    scripture: "Luke 9:23 · Romans 12:1",
    theme: "All to Jesus — not a remainder.",
    query: "I Surrender All hymn gospel choir official",
    prompt: "What is surrendered?",
    ok: "All, to Jesus",
    wrong: ["The spare hour", "The chorus only"],
  },
  {
    id: "nearer",
    title: "Nearer, My God, to Thee",
    writer: "Sarah Flower Adams",
    year: 1841,
    rights: "pd",
    rooms: ["hymns", "memorial", "study"],
    verse: "Nearer, my God, to Thee, nearer to Thee! E'en though it be a cross that raiseth me.",
    history: "Jacob's ladder is the picture. The cross itself can raise the soul nearer.",
    scripture: "Genesis 28:12 · James 4:8",
    theme: "Even a cross can draw us near.",
    query: "Nearer My God to Thee hymn choir official",
    prompt: "What may raise the singer nearer to God?",
    ok: "Even a cross",
    wrong: ["Only success", "A shorter song"],
  },
  {
    id: "glory",
    title: "To God Be the Glory",
    writer: "Fanny Crosby",
    year: 1875,
    rights: "pd",
    rooms: ["hymns", "sunday", "worship", "study"],
    verse: "To God be the glory, great things He hath done; so loved He the world that He gave us His Son.",
    history: "Crosby again: the Gospel in one line — He gave us His Son.",
    scripture: "John 3:16 · Psalm 115:1",
    theme: "Glory to God for the Son given.",
    query: "To God Be the Glory hymn choir official",
    prompt: "What great thing does the hymn name first?",
    ok: "He gave us His Son",
    wrong: ["We built a hall", "The music was famous"],
  },
  {
    id: "softly",
    title: "Softly and Tenderly",
    writer: "Will L. Thompson",
    year: 1880,
    rights: "pd",
    rooms: ["hymns", "sunday", "study"],
    verse: "Softly and tenderly Jesus is calling, calling for you and for me; see, on the portals He's waiting and watching, watching for you and for me.",
    history: "An invitation hymn. The call is Jesus', not the platform's.",
    scripture: "Matthew 11:28 · Revelation 3:20",
    theme: "Jesus is calling — come home.",
    query: "Softly and Tenderly Jesus is calling hymn Gaither official",
    prompt: "Who is calling in Softly and Tenderly?",
    ok: "Jesus",
    wrong: ["The choir director", "Whoever is trending"],
  },
  {
    id: "wondrous-cross",
    title: "When I Survey the Wondrous Cross",
    writer: "Isaac Watts",
    year: 1707,
    rights: "pd",
    rooms: ["hymns", "communion", "sunday", "study"],
    verse: "When I survey the wondrous cross on which the Prince of glory died, my richest gain I count but loss, and pour contempt on all my pride.",
    history: "Watts's communion hymn. Survey means look until pride dies.",
    scripture: "Galatians 6:14 · Philippians 3:7–8",
    theme: "The cross puts pride to death.",
    query: "When I Survey the Wondrous Cross hymn choir official",
    prompt: "What does Watts count as loss at the cross?",
    ok: "His richest gain and all his pride",
    wrong: ["Only bad habits", "The tune"],
  },
  {
    id: "christ-arose",
    title: "Christ Arose",
    writer: "Robert Lowry",
    year: 1874,
    rights: "pd",
    rooms: ["easter", "hymns", "sunday", "study"],
    verse: "Low in the grave He lay, Jesus my Savior! Waiting the coming day, Jesus my Lord! Up from the grave He arose, with a mighty triumph o'er His foes.",
    history: "Lowry's Easter shout. The grave is a waiting room, not a finish.",
    scripture: "Matthew 28:6 · 1 Corinthians 15:55",
    theme: "He arose — the Gospel's third day.",
    query: "Christ Arose Low in the grave He lay hymn choir official",
    prompt: "What happened on the third day in this hymn?",
    ok: "Jesus rose with triumph over His foes",
    wrong: ["The choir practiced", "The stone stayed"],
  },
  {
    id: "he-lives",
    title: "He Lives",
    writer: "Alfred Ackley",
    year: 1933,
    rights: "embed",
    rooms: ["easter", "sunday", "study"],
    verse: "I serve a risen Savior, He's in the world today…",
    history: "Ackley wrote after someone asked whether Jesus was only a memory. The hymn answers: He lives.",
    scripture: "Luke 24:5–6 · Galatians 2:20",
    theme: "The risen Christ is present.",
    query: "He Lives I serve a risen Savior hymn official",
    prompt: "Who does He Lives say you serve?",
    ok: "A risen Savior, present today",
    wrong: ["A memory only", "A seasonal story"],
  },
  {
    id: "holy-night",
    title: "O Holy Night",
    writer: "Adolphe Adam / Cappeau",
    year: 1847,
    rights: "pd",
    rooms: ["christmas", "hymns", "study"],
    verse: "O holy night, the stars are brightly shining; it is the night of the dear Savior's birth.",
    history: "A French cantique that became the Christmas Gospel in English: the weary world rejoices because the King is born.",
    scripture: "Luke 2:10–11 · Isaiah 9:6",
    theme: "The Savior's birth is good news.",
    query: "O Holy Night hymn choir official",
    prompt: "What night does the hymn name?",
    ok: "The night of the dear Savior's birth",
    wrong: ["Any winter concert", "A folk tale"],
  },
  {
    id: "silent-night",
    title: "Silent Night",
    writer: "Joseph Mohr / Franz Gruber",
    year: 1818,
    rights: "pd",
    rooms: ["christmas", "hymns", "children", "study"],
    verse: "Silent night, holy night, all is calm, all is bright; round yon virgin mother and Child. Holy Infant, so tender and mild, sleep in heavenly peace.",
    history: "Mohr and Gruber, Oberndorf, guitar. The Infant is the Holy One.",
    scripture: "Luke 2:7–14",
    theme: "Heavenly peace in the Child.",
    youtubeId: "vKvKMgR8H7k",
    query: "Silent Night holy night hymn choir official",
    prompt: "Who sleeps in heavenly peace in Silent Night?",
    ok: "The Holy Infant, Christ the Child",
    wrong: ["Whoever is tired", "The town only"],
  },
  {
    id: "way-maker",
    title: "Way Maker",
    writer: "Sinach",
    year: 2015,
    rights: "embed",
    rooms: ["africa", "nigeria", "worship", "choir", "ccm"],
    verse: "You are here, moving in our midst… Way maker, miracle worker, promise keeper, light in the darkness.",
    history: "Written in Lagos by Sinach. The nations now sing that Jesus makes a way — West African gospel that went around the world. Recording is embedded, not copied.",
    scripture: "Isaiah 43:16 · John 14:6",
    theme: "Jesus makes a way.",
    youtubeId: "QM8jQHE5AAk",
    query: "Sinach Way Maker official live",
    prompt: "What does Way Maker confess?",
    ok: "Jesus makes a way",
    wrong: ["A dance trend", "A local slogan"],
  },
  {
    id: "nothing-but-the-blood",
    title: "Nothing but the Blood",
    writer: "Robert Lowry",
    year: 1876,
    rights: "pd",
    rooms: ["hymns", "communion", "sunday", "study"],
    verse: "What can wash away my sin? Nothing but the blood of Jesus. What can make me whole again? Nothing but the blood of Jesus.",
    history: "Lowry's communion question and answer. The blood is the only plea.",
    scripture: "1 John 1:7 · Hebrews 9:22",
    theme: "Only the blood of Jesus.",
    form: "Call and answer · congregational",
    query: "Nothing but the Blood of Jesus hymn choir official",
    prompt: "What washes away sin in this hymn?",
    ok: "Nothing but the blood of Jesus",
    wrong: ["Trying harder", "A better choir"],
  },
  {
    id: "risen-today",
    title: "Christ the Lord Is Risen Today",
    writer: "Charles Wesley",
    year: 1739,
    rights: "pd",
    rooms: ["easter", "hymns", "sunday", "study", "choir"],
    verse: "Christ the Lord is risen today, Alleluia! Earth and heaven in chorus say, Alleluia!",
    history: "Wesley for Easter morning. The alleluias are the church answering the empty tomb.",
    scripture: "Matthew 28:6 · 1 Corinthians 15:20",
    theme: "Christ is risen — alleluia.",
    form: "Easter hymn · alleluia refrain",
    query: "Christ the Lord Is Risen Today Wesley hymn choir official",
    prompt: "What does the earth and heaven chorus say?",
    ok: "Alleluia — Christ is risen",
    wrong: ["Maybe next year", "Only the choir knows"],
  },
  {
    id: "come-faithful",
    title: "O Come, All Ye Faithful",
    writer: "John Francis Wade",
    year: 1751,
    rights: "pd",
    rooms: ["christmas", "hymns", "choir", "study"],
    verse: "O come, all ye faithful, joyful and triumphant, O come ye, O come ye to Bethlehem.",
    history: "Latin Adeste fideles. The invitation is to come and behold Him — born the King of angels.",
    scripture: "Luke 2:15 · John 1:14",
    theme: "Come and behold Him.",
    form: "Processional · SATB",
    query: "O Come All Ye Faithful hymn choir official",
    prompt: "Where does the hymn bid the faithful come?",
    ok: "To Bethlehem, to behold the King",
    wrong: ["To a concert only", "To wait until Easter"],
  },
  {
    id: "jesus-loves-me",
    title: "Jesus Loves Me",
    writer: "Anna Warner",
    year: 1860,
    rights: "pd",
    rooms: ["children", "hymns", "study"],
    verse: "Jesus loves me, this I know, for the Bible tells me so. Little ones to Him belong; they are weak, but He is strong.",
    history: "Warner wrote it as a poem for a dying child in a novel. The Bible is the warrant, not a feeling.",
    scripture: "Mark 10:14 · Romans 5:8",
    theme: "Jesus loves — the Bible says so.",
    form: "Children's hymn · simple stanza",
    query: "Jesus Loves Me this I know hymn children official",
    prompt: "How do we know Jesus loves us in this hymn?",
    ok: "For the Bible tells me so",
    wrong: ["Because we feel it", "Because we sang well"],
  },
  {
    id: "choir-grace",
    title: "Amazing Grace — Tabernacle Choir",
    writer: "The Tabernacle Choir at Temple Square",
    year: 2014,
    rights: "embed",
    rooms: ["choir", "hymns", "sunday", "black"],
    verse: "Amazing grace! how sweet the sound, that saved a wretch like me.",
    history: "The Tabernacle Choir and Orchestra sing Mack Wilberg's setting of Newton's hymn on the banks of the Missouri.",
    scripture: "Ephesians 2:8 · Luke 15",
    theme: "Grace finds the lost.",
    youtubeId: "C2arm5ydeJc",
    query: "Amazing Grace The Tabernacle Choir official",
    prompt: "What does Amazing Grace teach first?",
    ok: "The lost are found by grace",
    wrong: ["Try harder", "Sing louder"],
  },
  {
    id: "choir-great",
    title: "How Great Thou Art — Tabernacle Choir",
    writer: "The Tabernacle Choir at Temple Square",
    year: 2013,
    rights: "embed",
    rooms: ["choir", "hymns", "worship", "sunday"],
    verse: "Then sings my soul, my Savior God, to Thee, how great Thou art.",
    history: "The Choir and Orchestra at Temple Square sing Stuart Hine's hymn. The soul answers the cross, not only the sky.",
    scripture: "Psalm 8 · John 3:16",
    theme: "Creation, then the cross.",
    youtubeId: "j1hVY7bmqsA",
    query: "How Great Thou Art The Tabernacle Choir official",
    prompt: "Where does How Great Thou Art land?",
    ok: "The Son sent to die for sin",
    wrong: ["Only the weather", "A travel song"],
  },
  {
    id: "choir-sparrow",
    title: "His Eye Is on the Sparrow",
    writer: "The Tabernacle Choir at Temple Square",
    year: 1905,
    rights: "embed",
    rooms: ["choir", "black", "hymns", "memorial"],
    verse: "Why should I feel discouraged? His eye is on the sparrow, and I know He watches me.",
    history: "Civilla Martin’s hymn of care. The Choir sings it as a gospel spiritual: the small are not forgotten.",
    scripture: "Matthew 10:29–31",
    theme: "He watches the small.",
    youtubeId: "6ha9a9YF3UI",
    query: "His Eye Is on the Sparrow Tabernacle Choir official",
    prompt: "What does the sparrow teach in this song?",
    ok: "God watches even the small",
    wrong: ["Only the famous matter", "Birds are the subject"],
  },
  {
    id: "choir-river",
    title: "Deep River",
    writer: "The Tabernacle Choir at Temple Square",
    year: 1875,
    rights: "embed",
    rooms: ["choir", "black", "hymns", "memorial"],
    verse: "Deep river, my home is over Jordan. I want to cross over into campground.",
    history: "An African American spiritual of the crossing. Jordan is the last river, and home is on the other side.",
    scripture: "Joshua 3 · Revelation 22:1",
    theme: "Home is over Jordan.",
    youtubeId: "LiIURFm63Yk",
    query: "Deep River Tabernacle Choir official",
    prompt: "Where is home in Deep River?",
    ok: "Over Jordan, in campground",
    wrong: ["Only the riverbank", "A concert hall"],
  },
  {
    id: "choir-saints",
    title: "When the Saints Go Marching In",
    writer: "The Tabernacle Choir at Temple Square",
    year: 1896,
    rights: "embed",
    rooms: ["choir", "black", "sunday"],
    verse: "O when the saints go marching in, I want to be in that number.",
    history: "A New Orleans spiritual the Choir sings as a march of the church, not a parade float.",
    scripture: "Revelation 7:9",
    theme: "Be in that number.",
    youtubeId: "ucQ1ueLfv_4",
    query: "When the Saints Go Marching In Tabernacle Choir official",
    prompt: "What does the singer want?",
    ok: "To be in the number of the saints",
    wrong: ["A louder brass line", "To stay on the curb"],
  },
];

export const HYMN_ARTISTS: { id: string; house: string; q: string; stamp: string; tags: string[]; room: HymnRoom }[] = [
  { id: "gaither-tv", house: "Gaither Music TV", q: "Gaither Vocal Band hymn of praise official", stamp: "Gaither hall", tags: ["#gospel", "#hymn", "#gaither"], room: "gaither" },
  { id: "gaither-home", house: "Gaither Homecoming", q: "Gaither Homecoming hymns official", stamp: "Homecoming", tags: ["#gospel", "#hymn", "#gaither"], room: "gaither" },
  { id: "gvb", house: "Gaither Vocal Band", q: "Gaither Vocal Band gospel official", stamp: "Vocal Band", tags: ["#gospel", "#gaither"], room: "gaither" },
  { id: "isaacs", house: "The Isaacs", q: "The Isaacs gospel hymn official", stamp: "Isaacs hall", tags: ["#gospel", "#hymn"], room: "southern" },
  { id: "booth", house: "The Booth Brothers", q: "Booth Brothers gospel hymn official", stamp: "Booth hall", tags: ["#gospel", "#hymn"], room: "southern" },
  { id: "haase", house: "Ernie Haase & Signature Sound", q: "Ernie Haase Signature Sound gospel official", stamp: "Quartet hall", tags: ["#gospel", "#choir"], room: "quartet" },
  { id: "hoppers", house: "The Hoppers", q: "The Hoppers gospel official", stamp: "Hoppers hall", tags: ["#gospel"], room: "southern" },
  { id: "collingsworth", house: "The Collingsworth Family", q: "Collingsworth Family hymn official", stamp: "Family hall", tags: ["#gospel", "#hymn"], room: "southern" },
  { id: "cathedrals", house: "The Cathedrals", q: "The Cathedrals quartet gospel official", stamp: "Cathedrals", tags: ["#gospel", "#choir"], room: "quartet" },
  { id: "goldcity", house: "Gold City", q: "Gold City gospel quartet official", stamp: "Gold City", tags: ["#gospel"], room: "quartet" },
  { id: "legacy5", house: "Legacy Five", q: "Legacy Five gospel official", stamp: "Legacy Five", tags: ["#gospel"], room: "quartet" },
  { id: "greater-vision", house: "Greater Vision", q: "Greater Vision gospel official", stamp: "Greater Vision", tags: ["#gospel"], room: "quartet" },
  { id: "nelons", house: "The Nelons", q: "The Nelons gospel official", stamp: "Nelons hall", tags: ["#gospel"], room: "southern" },
  { id: "kingsmen", house: "The Kingsmen", q: "The Kingsmen quartet gospel official", stamp: "Kingsmen", tags: ["#gospel"], room: "quartet" },
  { id: "martins", house: "The Martins", q: "The Martins gospel official", stamp: "Martins hall", tags: ["#gospel"], room: "southern" },
  { id: "crabb", house: "The Crabb Family", q: "The Crabb Family gospel official", stamp: "Crabb hall", tags: ["#gospel"], room: "southern" },
  { id: "perrys", house: "The Perrys", q: "The Perrys southern gospel official", stamp: "Perrys hall", tags: ["#gospel"], room: "southern" },
  { id: "triumphant", house: "Triumphant Quartet", q: "Triumphant Quartet gospel official", stamp: "Triumphant", tags: ["#gospel"], room: "quartet" },
  { id: "brian-free", house: "Brian Free & Assurance", q: "Brian Free and Assurance gospel official", stamp: "Assurance hall", tags: ["#gospel"], room: "southern" },
  { id: "mckameys", house: "The McKameys", q: "The McKameys gospel official", stamp: "McKameys", tags: ["#gospel"], room: "southern" },
  { id: "fairfield", house: "The Fairfield Four", q: "Fairfield Four gospel quartet official", stamp: "Fairfield Four", tags: ["#gospel", "#choir"], room: "quartet" },
  { id: "blind-boys", house: "The Blind Boys of Alabama", q: "Blind Boys of Alabama gospel official", stamp: "Blind Boys", tags: ["#gospel", "#choir"], room: "black" },
  { id: "hummingbirds", house: "The Dixie Hummingbirds", q: "Dixie Hummingbirds gospel official", stamp: "Hummingbirds", tags: ["#gospel"], room: "quartet" },
  { id: "clouds", house: "The Mighty Clouds of Joy", q: "Mighty Clouds of Joy gospel official", stamp: "Clouds of Joy", tags: ["#gospel", "#choir"], room: "black" },
  { id: "stirrers", house: "The Soul Stirrers", q: "Soul Stirrers gospel official", stamp: "Soul Stirrers", tags: ["#gospel"], room: "black" },
  { id: "swans", house: "The Swan Silvertones", q: "Swan Silvertones gospel official", stamp: "Silvertones", tags: ["#gospel"], room: "quartet" },
  { id: "btc", house: "Brooklyn Tabernacle Choir", q: "Brooklyn Tabernacle Choir hymn official", stamp: "Choir hall", tags: ["#gospel", "#choir"], room: "choir" },
  { id: "mass-choir", house: "Gospel mass choir", q: "mass choir gospel hymn Jesus official", stamp: "Mass choir", tags: ["#gospel", "#choir"], room: "black" },
  { id: "uni-choir", house: "University choir", q: "university choir hymn SATB Jesus official", stamp: "Campus choir", tags: ["#gospel", "#choir"], room: "choir" },
  { id: "cathedral-c", house: "Cathedral choir", q: "cathedral choir hymn SATB official", stamp: "Cathedral choir", tags: ["#hymn", "#choir"], room: "choir" },
  { id: "ccm-w", house: "Contemporary worship", q: "contemporary Christian worship hymn Jesus official", stamp: "CCM hall", tags: ["#worship", "#gospel"], room: "ccm" },
  { id: "ghana-g", house: "Ghana gospel", q: "Ghana gospel hymn worship Twi Jesus official", stamp: "Ghana hall", tags: ["#gospel", "#worship"], room: "ghana" },
  { id: "ghana-high", house: "Ghana highlife gospel", q: "Ghana highlife gospel worship official", stamp: "Highlife gospel", tags: ["#gospel", "#worship"], room: "ghana" },
  { id: "nigeria-g", house: "Nigerian gospel", q: "Nigerian Yoruba Igbo gospel worship Jesus official", stamp: "Nigeria hall", tags: ["#gospel", "#worship"], room: "nigeria" },
  { id: "kenya-g", house: "Kenyan gospel", q: "Kenyan gospel worship hymn Jesus official", stamp: "Kenya hall", tags: ["#gospel", "#worship"], room: "kenya" },
  { id: "uganda-g", house: "Ugandan gospel", q: "Uganda gospel worship Jesus official", stamp: "Uganda hall", tags: ["#gospel", "#worship"], room: "uganda" },
  { id: "congo-g", house: "Congolese gospel", q: "Congo gospel worship choir Jesus official", stamp: "Congo hall", tags: ["#gospel", "#choir"], room: "congo" },
  { id: "liberia-g", house: "Liberian gospel", q: "Liberia gospel worship Jesus official", stamp: "Liberia hall", tags: ["#gospel", "#worship"], room: "liberia" },
  { id: "zimbabwe-g", house: "Zimbabwean gospel", q: "Zimbabwe gospel choir worship Jesus official", stamp: "Zimbabwe hall", tags: ["#gospel", "#choir"], room: "zimbabwe" },
  { id: "sa-g", house: "South African gospel", q: "South Africa gospel choir choral worship official", stamp: "South Africa hall", tags: ["#gospel", "#choir"], room: "southafrica" },
  { id: "children-h", house: "Children's hymns", q: "Jesus loves me children's Bible song hymn official", stamp: "Children hall", tags: ["#hymn", "#gospel"], room: "children" },
  { id: "organ-h", house: "Instrumental hymns", q: "organ piano hymn Amazing Grace instrumental official", stamp: "Organ hall", tags: ["#hymn", "#instrumental"], room: "instrumental" },
  { id: "guitar-h", house: "Guitar hymns", q: "acoustic guitar hymn Be Thou My Vision official", stamp: "Guitar hall", tags: ["#hymn", "#instrumental"], room: "instrumental" },
];

export function hymnQueries() {
  return [
    ...HYMNS.map((h) => ({
      id: `hymn-${h.id}`,
      house: h.title,
      q: h.query,
      stamp: "Hymn hall",
      lane: "learn" as const,
      tags: ["#hymn", "#gospel", ...h.rooms.map((r) => `#${r}`)],
    })),
    ...HYMN_ARTISTS.map((a) => ({
      id: `art-${a.id}`,
      house: a.house,
      q: a.q,
      stamp: a.stamp,
      lane: "learn" as const,
      tags: a.tags,
    })),
  ];
}

export function hymnOfBlob(blob: string): HymnCard | undefined {
  const hay = blob.toLowerCase();
  return HYMNS.find((h) => hay.includes(h.title.toLowerCase()) || hay.includes(h.id.replace(/-/g, " ")));
}

export function hymnOfPost(post: FeedPost) {
  return hymnOfBlob(`${post.id} ${post.caption} ${post.hashtags.join(" ")} ${post.musicTitle ?? ""} ${post.teach.hook}`);
}

export function hymnsInRoom(room: HymnRoom | "all") {
  if (room === "all") return HYMNS;
  return HYMNS.filter((h) => h.rooms.includes(room));
}

export function postInHymnRoom(post: FeedPost, room: HymnRoom | "all") {
  if (room === "all") return true;
  const hymn = hymnOfPost(post);
  if (hymn?.rooms.includes(room)) return true;
  const blob = `${post.caption} ${post.hashtags.join(" ")} ${post.musicTitle ?? ""} ${post.teach.stamp}`.toLowerCase();
  if (room === "gaither") return blob.includes("gaither") || blob.includes("homecoming");
  if (room === "africa") return /africa|ghana|nigeria|kenya|sinach|lagos|accra|uganda|congo|liberia|zimbabwe|south africa/.test(blob);
  if (room === "ghana") return /ghana|twi|ewe|accra|highlife gospel/.test(blob);
  if (room === "nigeria") return /nigeria|yoruba|igbo|lagos|sinach/.test(blob);
  if (room === "kenya") return /kenya/.test(blob);
  if (room === "uganda") return /uganda/.test(blob);
  if (room === "congo") return /congo|congolese/.test(blob);
  if (room === "liberia") return /liberia/.test(blob);
  if (room === "zimbabwe") return /zimbabwe/.test(blob);
  if (room === "southafrica") return /south africa|south african/.test(blob);
  if (room === "ccm") return /contemporary|christian pop|praise/.test(blob);
  if (room === "worship") return /worship|praise|way maker/.test(blob);
  if (room === "choir") return /choir|tabernacle|mass choir/.test(blob);
  if (room === "southern") return /isaacs|hoppers|booth|collingsworth|nelons|martins|crabb|perrys|mckameys|brian free/.test(blob);
  if (room === "quartet") return /cathedral|gold city|legacy five|greater vision|kingsmen|ernie haase|quartet|fairfield|hummingbirds|silvertones|triumphant/.test(blob);
  if (room === "black") return /mass choir|brooklyn|black gospel|crosby|surrender|blind boys|clouds of joy|soul stirrers/.test(blob);
  if (room === "hymns" || room === "sunday" || room === "study") return /hymn|grace|thou art|it is well|jesus/.test(blob);
  if (room === "christmas") return /christmas|holy night|silent night|nativity/.test(blob);
  if (room === "easter") return /easter|arose|he lives|resurrection/.test(blob);
  if (room === "communion") return /communion|wondrous cross|old rugged/.test(blob);
  if (room === "memorial") return /abide|it is well|nearer|memorial/.test(blob);
  if (room === "children") return /children|jesus loves me/.test(blob);
  if (room === "instrumental") return /instrumental|organ|piano hymn/.test(blob);
  if (room === "oldtime") return /old time|vintage|homecoming/.test(blob);
  return false;
}

export function hymnPeriod(h: HymnCard) {
  if (h.year < 1700) return "Early hymnody";
  if (h.year < 1800) return "18th century";
  if (h.year < 1900) return "19th century";
  if (h.year < 1931) return "Early 20th century · public-domain text";
  return "Modern · embed the recording";
}

export function hymnForm(h: HymnCard) {
  return h.form ?? "Congregational hymn · SATB";
}

export function hymnOfDay(at = Date.now()) {
  const day = Math.floor(at / 86_400_000);
  return HYMNS[Math.abs(day) % HYMNS.length]!;
}

export function hymnsForNeed(id: string) {
  const need = HYMN_NEEDS.find((n) => n.id === id);
  if (!need) return [];
  return need.hymns.map((hid) => HYMNS.find((h) => h.id === hid)).filter(Boolean) as HymnCard[];
}

const SAVE_KEY = "vibetok-hymns";

export function readSavedHymns(): string[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeSavedHymns(ids: string[]) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(ids.slice(0, 80)));
  } catch {
    /* quota */
  }
}

export function toggleSavedHymn(id: string) {
  const cur = readSavedHymns();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
  writeSavedHymns(next);
  return next;
}

function teachOf(h: HymnCard): Teach {
  return {
    hook: h.theme,
    stamp: h.title,
    prompt: h.prompt,
    options: [
      { id: "a", label: h.ok, ok: true },
      { id: "b", label: h.wrong[0], ok: false },
      { id: "c", label: h.wrong[1], ok: false },
    ],
  };
}

export function hymnSeedPosts(): FeedPost[] {
  const faces = Object.values(FACE);
  return HYMNS.filter((h) => h.youtubeId).map((h, i) => ({
    id: `mu-hymn-${h.id}`,
    author: {
      name: h.writer,
      username: h.id.slice(0, 12),
      avatar: faces[i % faces.length] ?? FACE.adwoa,
    },
    caption: `${h.title}. ${h.history} Source · Expedite Consults LLC.`,
    lane: "learn" as const,
    mediaType: "video" as const,
    mediaUrl: `https://www.youtube.com/watch?v=${h.youtubeId}`,
    posterUrl: `https://i.ytimg.com/vi/${h.youtubeId}/hqdefault.jpg`,
    youtubeId: h.youtubeId,
    views: 1200000,
    likes: 18000,
    comments: 420,
    shares: 2100,
    isLiked: false,
    isSaved: false,
    isFollowing: true,
    hashtags: ["#hymn", "#gospel", ...h.rooms.map((r) => `#${r}`)],
    musicTitle: h.title,
    teach: teachOf(h),
  }));
}

