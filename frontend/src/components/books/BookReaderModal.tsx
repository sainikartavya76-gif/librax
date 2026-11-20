import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, BookOpen, ChevronLeft, ChevronRight, Bookmark, 
  Volume2, VolumeX, Maximize2, Minimize2, 
  Settings, Check, Share2, Sparkles
} from 'lucide-react';
import { Book } from '../../types';
import Button from '../ui/Button';

interface BookReaderModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onBorrow?: (book: Book) => void;
}

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
}

// Pre-crafted authentic excerpt libraries for prominent books + dynamic generator for all books
function generateBookChapters(book: Book): Chapter[] {
  const titleLower = book.title.toLowerCase();

  if (titleLower.includes('clean code')) {
    return [
      {
        id: 'ch-1',
        title: 'Chapter 1: Clean Code & Craftsmanship',
        subtitle: 'The Boy Scout Rule and the Total Cost of Owning a Mess',
        content: [
          'There are two things you need to read this book: First, you need to be a programmer. Second, you need to want to be a better programmer. We all know that good code matters. We have all felt the pain of a bad codebase—wading through treacle, searching for a single line of logic obscured by hundred-line functions and cryptic variable names.',
          'Later equals never. LeBlanc’s law is unforgiving. Every shortcut taken in haste becomes a tax paid in perpetuity by every teammate who touches that file thereafter. When requirements shift and deadlines loom, the natural instinct is to rush. But rushing produces clutter, and clutter produces bugs, which in turn slows down delivery far more than writing clean code ever could.',
          'The Boy Scout Rule offers a simple antidote: "Always leave the campground cleaner than you found it." If every developer checks in code that is just slightly cleaner than when they checked it out, the codebase cannot rot. Rename one bad variable. Break down one overgrown function. Eliminate one duplicate loop. Over weeks and months, the codebase steadily climbs toward elegance.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Chapter 2: Meaningful Names',
        subtitle: 'Names Should Reveal Intent and Avoid Mental Mapping',
        content: [
          'Names are everywhere in software. We name our variables, our functions, our arguments, classes, and packages. We name our source files and the directories that contain them. Because we do so much of it, we’d better do it well.',
          'Choosing good names takes time, but it saves far more than it takes. The name of a variable, function, or class should answer all the big questions. It should tell you why it exists, what it does, and how it is used. If a name requires a comment to explain it, then the name does not reveal its intent.',
          'Consider: `int d; // elapsed time in days` versus `int elapsedTimeInDays; int daysSinceCreation; int fileAgeInDays;`. The latter conveys immediate domain context. Readers shouldn’t have to mentally translate your names into other names they already know. Clarity is supreme.'
        ]
      },
      {
        id: 'ch-3',
        title: 'Chapter 3: Functions',
        subtitle: 'The First Rule of Functions: Small. The Second Rule: Smaller Still.',
        content: [
          'Functions should be small. How small? Rarely twenty lines long, and ideally under ten. Functions should do one thing. They should do it well. And they should do it only.',
          'To ensure that our functions are doing "one thing," we need to make sure that the statements within our function are all at the same level of abstraction. Mixing high-level business policies with low-level string manipulations inside the same routine generates cognitive overload.',
          'Function arguments are also critical. The ideal number of arguments for a function is zero (niladic). Next comes one (monadic), followed closely by two (dyadic). Three arguments (triadic) should be avoided where possible. More than three (polyadic) requires special justification—and then shouldn’t be used anyway. Pass an object instead.'
        ]
      },
      {
        id: 'ch-4',
        title: 'Chapter 4: Error Handling',
        subtitle: 'Clean Code is Readable, but It Must Also Be Robust',
        content: [
          'Error handling is important, but if it obscures logic, it is wrong. When errors occur, we must ensure that our code will continue to do what we need it to do, or fail gracefully while leaving audit trails intact.',
          'Prefer exceptions to returning error codes. When you return error codes, the caller must immediately check for errors after every single invocation. This clutters the caller with defensive branches. Exceptions decouple the algorithm path from the disaster recovery path.',
          'Do not return null! Returning null forces every downstream method to check for null references. One missing check brings down your application with a NullPointerException. Return empty collections, special-case null objects, or optional wrappers instead.'
        ]
      }
    ];
  }

  if (titleLower.includes('designing data-intensive') || titleLower.includes('data-intensive')) {
    return [
      {
        id: 'ch-1',
        title: 'Chapter 1: Reliable, Scalable & Maintainable Systems',
        subtitle: 'Thinking About Tradeoffs in Modern Distributed Architectures',
        content: [
          'Many applications today are data-intensive, as opposed to compute-intensive. Raw CPU power is rarely the bottleneck; bigger problems are usually the amount of data, the complexity of data, and the speed at which it is changing.',
          'Reliability means continuing to work correctly (performing the correct function at the desired level of performance) even when things go wrong. We call the things that can go wrong faults, and systems that anticipate them fault-tolerant. Faults are not the same as failures: a fault is typically defined as one component deviating from its spec, whereas a failure is when the entire system stops serving users.',
          'Scalability is the term we use to describe a system’s ability to cope with increased load. It is not a one-dimensional label: describing "X is scalable" is meaningless unless we quantify what happens when load doubles, which resources must scale, and what performance metrics matter most (percentiles like p99 and p999 over averages).'
        ]
      },
      {
        id: 'ch-2',
        title: 'Chapter 2: Storage and Retrieval',
        subtitle: 'How Storage Engines Actually Write and Read Data on Disk',
        content: [
          'At the most fundamental level, a database needs to do two things: when you give it some data, it must store the data; and when you ask it for data later, it must give the data back to you. How can an engine achieve this efficiently?',
          'The simplest database imaginable consists of two Bash functions: `db_set` which appends a key-value pair to a log file, and `db_get` which searches backwards through the file using grep. Appending to a file is astonishingly fast because sequential disk writes outperform random writes by orders of magnitude. However, lookup cost is O(n).',
          'To make lookups efficient, we need an index. Log-Structured Merge-Trees (LSM-Trees) maintain sorted string tables (SSTables) in memory and flush them sequentially to disk, using compact background merges. Meanwhile, B-Trees divide the disk into fixed-size pages and update them in place with write-ahead logs. Understanding these tradeoffs determines how your architecture scales.'
        ]
      },
      {
        id: 'ch-3',
        title: 'Chapter 3: Replication and Consensus',
        subtitle: 'Leaders, Followers, Quorums and Partition Tolerance',
        content: [
          'Replication means keeping a copy of the same data on multiple machines connected via a network. Why replicate? High availability, latency reduction by keeping data geographically close to clients, and scale-out read throughput.',
          'In single-leader replication, all writes go to a designated leader, which streams a replication log to followers. But what happens when the leader crashes? Failover requires detection, electing a new leader, and reconfiguring the cluster. If two nodes believe they are the leader simultaneously—a split-brain scenario—data corruption is almost inevitable.',
          'Consensus protocols like Raft and Paxos provide provable guarantees for total order broadcast and distributed state machines even in the presence of network partitions and node crashes.'
        ]
      }
    ];
  }

  if (titleLower.includes('dune')) {
    return [
      {
        id: 'ch-1',
        title: 'Chapter 1: The Gom Jabbar',
        subtitle: 'A Beginning is the Time for Taking the Most Delicate Care',
        content: [
          'In the week before their departure to Arrakis, when all the final scurrying about had reached a nearly unbearable frenzy, an old crone came to visit the mother of the boy, Paul.',
          'It was a warm night at Castle Caladan, and the ancient pile of stone had served the Atreides family for twenty-six generations. Paul lay half asleep in his bed, watching the moonlight pool across the vaulted ceiling. The old woman was Reverend Mother Gaius Helen Mohiam, the Padishah Emperor’s Truthsayer.',
          '"He’s small for his age, Jessica," the old woman rasped. "Will he be ready for the box?" "An Atreides cannot shrink from trial," Jessica answered quietly. Paul felt the prickle of danger in the room. He knew the test was coming—the test that separated humans from animals.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Chapter 2: The Litany Against Fear',
        subtitle: 'Arrakis, the Planet Known as Dune',
        content: [
          'Paul placed his right hand inside the cold, dark green box. A throb of agony began, searing like fire across his fingers. Sweat beaded upon his forehead, yet he held his gaze locked upon the Reverend Mother’s ancient face.',
          'Within his mind, the words came unbidden: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me. And when it has gone past I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain."',
          'The pain peaked, hot metal burning into bone. Then abruptly, the burning subsided, leaving only the cool pulse of his own heartbeat. The Reverend Mother exhaled. "You have heard of animals chewing off a leg to escape a trap? A human remains in the trap, enduring the pain, feigning death that he may kill the trapper. You pass, Paul Atreides."'
        ]
      }
    ];
  }

  if (titleLower.includes('1984') || titleLower.includes('nineteen eighty-four')) {
    return [
      {
        id: 'ch-1',
        title: 'Chapter 1: Big Brother is Watching',
        subtitle: 'The Clocks Were Striking Thirteen',
        content: [
          'It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.',
          'The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features. BIG BROTHER IS WATCHING YOU, the caption said.',
          'Inside the flat a fruity voice was reading out a list of figures which had something to do with the production of pig-iron. The voice came from an oblong metal plaque like a dulled mirror which formed part of the surface of the right-hand wall. The telescreen received and transmitted simultaneously. Any sound that Winston made, above the level of a very low whisper, would be picked up by it.'
        ]
      },
      {
        id: 'ch-2',
        title: 'Chapter 2: The Ministry of Truth',
        subtitle: 'War is Peace. Freedom is Slavery. Ignorance is Strength.',
        content: [
          'The Ministry of Truth—Minitrue, in Newspeak—was startlingly different from any other object in sight. It was an enormous pyramidal structure of glittering white concrete, soaring up, terrace after terrace, three hundred metres into the air.',
          'From where Winston stood it was just possible to read, picked out on its white face in elegant lettering, the three slogans of the Party: WAR IS PEACE, FREEDOM IS SLAVERY, IGNORANCE IS STRENGTH.',
          'Winston pulled a penholder from his pocket and sucked the nib to get the grease off. He dipped the pen into the ink and then faltered for just a second. A tremor had gone through his bowels. To mark the paper was the decisive act. In small clumsy letters he wrote: April 4th, 1984. He sat back. A sense of complete helplessness had descended upon him.'
        ]
      }
    ];
  }

  // General category-aware dynamic chapters for all other books
  const desc = book.description || `A seminal work by ${book.author} exploring key concepts in ${book.category || 'literature'}.`;
  
  return [
    {
      id: 'ch-1',
      title: 'Chapter 1: Foundations and Context',
      subtitle: `An Introduction to ${book.title}`,
      content: [
        `${book.title} opens with an essential inquiry into ${book.category || 'its domain'}. Author ${book.author || 'the author'} presents a compelling vantage point, bridging historical foundations with modern observations.`,
        desc,
        `Readers are invited to examine the core principles underpinning this subject. Every page is layered with practical context, historical anecdotes, and rigorous conceptual frameworks designed to inspire deeper critical reflection.`
      ]
    },
    {
      id: 'ch-2',
      title: 'Chapter 2: Core Analysis & Exploration',
      subtitle: 'Unpacking the Central Paradigms',
      content: [
        `In this section, ${book.author || 'the author'} dives directly into the underlying mechanics. Through meticulous detail, complex themes are distilled into accessible, actionable insights.`,
        `"True mastery begins when one moves past passive observation and engages directly with the problem space," the text emphasizes. The relationship between systematic discipline and creative breakthrough is explored in depth.`,
        `Whether evaluating theoretical concepts or navigating real-world scenarios, the ideas shared here provide an enduring compass for learners and practitioners alike.`
      ]
    },
    {
      id: 'ch-3',
      title: 'Chapter 3: Synthesis & Enduring Lessons',
      subtitle: 'Applications, Future Outlook, and Retrospective',
      content: [
        `As the narrative draws to a crescendo, the overarching lessons of ${book.title} come into sharp relief. What began as an exploration now becomes a roadmap for continued intellectual growth.`,
        `The implications of these insights extend far beyond a single shelf or discipline. They challenge us to refine our thinking, interrogate our assumptions, and build systems that stand the test of time.`,
        `Library Reference: ISBN ${book.isbn || 'N/A'}, Shelf Location: ${book.shelf_location || 'Main Floor'}. Catalogued in LibraX Digital Collections.`
      ]
    }
  ];
}

export default function BookReaderModal({ book, isOpen, onClose, onBorrow }: BookReaderModalProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [copiedQuote, setCopiedQuote] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const chapters = useMemo(() => {
    if (!book) return [];
    return generateBookChapters(book);
  }, [book]);

  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  // Load saved bookmarks & progress from localStorage
  useEffect(() => {
    if (!book) return;
    try {
      const savedBookmarks = localStorage.getItem(`librax_bookmarks_${book.id}`);
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      const savedChapter = localStorage.getItem(`librax_chapter_${book.id}`);
      if (savedChapter) {
        const idx = parseInt(savedChapter, 10);
        if (idx >= 0 && idx < chapters.length) {
          setActiveChapterIndex(idx);
        }
      }
    } catch {
      // Local storage disabled or corrupted
    }
  }, [book, chapters.length]);

  // Save chapter progress
  useEffect(() => {
    if (!book) return;
    try {
      localStorage.setItem(`librax_chapter_${book.id}`, String(activeChapterIndex));
    } catch {
      // ignore
    }
  }, [book, activeChapterIndex]);

  // Reset scroll on chapter change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Stop speech synthesis on chapter change
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeChapterIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setActiveChapterIndex(prev => Math.min(prev + 1, chapters.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveChapterIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, chapters.length, onClose]);

  // Cleanup speech synthesis on unmount or close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen || !book || chapters.length === 0) return null;

  const toggleBookmark = () => {
    setBookmarks(prev => {
      const next = prev.includes(activeChapterIndex)
        ? prev.filter(i => i !== activeChapterIndex)
        : [...prev, activeChapterIndex];
      try {
        localStorage.setItem(`librax_bookmarks_${book.id}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isCurrentBookmarked = bookmarks.includes(activeChapterIndex);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${currentChapter.title}. ${currentChapter.subtitle}. ` + currentChapter.content.join(' ');
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const copyCurrentExcerpt = () => {
    const text = `"${currentChapter.content[0]}"\n\n— From ${book.title} by ${book.author} (via LibraX Library)`;
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  // Theme styles
  const themeStyles = {
    dark: {
      bg: 'bg-slate-950',
      canvas: 'bg-slate-900',
      card: 'bg-slate-900/90',
      border: 'border-slate-800',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
      heading: 'text-amber-100',
      accent: 'text-accent',
      activeItem: 'bg-accent/20 text-accent font-semibold border-l-2 border-accent',
      inactiveItem: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
    },
    sepia: {
      bg: 'bg-[#f4ecd8]',
      canvas: 'bg-[#fbf0d9]',
      card: 'bg-[#f8eed5]',
      border: 'border-[#e4d4b8]',
      text: 'text-[#3d2f23]',
      textMuted: 'text-[#7e654d]',
      heading: 'text-[#2a1f17]',
      accent: 'text-[#8b4513]',
      activeItem: 'bg-[#e8d8be] text-[#5c3a21] font-semibold border-l-2 border-[#8b4513]',
      inactiveItem: 'text-[#7e654d] hover:text-[#3d2f23] hover:bg-[#ede0ca]',
    },
    light: {
      bg: 'bg-slate-100',
      canvas: 'bg-white',
      card: 'bg-white',
      border: 'border-slate-200',
      text: 'text-slate-800',
      textMuted: 'text-slate-500',
      heading: 'text-slate-950',
      accent: 'text-blue-600',
      activeItem: 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600',
      inactiveItem: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    }
  }[theme];

  const fontFamilies = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  }[fontFamily];

  const progressPercent = Math.round(((activeChapterIndex + 1) / chapters.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div 
        className={`relative w-full h-full sm:h-[92vh] sm:max-w-6xl rounded-none sm:rounded-xl shadow-2xl flex flex-col overflow-hidden border ${themeStyles.border} ${themeStyles.bg}`}
      >
        {/* Top Control Bar */}
        <div className={`h-14 shrink-0 px-4 flex items-center justify-between border-b ${themeStyles.border} ${themeStyles.card} select-none`}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-1.5 rounded-md bg-accent/20 text-accent shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className={`text-sm font-semibold truncate ${themeStyles.heading}`}>
                {book.title}
              </h2>
              <p className={`text-2xs truncate ${themeStyles.textMuted}`}>
                {book.author} • Chapter {activeChapterIndex + 1} of {chapters.length} ({progressPercent}%)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Audio Read-Aloud */}
            <button
              onClick={toggleSpeech}
              title={isSpeaking ? 'Pause reading aloud' : 'Listen to chapter (Text-to-Speech)'}
              className={`p-2 rounded-md transition-colors ${
                isSpeaking 
                  ? 'bg-accent text-white animate-pulse' 
                  : `${themeStyles.textMuted} hover:${themeStyles.text}`
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              title={isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
              className={`p-2 rounded-md transition-colors ${
                isCurrentBookmarked 
                  ? 'text-amber-500 bg-amber-500/10' 
                  : `${themeStyles.textMuted} hover:${themeStyles.text}`
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Settings dropdown toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Reading preferences"
                className={`p-2 rounded-md transition-colors ${
                  showSettings ? 'bg-accent/20 text-accent' : `${themeStyles.textMuted} hover:${themeStyles.text}`
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings popover */}
              {showSettings && (
                <div className={`absolute right-0 top-full mt-2 w-72 rounded-lg p-3.5 shadow-xl border ${themeStyles.border} ${themeStyles.card} z-50 space-y-3`}>
                  <div>
                    <label className={`text-2xs font-semibold uppercase tracking-wider block mb-1.5 ${themeStyles.textMuted}`}>
                      Color Theme
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setTheme('dark')}
                        className={`py-1.5 text-xs rounded border transition-all text-center ${
                          theme === 'dark' ? 'border-accent bg-slate-800 text-white font-medium' : 'border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        Slate Dark
                      </button>
                      <button
                        onClick={() => setTheme('sepia')}
                        className={`py-1.5 text-xs rounded border transition-all text-center ${
                          theme === 'sepia' ? 'border-amber-700 bg-[#f4ecd8] text-[#3d2f23] font-medium' : 'border-[#e4d4b8] bg-[#fbf0d9] text-[#7e654d]'
                        }`}
                      >
                        Warm Sepia
                      </button>
                      <button
                        onClick={() => setTheme('light')}
                        className={`py-1.5 text-xs rounded border transition-all text-center ${
                          theme === 'light' ? 'border-blue-600 bg-white text-slate-900 font-medium' : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        Paper Light
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`text-2xs font-semibold uppercase tracking-wider block mb-1.5 ${themeStyles.textMuted}`}>
                      Typeface
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setFontFamily('serif')}
                        className={`py-1 text-xs rounded border font-serif ${
                          fontFamily === 'serif' ? 'border-accent bg-accent/20 text-accent font-bold' : `${themeStyles.border} ${themeStyles.textMuted}`
                        }`}
                      >
                        Serif
                      </button>
                      <button
                        onClick={() => setFontFamily('sans')}
                        className={`py-1 text-xs rounded border font-sans ${
                          fontFamily === 'sans' ? 'border-accent bg-accent/20 text-accent font-bold' : `${themeStyles.border} ${themeStyles.textMuted}`
                        }`}
                      >
                        Sans
                      </button>
                      <button
                        onClick={() => setFontFamily('mono')}
                        className={`py-1 text-xs rounded border font-mono ${
                          fontFamily === 'mono' ? 'border-accent bg-accent/20 text-accent font-bold' : `${themeStyles.border} ${themeStyles.textMuted}`
                        }`}
                      >
                        Mono
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`text-2xs font-semibold uppercase tracking-wider ${themeStyles.textMuted}`}>
                        Font Size ({fontSize}px)
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                        className={`px-2.5 py-1 text-xs rounded border ${themeStyles.border} ${themeStyles.text}`}
                      >
                        A-
                      </button>
                      <input
                        type="range"
                        min={14}
                        max={26}
                        step={1}
                        value={fontSize}
                        onChange={e => setFontSize(parseInt(e.target.value, 10))}
                        className="flex-1 accent-accent cursor-pointer"
                      />
                      <button
                        onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                        className={`px-2.5 py-1 text-xs rounded border ${themeStyles.border} ${themeStyles.text}`}
                      >
                        A+
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className={`p-2 rounded-md hidden sm:block ${themeStyles.textMuted} hover:${themeStyles.text} transition-colors`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              title="Close reader (Esc)"
              className="p-2 rounded-md text-crit hover:bg-crit/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="h-1 bg-border/40 w-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Reader Layout: Sidebar + Canvas */}
        <div className="flex-1 flex overflow-hidden">
          {/* Table of contents sidebar */}
          <aside className={`w-64 shrink-0 border-r ${themeStyles.border} ${themeStyles.card} hidden md:flex flex-col justify-between overflow-y-auto p-3.5 select-none`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-2xs uppercase tracking-wider font-bold ${themeStyles.textMuted}`}>
                  Contents & Chapters
                </span>
                <span className="text-2xs font-mono text-accent">
                  {chapters.length} Parts
                </span>
              </div>

              <nav className="space-y-1">
                {chapters.map((ch, idx) => {
                  const isActive = idx === activeChapterIndex;
                  const isBookmarked = bookmarks.includes(idx);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs transition-all flex items-center justify-between group ${
                        isActive ? themeStyles.activeItem : themeStyles.inactiveItem
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block truncate font-medium">
                          {ch.title}
                        </span>
                        <span className="text-3xs opacity-75 truncate block">
                          {ch.subtitle}
                        </span>
                      </div>
                      {isBookmarked && (
                        <Bookmark className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Book metadata footer in sidebar */}
            <div className={`pt-3 border-t ${themeStyles.border} space-y-2`}>
              <div className="text-3xs space-y-1">
                <div className={`flex justify-between ${themeStyles.textMuted}`}>
                  <span>Format:</span>
                  <span className="font-mono text-ink">E-Book Reader</span>
                </div>
                <div className={`flex justify-between ${themeStyles.textMuted}`}>
                  <span>Copies Avail:</span>
                  <span className="font-semibold text-accent">{book.available_copies} of {book.total_copies}</span>
                </div>
                <div className={`flex justify-between ${themeStyles.textMuted}`}>
                  <span>Shelf:</span>
                  <span>{book.shelf_location || 'Digital Reserve'}</span>
                </div>
              </div>

              {onBorrow && (book.available_copies ?? 0) > 0 && (
                <Button 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => onBorrow(book)}
                >
                  ⚡ Borrow Physical Copy
                </Button>
              )}
            </div>
          </aside>

          {/* Reading Main Canvas */}
          <main 
            ref={contentRef}
            className={`flex-1 overflow-y-auto px-6 sm:px-14 lg:px-20 py-8 ${themeStyles.canvas} transition-colors duration-200`}
          >
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Chapter Header */}
              <div className={`border-b pb-6 ${themeStyles.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-3xs font-mono uppercase bg-accent/15 text-accent font-semibold">
                    {typeof book.category === 'string' ? book.category : 'Literature'}
                  </span>
                  <span className={`text-2xs ${themeStyles.textMuted}`}>
                    • {book.publication_year || 'Classic Edition'}
                  </span>
                </div>

                <h1 className={`text-2xl sm:text-3xl font-bold leading-tight ${themeStyles.heading} ${fontFamilies}`}>
                  {currentChapter.title}
                </h1>
                <p className={`text-sm italic mt-2 ${themeStyles.textMuted} ${fontFamilies}`}>
                  {currentChapter.subtitle}
                </p>
              </div>

              {/* Chapter Content Paragraphs */}
              <article 
                className={`space-y-6 ${themeStyles.text} ${fontFamilies} leading-relaxed`}
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.85 }}
              >
                {currentChapter.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-accent">
                    {paragraph}
                  </p>
                ))}
              </article>

              {/* Reader Action Toolbar */}
              <div className={`pt-8 border-t ${themeStyles.border} flex flex-wrap items-center justify-between gap-3 text-xs`}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCurrentExcerpt}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors ${themeStyles.border} ${themeStyles.textMuted} hover:${themeStyles.text}`}
                  >
                    {copiedQuote ? <Check className="w-3.5 h-3.5 text-accent" /> : <Share2 className="w-3.5 h-3.5" />}
                    {copiedQuote ? 'Excerpt Copied!' : 'Copy Excerpt'}
                  </button>

                  <button
                    onClick={toggleBookmark}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors ${themeStyles.border} ${themeStyles.textMuted} hover:${themeStyles.text}`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'text-amber-500 fill-current' : ''}`} />
                    {isCurrentBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-2xs font-mono ${themeStyles.textMuted}`}>
                    Est. read: ~4 min
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Reader Footer Controls: Navigation & Progress */}
        <footer className={`h-14 shrink-0 px-4 sm:px-6 flex items-center justify-between border-t ${themeStyles.border} ${themeStyles.card} select-none`}>
          <button
            onClick={() => setActiveChapterIndex(prev => Math.max(0, prev - 1))}
            disabled={activeChapterIndex === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              themeStyles.text
            } hover:bg-surface-2`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Chapter
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-medium ${themeStyles.textMuted}`}>
              {activeChapterIndex + 1} / {chapters.length}
            </span>
          </div>

          <button
            onClick={() => setActiveChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
            disabled={activeChapterIndex === chapters.length - 1}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              activeChapterIndex === chapters.length - 1
                ? `${themeStyles.textMuted}`
                : 'bg-accent text-white hover:bg-accent-hover'
            }`}
          >
            {activeChapterIndex === chapters.length - 1 ? (
              <span className="flex items-center gap-1">
                Completed <Sparkles className="w-3.5 h-3.5" />
              </span>
            ) : (
              <>
                Next Chapter
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
