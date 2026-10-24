import type { FeedPost, Teach } from "@/lib/feed-data";
import type { HallCard } from "@/lib/hall";
import { SOURCE } from "@/lib/source";
import { youtubePoster } from "@/lib/youtube";

const FACE = "https://ui-avatars.com/api/?name=BibleProject&background=0b1220&color=e4b86a&size=128&bold=true";

function teach(hook: string, prompt: string, ok: string, wrong: [string, string]): Teach {
  return {
    hook,
    stamp: "Scripture",
    prompt,
    options: [
      { id: "a", label: ok, ok: true },
      { id: "b", label: wrong[0], ok: false },
      { id: "c", label: wrong[1], ok: false },
    ],
  };
}

function card(id: string, title: string, film: string, youtubeId: string, group: string, lesson: Teach): HallCard {
  const poster = youtubePoster(youtubeId);
  const post: FeedPost = {
    id: `scripture-${id}`,
    author: { name: "BibleProject", username: "bibleproject", avatar: FACE },
    caption: `${title}. Film · ${film}. Presented by ${SOURCE}.`,
    lane: "learn",
    mediaType: "video",
    mediaUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    posterUrl: poster,
    youtubeId,
    views: 1_200_000,
    likes: 24000,
    comments: 320,
    shares: 140,
    isLiked: false,
    isSaved: false,
    isFollowing: true,
    hashtags: ["#scripture", "#bible"],
    musicTitle: `BibleProject · ${SOURCE}`,
    teach: lesson,
  };
  return {
    id: post.id,
    hall: "classroom",
    ticket: "teacher",
    title,
    mentor: "BibleProject",
    shift: group,
    mediaType: "image",
    mediaUrl: poster,
    posterUrl: poster,
    badge: group,
    post,
  };
}

/** Public BibleProject films. Each title matches the film, not a topic we could not find. */
export const SCRIPTURE_CARDS: HallCard[] = [
  card("read", "How to read the Bible", "How to Read the Bible Overview", "plSNIwhAn5o", "Read", teach("Read it as one story", "What is the Bible, in this film?", "A library of styles that tells one story", ["A single rule list", "One genre only"])),
  card("books", "The books of the Bible, as a library", "What is the Bible?", "ak06MSETeo4", "Read", teach("A library, not one tweet", "What kind of book is the Bible here?", "A collection of books with one story", ["One author's diary", "A list of slogans"])),
  card("context", "Read each style in its own context", "Writing Styles of the Bible", "oUXJ8Owes8E", "Read", teach("Genre first", "Why does the style of a passage matter?", "Each style has its own way of speaking", ["Every line is a newspaper fact", "Style can be ignored"])),
  card("story", "Old Testament to New: the whole story", "The Story of the Bible", "7_CGP-12AE0", "Read", teach("One story, start to end", "Where does this film say the story leads?", "To Jesus", ["It stops at the kings", "It never leaves Genesis"])),
  card("covenants", "The major covenants", "Covenants", "6v4jKkFj3TI", "Read", teach("Partnership, then Jesus", "Who are the Old Testament covenant partners in this film?", "Noah, Abraham, Israel, and David", ["Only Moses", "Only the church"])),
  card("ot", "Biblical timeline: the Old Testament", "Old Testament Summary", "ALsluAKBZ-c", "Read", teach("From the start to exile", "What does this overview walk through?", "The shape of the Old Testament", ["Only the Gospels", "Only Revelation"])),
  card("nt", "Biblical timeline: the New Testament", "New Testament Summary", "Q0BrP8bqj0c", "Read", teach("From the Gospels onward", "What collection does this film overview?", "The New Testament", ["Only Genesis", "Only the Psalms"])),
  card("check", "How a passage gets checked", "Biblical Scholarship", "VLpsR5CCWWo", "Read", teach("Check the work", "What is this film about?", "How BibleProject researches a topic", ["A list of every author", "A sermon with no sources"])),
  card("jesus", "The life of Jesus, birth to resurrection", "The Gospel", "xrzq_X1NNaA", "Study", teach("Four accounts, one announcement", "What are the four Gospels?", "Ancient biographies of Jesus", ["One modern novel", "A book of laws only"])),
  card("sermon", "The Sermon on the Mount", "Jesus Said 2,000 Words That Changed Human History", "NtKb7CJDUZc", "Study", teach("The sermon has a design", "Where do these teachings sit?", "In the Sermon on the Mount", ["In a parable only", "In Revelation only"])),
  card("parables", "The parables on the road", "Gospel of Luke, part 2", "26z_KhwNdD8", "Study", teach("Stories on the way", "What fills the center of Luke in this film?", "Teaching and parables on the road", ["A list of kings", "Only the temple measurements"])),
  card("acts", "What Jesus did", "Gospel of Mark", "HGHqu9-DtXk", "Study", teach("Watch what he does", "Which Gospel is this film?", "Mark", ["Leviticus", "Esther"])),
  card("romans", "The book of Romans", "Book of Romans, part 1", "ej_6dVdJSIU", "Study", teach("A letter about the gospel", "Who wrote Romans, in this film?", "Paul", ["David", "Moses"])),
  card("revelation", "The book of Revelation", "Revelation", "5nvVVcYD-0w", "Study", teach("A letter, not a panic chart", "What is Revelation first?", "A letter of hope to churches", ["A stock code", "A horror timetable"])),
  card("messiah", "The Messiah promised, then named", "Gospel of Matthew, part 1", "3Dv4-n6OYGI", "Study", teach("From David's line", "How does Matthew introduce Jesus?", "As the Messiah, a teacher like Moses, and God with us", ["As a later editor", "As a Roman official"])),
  card("kings", "Kings of Israel and Judah", "1–2 Kings", "bVFW3wbi9pk", "Study", teach("The line after David", "What happens to the kingdom in Kings?", "It splits, and the kings fail the promise", ["Every king succeeds", "The story never leaves Egypt"])),
  card("prophets", "The prophets: how to read them", "How to Read the 15 Prophetic Books", "edcqUu_BtN0", "Study", teach("Fifteen books, one job", "What does this film teach you to read?", "The prophetic books", ["Only the Psalms", "Only the Gospels"])),
  card("claim", "Did Jesus claim to be God?", "Gospel of John, part 1", "G-2e9mMf7E8", "Ask", teach("The Word became flesh", "How does John name Jesus at the start?", "The Word made flesh", ["A footnote", "A later rumor only"])),
  card("heaven", "What the Bible says about heaven", "The kingdom of the skies", "0iJ1-_nH47c", "Ask", teach("Heaven arriving on earth", "What does 'kingdom of the skies' mean here?", "God's realm of life and justice coming to earth", ["A map of the clouds only", "A private club"])),
  card("investigate", "Patterns you can check yourself", "Plot in Biblical Narrative", "dLFCE8z__hw", "Ask", teach("The plot repeats on purpose", "What can a reader investigate in a biblical story?", "How the plot is designed", ["Nothing. It is random", "Only the page number"])),
  card("trinity", "Jesus and the one God", "The Trinity Explained", "eAvYmE2YYIU", "Ask", teach("Do not pretend it is simple", "What is this film willing to say?", "The Trinity is real, and it is not simple", ["God is three separate gods", "Jesus is only a symbol"])),
];

export const SCRIPTURE_POSTS: FeedPost[] = SCRIPTURE_CARDS.map((row) => row.post);

/** One film, one tab. Clinic scrolls the story. Knowledge holds the books. Reels holds the questions. */
export const SCRIPTURE_TAB: Record<string, "clinic" | "study" | "reels" | "crews"> = {
  "scripture-read": "clinic",
  "scripture-story": "clinic",
  "scripture-covenants": "clinic",
  "scripture-jesus": "clinic",
  "scripture-claim": "clinic",
  "scripture-books": "crews",
  "scripture-context": "crews",
  "scripture-ot": "crews",
  "scripture-nt": "crews",
  "scripture-sermon": "crews",
  "scripture-parables": "crews",
  "scripture-acts": "crews",
  "scripture-romans": "crews",
  "scripture-revelation": "crews",
  "scripture-messiah": "crews",
  "scripture-kings": "crews",
  "scripture-prophets": "crews",
  "scripture-heaven": "reels",
  "scripture-investigate": "reels",
  "scripture-trinity": "reels",
  "scripture-check": "crews",
};
