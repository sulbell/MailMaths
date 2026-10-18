import { useState, useEffect, useCallback, useRef } from 'react';

// Types
type GameState = 'menu' | 'levelSelect' | 'playing' | 'result';
type Character = 'fox' | 'rabbit' | 'bear' | 'owl';

interface Question {
  text: string;
  answer: number;
  options: number[];
  type: 'multiplication' | 'division' | 'word';
}

interface LevelConfig {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionsNeeded: number;
}

const LEVELS: LevelConfig[] = [
  { id: 1, name: 'Starter Routes', description: 'Tables 1-5', icon: '🛵', color: 'from-green-400 to-emerald-500', questionsNeeded: 10 },
  { id: 2, name: 'City Express', description: 'Tables 6-8', icon: '🚲', color: 'from-blue-400 to-indigo-500', questionsNeeded: 10 },
  { id: 3, name: 'Mountain Pass', description: 'Tables 9-12', icon: '🚀', color: 'from-purple-400 to-pink-500', questionsNeeded: 10 },
  { id: 4, name: 'Word Wizard', description: 'Word Problems', icon: '🧙', color: 'from-orange-400 to-red-500', questionsNeeded: 10 },
  { id: 5, name: 'Grand Champion', description: 'All Mixed Up!', icon: '👑', color: 'from-yellow-400 to-amber-500', questionsNeeded: 15 },
];

const CHARACTERS: { id: Character; name: string; emoji: string }[] = [
  { id: 'fox', name: 'Felix', emoji: '🦊' },
  { id: 'rabbit', name: 'Ruby', emoji: '🐰' },
  { id: 'bear', name: 'Bruno', emoji: '🐻' },
  { id: 'owl', name: 'Olivia', emoji: '🦉' },
];

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>([correctAnswer]);
  let attempts = 0;
  
  while (options.size < 4 && attempts < 50) {
    attempts++;
    const offset = randomInt(1, Math.max(5, Math.floor(correctAnswer * 0.4)));
    const wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset);
    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }
  
  // Fallback if we couldn't generate enough unique options
  let fallback = 1;
  while (options.size < 4) {
    if (!options.has(fallback) && fallback !== correctAnswer) {
      options.add(fallback);
    }
    fallback++;
  }
  
  return shuffleArray(Array.from(options));
}

function generateQuestion(level: number): Question {
  let a: number, b: number, answer: number, text: string, type: 'multiplication' | 'division' | 'word';

  switch (level) {
    case 1:
      a = randomInt(2, 5);
      b = randomInt(2, 12);
      answer = a * b;
      text = `${a} × ${b}`;
      type = 'multiplication';
      break;
    case 2:
      a = randomInt(6, 8);
      b = randomInt(2, 12);
      answer = a * b;
      text = `${a} × ${b}`;
      type = 'multiplication';
      break;
    case 3:
      a = randomInt(9, 12);
      b = randomInt(2, 12);
      answer = a * b;
      text = `${a} × ${b}`;
      type = 'multiplication';
      break;
    case 4:
      return generateWordProblem();
    case 5: {
      const choice = Math.random();
      if (choice < 0.3) {
        a = randomInt(2, 5);
        b = randomInt(2, 12);
        answer = a * b;
        text = `${a} × ${b}`;
        type = 'multiplication';
      } else if (choice < 0.55) {
        a = randomInt(6, 8);
        b = randomInt(2, 12);
        answer = a * b;
        text = `${a} × ${b}`;
        type = 'multiplication';
      } else if (choice < 0.8) {
        a = randomInt(9, 12);
        b = randomInt(2, 12);
        answer = a * b;
        text = `${a} × ${b}`;
        type = 'multiplication';
      } else {
        return generateWordProblem();
      }
      break;
    }
    default:
      a = randomInt(2, 12);
      b = randomInt(2, 12);
      answer = a * b;
      text = `${a} × ${b}`;
      type = 'multiplication';
  }

  const options = generateOptions(answer);
  return { text, answer, options, type };
}

function generateWordProblem(): Question {
  const templates = [
    () => {
      const a = randomInt(2, 12);
      const b = randomInt(2, 8);
      const items = ['apples', 'cookies', 'stickers', 'marbles', 'candies', 'toys'];
      const item = items[randomInt(0, items.length - 1)];
      return {
        text: `There are ${a} bags with ${b} ${item} each. How many ${item} in total?`,
        answer: a * b,
        type: 'word' as const,
      };
    },
    () => {
      const a = randomInt(2, 12);
      const b = randomInt(2, 6);
      return {
        text: `A box has ${a} rows of ${b} chocolates. How many chocolates in the box?`,
        answer: a * b,
        type: 'word' as const,
      };
    },
    () => {
      const b = randomInt(2, 12);
      const answer = randomInt(2, 10);
      const total = answer * b;
      return {
        text: `${total} stickers shared equally among ${b} kids. How many does each kid get?`,
        answer,
        type: 'word' as const,
      };
    },
    () => {
      const a = randomInt(3, 10);
      const b = randomInt(2, 5);
      return {
        text: `A farmer has ${a} fields with ${b} animals each. How many animals total?`,
        answer: a * b,
        type: 'word' as const,
      };
    },
    () => {
      const answer = randomInt(2, 12);
      const b = randomInt(2, 9);
      const total = answer * b;
      return {
        text: `${total} books packed into ${b} equal boxes. How many books per box?`,
        answer,
        type: 'word' as const,
      };
    },
    () => {
      const a = randomInt(2, 12);
      const b = randomInt(2, 10);
      return {
        text: `A truck makes ${a} trips carrying ${b} packages each. Total packages delivered?`,
        answer: a * b,
        type: 'word' as const,
      };
    },
    () => {
      const a = randomInt(4, 12);
      const b = randomInt(2, 6);
      return {
        text: `${a} children each bring ${b} pencils. How many pencils altogether?`,
        answer: a * b,
        type: 'word' as const,
      };
    },
    () => {
      const a = randomInt(3, 12);
      const b = randomInt(3, 9);
      return {
        text: `A garden has ${a} rows of ${b} flowers. How many flowers in the garden?`,
        answer: a * b,
        type: 'word' as const,
      };
    },
  ];

  const template = templates[randomInt(0, templates.length - 1)];
  const problem = template();
  const options = generateOptions(problem.answer);
  return { text: problem.text, answer: problem.answer, options, type: problem.type };
}

const MAX_TIME = 10;

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>('fox');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
  const [highScores, setHighScores] = useState<Record<number, number>>({});
  const [shake, setShake] = useState(false);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emojiIdRef = useRef(0);
  const isTransitioning = useRef(false);

  // Load saved progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mathMessenger_progress');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.highScores) setHighScores(data.highScores);
        if (data.unlockedLevels) setUnlockedLevels(data.unlockedLevels);
        if (data.totalDeliveries) setTotalDeliveries(data.totalDeliveries);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save progress
  const saveProgress = useCallback((scores: Record<number, number>, levels: number[], deliveries: number) => {
    localStorage.setItem('mathMessenger_progress', JSON.stringify({
      highScores: scores,
      unlockedLevels: levels,
      totalDeliveries: deliveries,
    }));
  }, []);

  const currentLevelRef = useRef(currentLevel);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && !showFeedback && !isTransitioning.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up
            if (timerRef.current) clearInterval(timerRef.current);
            isTransitioning.current = true;
            setShowFeedback('wrong');
            setStreak(0);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            
            setTimeout(() => {
              setShowFeedback(null);
              setSelectedAnswer(null);
              
              const newAnswered = answeredRef.current + 1;
              setQuestionsAnswered(newAnswered);
              
              const level = currentLevelRef.current;
              const levelConfig = LEVELS.find(l => l.id === level)!;
              if (newAnswered >= levelConfig.questionsNeeded) {
                // End game on timeout
                const finalCorrect = correctRef.current;
                const finalScore = scoreRef.current;
                const finalAccuracy = newAnswered > 0 ? (finalCorrect / newAnswered) * 100 : 0;
                
                const newHighScores = { ...highScores };
                if (!newHighScores[level] || finalScore > newHighScores[level]) {
                  newHighScores[level] = finalScore;
                  setHighScores(newHighScores);
                }
                
                const newUnlocked = [...unlockedLevels];
                if (finalAccuracy >= 60 && level < 5 && !newUnlocked.includes(level + 1)) {
                  newUnlocked.push(level + 1);
                }
                setUnlockedLevels(newUnlocked);
                
                const newTotal = totalDeliveries + finalCorrect;
                setTotalDeliveries(newTotal);
                saveProgress(newHighScores, newUnlocked, newTotal);
                
                setGameState('result');
                isTransitioning.current = false;
              } else {
                setCurrentQuestion(generateQuestion(level));
                setTimeLeft(MAX_TIME);
                isTransitioning.current = false;
              }
            }, 1500);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, showFeedback]);

  const startGame = (level: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentLevel(level);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setTimeLeft(MAX_TIME);
    setShowFeedback(null);
    setSelectedAnswer(null);
    isTransitioning.current = false;
    setGameState('playing');
    setCurrentQuestion(generateQuestion(level));
  };

  // Use refs to track latest state for the timeout callback
  const scoreRef = useRef(score);
  const correctRef = useRef(correctAnswers);
  const answeredRef = useRef(questionsAnswered);
  const streakRef = useRef(streak);
  
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { correctRef.current = correctAnswers; }, [correctAnswers]);
  useEffect(() => { answeredRef.current = questionsAnswered; }, [questionsAnswered]);
  useEffect(() => { streakRef.current = streak; }, [streak]);

  const handleAnswer = (answer: number) => {
    if (showFeedback || !currentQuestion || isTransitioning.current) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    isTransitioning.current = true;
    setSelectedAnswer(answer);
    
    const isCorrect = answer === currentQuestion.answer;
    const newAnswered = answeredRef.current + 1;
    setQuestionsAnswered(newAnswered);
    
    let newScore = scoreRef.current;
    let newCorrect = correctRef.current;
    let newStreak = streakRef.current;
    
    if (isCorrect) {
      const timeBonus = Math.ceil(timeLeft * 2);
      const streakBonus = streakRef.current * 5;
      const points = 10 + timeBonus + streakBonus;
      
      newScore += points;
      newCorrect += 1;
      newStreak += 1;
      
      setScore(newScore);
      setCorrectAnswers(newCorrect);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setShowFeedback('correct');
      
      // Add floating emoji
      const emoji = ['⭐', '🎉', '✨', '💫', '🌟', '🎊'][randomInt(0, 5)];
      const newEmoji = { id: emojiIdRef.current++, emoji, x: randomInt(20, 80), y: randomInt(20, 60) };
      setFloatingEmojis(prev => [...prev, newEmoji]);
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
      }, 2000);
    } else {
      newStreak = 0;
      setStreak(0);
      setShowFeedback('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    
    setTimeout(() => {
      setShowFeedback(null);
      setSelectedAnswer(null);
      
      const levelConfig = LEVELS.find(l => l.id === currentLevel)!;
      if (newAnswered >= levelConfig.questionsNeeded) {
        // End game - calculate final stats
        const finalAccuracy = newAnswered > 0 ? (newCorrect / newAnswered) * 100 : 0;
        
        // Update high scores
        const newHighScores = { ...highScores };
        if (!newHighScores[currentLevel] || newScore > newHighScores[currentLevel]) {
          newHighScores[currentLevel] = newScore;
          setHighScores(newHighScores);
        }
        
        // Unlock next level
        const newUnlocked = [...unlockedLevels];
        if (finalAccuracy >= 60 && currentLevel < 5) {
          if (!newUnlocked.includes(currentLevel + 1)) {
            newUnlocked.push(currentLevel + 1);
            setUnlockedLevels(newUnlocked);
          }
        }
        setUnlockedLevels(newUnlocked);
        
        const newTotalDeliveries = totalDeliveries + newCorrect;
        setTotalDeliveries(newTotalDeliveries);
        saveProgress(newHighScores, newUnlocked, newTotalDeliveries);
        
        setGameState('result');
        isTransitioning.current = false;
      } else {
        setCurrentQuestion(generateQuestion(currentLevel));
        setTimeLeft(MAX_TIME);
        isTransitioning.current = false;
      }
    }, 1200);
  };

  // ==================== MENU SCREEN ====================
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500 flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {/* Floating clouds */}
        <div className="absolute top-10 left-10 text-6xl animate-float-slow opacity-70">☁️</div>
        <div className="absolute top-20 right-20 text-5xl animate-float-slower opacity-60">☁️</div>
        <div className="absolute top-40 left-1/3 text-4xl animate-float-slow opacity-50">☁️</div>
        <div className="absolute bottom-32 left-20 text-3xl animate-float-slower opacity-40">☁️</div>
        
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in z-10">
          <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>📦</div>
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-3 tracking-tight">
            Math Messenger
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium max-w-md mx-auto">
            It's a small planet, but someone's gotta deliver the math! 🌍
          </p>
        </div>

        {/* Character Selection */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-6 w-full max-w-md z-10">
          <h2 className="text-lg font-bold text-white text-center mb-4">🎭 Choose Your Courier</h2>
          <div className="grid grid-cols-4 gap-3">
            {CHARACTERS.map(char => (
              <button
                key={char.id}
                onClick={() => setSelectedCharacter(char.id)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all transform hover:scale-110 ${
                  selectedCharacter === char.id
                    ? 'bg-white shadow-lg scale-105 ring-4 ring-yellow-300'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              >
                <span className="text-4xl mb-1">{char.emoji}</span>
                <span className="text-xs font-bold text-white">{char.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-8 flex gap-8 z-10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalDeliveries}</div>
            <div className="text-xs text-white/80">📦 Deliveries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Object.keys(highScores).length}/5</div>
            <div className="text-xs text-white/80">🏆 Routes Done</div>
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={() => setGameState('levelSelect')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xl md:text-2xl px-10 py-5 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 animate-pulse-slow z-10"
        >
          🚀 START DELIVERING!
        </button>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-10 text-5xl animate-bounce" style={{ animationDuration: '3s' }}>📦</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-bounce" style={{ animationDuration: '2.5s' }}>📬</div>
        <div className="absolute bottom-5 right-1/3 text-3xl animate-bounce" style={{ animationDuration: '4s' }}>✉️</div>
        <div className="absolute top-1/3 right-5 text-4xl animate-float-slow">🌍</div>
      </div>
    );
  }

  // ==================== LEVEL SELECT SCREEN ====================
  if (gameState === 'levelSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 flex flex-col items-center p-4 overflow-hidden relative">
        <div className="absolute top-5 left-5 text-4xl animate-float-slow opacity-60">⭐</div>
        <div className="absolute top-10 right-10 text-3xl animate-float-slower opacity-50">✨</div>
        <div className="absolute bottom-10 left-10 text-3xl animate-float-slow opacity-40">🌟</div>
        
        <button
          onClick={() => setGameState('menu')}
          className="self-start bg-white/30 text-white font-bold px-5 py-2 rounded-full mb-4 hover:bg-white/50 transition z-10"
        >
          ← Back
        </button>

        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 text-center z-10">🗺️ Select Your Route</h2>
        <p className="text-white/80 mb-6 text-center z-10">Score 60%+ to unlock the next route!</p>

        <div className="grid gap-4 w-full max-w-md z-10">
          {LEVELS.map((level) => {
            const isUnlocked = unlockedLevels.includes(level.id);
            const highScore = highScores[level.id];
            
            return (
              <button
                key={level.id}
                onClick={() => isUnlocked && startGame(level.id)}
                disabled={!isUnlocked}
                className={`relative p-5 rounded-2xl text-left transition-all transform ${
                  isUnlocked
                    ? `bg-gradient-to-r ${level.color} hover:scale-105 active:scale-95 shadow-lg`
                    : 'bg-gray-500/50 cursor-not-allowed grayscale'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{isUnlocked ? level.icon : '🔒'}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      Level {level.id}: {level.name}
                    </h3>
                    <p className="text-white/80 text-sm">{level.description} • {level.questionsNeeded} questions</p>
                    {highScore !== undefined && (
                      <p className="text-yellow-200 text-sm font-bold mt-1">
                        ⭐ Best: {highScore} pts
                      </p>
                    )}
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {isUnlocked ? '▶' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== PLAYING SCREEN ====================
  if (gameState === 'playing' && currentQuestion) {
    const levelConfig = LEVELS.find(l => l.id === currentLevel)!;
    const char = CHARACTERS.find(c => c.id === selectedCharacter)!;
    const progress = (questionsAnswered / levelConfig.questionsNeeded) * 100;

    return (
      <div className={`min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-green-50 flex flex-col p-4 relative overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        {/* Floating emojis */}
        {floatingEmojis.map(e => (
          <FloatingEmoji key={e.id} emoji={e.emoji} x={e.x} y={e.y} />
        ))}

        {/* Background decorations */}
        <div className="absolute top-5 right-5 text-4xl opacity-20 animate-float-slow">☁️</div>
        <div className="absolute bottom-20 left-5 text-3xl opacity-15 animate-float-slower">☁️</div>

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-3 z-10">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{char.emoji}</span>
            <div>
              <div className="text-sm font-bold text-gray-700">💎 {score}</div>
              {streak > 1 && (
                <div className="text-xs text-orange-500 font-bold animate-pulse">
                  🔥 {streak}x Streak!
                </div>
              )}
            </div>
          </div>
          <div className="text-center bg-white/60 rounded-full px-4 py-1">
            <div className="text-sm font-bold text-gray-600">
              {levelConfig.icon} Level {currentLevel}
            </div>
            <div className="text-xs text-gray-500">
              {questionsAnswered + 1}/{levelConfig.questionsNeeded}
            </div>
          </div>
          <button
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); isTransitioning.current = false; setGameState('levelSelect'); }}
            className="bg-white/80 text-gray-600 font-bold w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-white transition shadow"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3 shadow-inner z-10">
          <div
            className={`h-full bg-gradient-to-r ${levelConfig.color} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timer */}
        <div className="mb-4 z-10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-gray-600">⏰ Time Left</span>
            <span className={`text-xl font-black ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
              {timeLeft}s
            </span>
          </div>
          <TimerBar timeLeft={timeLeft} maxTime={MAX_TIME} />
        </div>

        {/* Question Area */}
        <div className={`flex-1 flex flex-col items-center justify-center ${showFeedback === 'correct' ? 'animate-correct' : showFeedback === 'wrong' ? 'animate-wrong' : ''} z-10`}>
          {/* Delivery character animation */}
          <div className="mb-4 relative">
            <div className="text-5xl animate-truck">{char.emoji}</div>
            <div className="absolute -top-3 -right-4 text-2xl animate-bounce" style={{ animationDuration: '1.5s' }}>📦</div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm text-center mb-6 border-4 border-blue-100 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-100 to-transparent rounded-bl-3xl"></div>
            
            <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
              {currentQuestion.type === 'word' ? '📝 Word Problem' : '🔢 Quick Math'}
            </p>
            <p className="text-xl md:text-2xl font-black text-gray-800 leading-relaxed">
              {currentQuestion.text}
            </p>
            {currentQuestion.type !== 'word' && (
              <p className="text-2xl text-gray-300 mt-2 font-bold">= ?</p>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = 'bg-white hover:bg-blue-50 text-gray-800 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-blue-100';
              
              if (showFeedback) {
                if (option === currentQuestion.answer) {
                  btnClass = 'bg-green-400 text-white scale-105 ring-4 ring-green-200 shadow-lg';
                } else if (option === selectedAnswer && option !== currentQuestion.answer) {
                  btnClass = 'bg-red-400 text-white ring-4 ring-red-200';
                } else {
                  btnClass = 'bg-gray-100 text-gray-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback !== null}
                  className={`p-4 rounded-2xl text-2xl font-black transition-all transform active:scale-90 ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Overlay */}
        {showFeedback && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className={`text-8xl ${showFeedback === 'correct' ? 'animate-bounce' : 'animate-shake'}`}>
              {showFeedback === 'correct' ? '✅' : '❌'}
            </div>
          </div>
        )}

        {/* Bottom delivery dots */}
        <div className="mt-4 flex justify-center gap-1.5 flex-wrap z-10">
          {Array.from({ length: levelConfig.questionsNeeded }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < questionsAnswered
                  ? i < correctAnswers
                    ? 'bg-green-400 shadow-sm shadow-green-300'
                    : 'bg-red-300'
                  : i === questionsAnswered
                  ? 'bg-blue-400 animate-pulse scale-125'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ==================== RESULT SCREEN ====================
  if (gameState === 'result') {
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    const passed = accuracy >= 60;
    const char = CHARACTERS.find(c => c.id === selectedCharacter)!;

    return (
      <div className={`min-h-screen bg-gradient-to-b ${passed ? 'from-green-300 via-emerald-200 to-blue-200' : 'from-orange-200 via-yellow-200 to-amber-200'} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        {/* Celebration particles */}
        {passed && Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl animate-float-up"
            style={{
              left: `${5 + (i * 6)}%`,
              top: `${70 + (i % 3) * 10}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${2 + (i % 3)}s`,
              animationIterationCount: 'infinite',
            }}
          >
            {['⭐', '🎉', '✨', '🌟', '🎊', '💫', '🎈', '🎁'][i % 8]}
          </div>
        ))}

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center z-10">
          {/* Character */}
          <div className="mb-3">
            <span className="text-7xl animate-bounce" style={{ animationDuration: '2s' }}>{char.emoji}</span>
          </div>

          {/* Result Title */}
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            {passed ? '🎉 Delivery Complete!' : '📦 Keep Practicing!'}
          </h2>
          <p className="text-gray-600 mb-5">
            {passed
              ? 'Amazing job, courier! All packages delivered safely!'
              : 'Don\'t give up! Practice makes perfect! 💪'}
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className={`text-5xl transition-all ${i <= stars ? 'animate-bounce opacity-100' : 'opacity-20 grayscale'}`}
                style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1.5s' }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-blue-600">{score}</div>
              <div className="text-xs text-gray-500 font-medium">💎 Points</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-green-600">{accuracy}%</div>
              <div className="text-xs text-gray-500 font-medium">🎯 Accuracy</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-purple-600">{correctAnswers}/{questionsAnswered}</div>
              <div className="text-xs text-gray-500 font-medium">✅ Correct</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-orange-600">{bestStreak}x</div>
              <div className="text-xs text-gray-500 font-medium">🔥 Best Streak</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => startGame(currentLevel)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg py-4 rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-lg"
            >
              🔄 Try Again
            </button>
            {passed && currentLevel < 5 && (
              <button
                onClick={() => startGame(currentLevel + 1)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg py-4 rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-lg"
              >
                ➡️ Next Level
              </button>
            )}
            <button
              onClick={() => setGameState('levelSelect')}
              className="bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-200 transition"
            >
              🗺️ Level Select
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="text-gray-500 font-medium py-2 hover:text-gray-700 transition text-sm"
            >
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ==================== SUB-COMPONENTS ====================

function TimerBar({ timeLeft, maxTime }: { timeLeft: number; maxTime: number }) {
  const percentage = (timeLeft / maxTime) * 100;
  const color = percentage > 50 ? 'bg-green-400' : percentage > 25 ? 'bg-yellow-400' : 'bg-red-500';
  
  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-linear`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function FloatingEmoji({ emoji, x, y }: { emoji: string; x: number; y: number }) {
  return (
    <div
      className="fixed text-4xl pointer-events-none animate-float-up z-50"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {emoji}
    </div>
  );
}
