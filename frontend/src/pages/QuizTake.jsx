import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Bookmark, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { getQuizById, submitQuiz as submitQuizAPI } from '../services/api';
import { getProfile, saveProfile } from '../services/storage';
import { useTimer } from '../hooks/useTimer';
import { useAdaptiveDifficulty } from '../hooks/useAdaptiveDifficulty';
import { formatTime } from '../utils/validation';

import Timer from '../components/quiz/Timer';
import ProgressBar from '../components/quiz/ProgressBar';
import QuestionCard from '../components/quiz/QuestionCard';
import QuestionPalette from '../components/quiz/QuestionPalette';
import Modal from '../components/common/Modal';
import AdaptiveDifficulty from '../components/ai/AdaptiveDifficulty';

export default function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // idx -> selected option index
  const [flagged, setFlagged] = useState([]); // Array of flagged indexes
  
  // Dialog Open States
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);
  const [adaptiveOpen, setAdaptiveOpen] = useState(false);
  const [adaptiveDetails, setAdaptiveDetails] = useState({ suggestion: 'Easy', type: 'low' });

  // Record elapsed starting time
  const [startTime, setStartTime] = useState(Date.now());

  // 1. Fetch Quiz on Mount from Backend API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await getQuizById(id);
        if (response && response.success && response.data) {
          setQuiz(response.data);
          setStartTime(Date.now());
        } else {
          toast.error("Quiz not found!");
          navigate('/');
        }
      } catch (err) {
        console.error("Failed to load quiz details:", err);
        toast.error("Error loading quiz details from MongoDB.");
        navigate('/');
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  // 2. Setup Timer Hook (triggers submit automatically on expire)
  const handleAutoSubmit = () => {
    submitQuiz(true); // force submit
  };

  const timerDuration = quiz ? quiz.duration : 600;
  const { timeLeft, formattedTime, isWarning, stopTimer } = useTimer(
    timerDuration,
    handleAutoSubmit
  );

  // 3. Setup Adaptive Difficulty Tracker Hook
  const { recordAnswer } = useAdaptiveDifficulty(quiz?.difficulty || 'Medium');

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="animate-pulse font-headings font-bold text-lg text-primary">
          ✦ Loading Quiz Platform from MongoDB...
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];

  const handleSelectAnswer = (optionIdx) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));

    // Evaluate answer correctness on-the-fly inside memory
    // and record to our adaptive difficulty tracker!
    const isCorrect = optionIdx === currentQuestion.correctAnswer;
    
    // Call rolling hook tracking
    recordAnswer(isCorrect);
  };

  const handleToggleFlag = () => {
    setFlagged(prev => {
      if (prev.includes(currentIdx)) {
        return prev.filter(idx => idx !== currentIdx);
      } else {
        return [...prev, currentIdx];
      }
    });
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  // Badge award checking logic
  const handleBadgeUnlocks = (newAttempt) => {
    try {
      const profile = getProfile() || { unlockedBadges: [], lockedBadges: [] };
      const newlyUnlocked = [];

      // 1. Speedster: finished in < 2 minutes (120s) and score >= 80%
      if (newAttempt.timeTaken < 120 && newAttempt.score >= 80) {
        newlyUnlocked.push("Speedster ⚡");
      }

      // 2. Perfect Score: 100% score
      if (newAttempt.score === 100) {
        newlyUnlocked.push("Perfect Score 🏆");
      }

      // 3. AI Explorer: taken a custom quiz
      if (newAttempt.quizId.startsWith('custom-ai-')) {
        newlyUnlocked.push("AI Explorer 🤖");
      }

      if (newlyUnlocked.length > 0) {
        const unlockedSet = new Set([...profile.unlockedBadges, ...newlyUnlocked]);
        const lockedFiltered = profile.lockedBadges.filter(b => !unlockedSet.has(b));
        
        saveProfile({
          ...profile,
          unlockedBadges: Array.from(unlockedSet),
          lockedBadges: lockedFiltered
        });
      }
    } catch (e) {
      console.error("Failed to unlock badges:", e);
    }
  };

  // Submit Active quiz and calculate scores
  const submitQuiz = async (forced = false) => {
    stopTimer();

    // Grade scoring calculation
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const totalQuestions = quiz.questions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const timeSpent = Math.max(10, Math.round((Date.now() - startTime) / 1000));

    // Compile attempt database package
    const attempt = {
      userName: "Alex",
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: scorePercent,
      totalQuestions,
      correctCount,
      timeTaken: Math.min(quiz.duration, timeSpent),
      category: quiz.category,
      answers, // Save user selections
      analytics: {
        flaggedQuestions: flagged,
        startedAt: startTime,
        submittedAt: Date.now(),
        averageTimePerQuestion: Math.round(timeSpent / totalQuestions)
      }
    };

    try {
      const response = await submitQuizAPI(attempt);
      if (response && response.success && response.data) {
        toast.success("Quiz graded and saved to MongoDB successfully!");
        
        // Dynamic Badge award evaluations
        handleBadgeUnlocks(response.data);
        
        // Redirect to dynamic results page using MongoDB ObjectId
        navigate(`/result/${response.data._id}`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to submit quiz attempt to MongoDB:", err);
      toast.error("Database connection error. Quiz completed successfully but failed to persist.");
      navigate('/');
    }
  };

  const handlePromptSubmit = () => {
    setSubmitModalOpen(true);
  };

  const unansweredCount = quiz.questions.length - Object.keys(answers).length;

  const handleConfirmAdaptive = () => {
    setAdaptiveOpen(false);
    navigate(`/quizzes?category=${quiz.category}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-bg pb-20 select-none">
      
      {/* A. STICKY HEADER */}
      <header className="bg-surface border-b border-border sticky top-0 z-30 w-full shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Truncated Quiz Title */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to exit? Your current progress will be lost.")) {
                  navigate('/quizzes');
                }
              }}
              className="text-text-muted hover:text-white p-1 hover:bg-surface-2 rounded-xl transition-all"
              aria-label="Exit quiz taking"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-headings font-bold text-sm sm:text-base text-white truncate pr-2">
              {quiz.title}
            </h2>
          </div>

          {/* Question Indicator */}
          <div className="hidden sm:block text-xs font-bold text-text-muted bg-surface-2/40 px-3 py-1.5 rounded-full border border-border">
            Question <span className="text-white">{currentIdx + 1}</span> of {quiz.questions.length}
          </div>

          {/* Timer element */}
          <Timer formattedTime={formattedTime} isWarning={isWarning} timeLeft={timeLeft} />
        </div>

        {/* Global Progress Bar at absolute bottom of header */}
        <div className="w-full max-w-5xl mx-auto px-4 pb-1 bg-surface">
          <ProgressBar current={Object.keys(answers).length} total={quiz.questions.length} />
        </div>
      </header>

      {/* B. MAIN INTERACTIVE CARD LAYOUT */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 justify-center items-start">
        
        {/* Left/Center Side: Current Question Card */}
        <div className="flex-grow w-full max-w-3xl space-y-6">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIdx + 1}
            totalQuestions={quiz.questions.length}
            selectedAnswer={answers[currentIdx]}
            onSelectAnswer={handleSelectAnswer}
            isFlagged={flagged.includes(currentIdx)}
            onToggleFlag={handleToggleFlag}
          />

          {/* Desktop Footer Control Buttons */}
          <div className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between gap-4 shadow-md max-w-3xl w-full mx-auto">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex items-center space-x-1.5 border border-border px-5 py-3 rounded-xl text-xs font-bold text-text-muted hover:text-white hover:bg-surface-2/40 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Mobile/Toggle palette trigger */}
            <button
              onClick={() => setPaletteDrawerOpen(true)}
              className="lg:hidden bg-surface-2 border border-border px-4 py-3 rounded-xl text-xs font-bold text-white"
            >
              Question Map
            </button>

            {currentIdx === quiz.questions.length - 1 ? (
              <button
                onClick={handlePromptSubmit}
                className="flex items-center space-x-1.5 bg-primary text-white font-extrabold px-6 py-3 rounded-xl hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 hover:scale-105 transition-all animate-bounce-slow"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Quiz</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 bg-surface-2 border border-border px-5 py-3 rounded-xl text-xs font-bold text-white hover:bg-surface-2/80 hover:border-text-muted active:scale-95 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Persistent Question Palette (Desktop Only) */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28">
            <QuestionPalette
              questions={quiz.questions}
              currentQuestionIndex={currentIdx}
              onJumpToQuestion={setCurrentIdx}
              answers={answers}
              flaggedQuestions={flagged}
            />
          </div>
        </aside>
      </main>

      {/* C. DIALOG OVERLAY: MOBILE DRAWER BOTTOM SHEET */}
      {paletteDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setPaletteDrawerOpen(false)} />
          <div className="bg-surface border-t border-border rounded-t-3xl w-full p-6 z-10 space-y-4 shadow-2xl relative animate-page">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <span className="font-headings font-bold text-sm text-white">Quiz Question Navigator</span>
              <button onClick={() => setPaletteDrawerOpen(false)} className="text-text-muted hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <QuestionPalette
              questions={quiz.questions}
              currentQuestionIndex={currentIdx}
              onJumpToQuestion={(idx) => {
                setCurrentIdx(idx);
                setPaletteDrawerOpen(false);
              }}
              answers={answers}
              flaggedQuestions={flagged}
            />
          </div>
        </div>
      )}

      {/* D. DIALOG OVERLAY: CONFIRM SUBMIT MODAL */}
      <Modal isOpen={submitModalOpen} onClose={() => setSubmitModalOpen(false)} title="Submit Evaluation">
        <div className="space-y-4 text-center">
          <div className="h-14 w-14 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="h-8 w-8 animate-pulse" />
          </div>
          <h4 className="font-headings font-bold text-lg text-white">Ready to grade?</h4>
          
          {unansweredCount > 0 ? (
            <div className="bg-danger/10 border border-danger/25 p-4 rounded-xl text-xs text-red-400 font-semibold leading-relaxed flex items-start space-x-3 text-left">
              <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> You have <strong>{unansweredCount} unanswered</strong> question{unansweredCount > 1 ? 's' : ''} remaining in this session. Submitting will count them as incorrect.
              </span>
            </div>
          ) : (
            <p className="text-sm text-text-muted leading-relaxed">
              All questions have been evaluated. Click submit to compile your scores, review detailed AI explanations, and earn experience points!
            </p>
          )}

          <div className="pt-4 border-t border-border/60 flex gap-4">
            <button
              onClick={() => setSubmitModalOpen(false)}
              className="flex-1 py-3 border border-border text-text-muted font-bold text-sm rounded-xl hover:bg-surface-2 transition-colors"
            >
              Keep Taking
            </button>
            <button
              onClick={() => {
                setSubmitModalOpen(false);
                submitQuiz();
              }}
              className="flex-1 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              Grade Quiz
            </button>
          </div>
        </div>
      </Modal>

      {/* E. DIALOG OVERLAY: ADAPTIVE DIFFICULTY POPUP PANEL */}
      <AdaptiveDifficulty
        isOpen={adaptiveOpen}
        suggestion={adaptiveDetails.suggestion}
        type={adaptiveDetails.type}
        onConfirm={handleConfirmAdaptive}
        onClose={() => setAdaptiveOpen(false)}
      />
    </div>
  );
}
