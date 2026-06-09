import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BookOpen, 
  Share2, 
  Home, 
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getQuizById, getResultById as getResultByIdAPI } from '../services/api';
import { calculateGrade } from '../utils/scoring';
import { formatTime } from '../utils/validation';

import ResultChart from '../components/results/ResultChart';
import ExplanationBot from '../components/results/ExplanationBot';
import TopicBreakdown from '../components/results/TopicBreakdown';
import QuestionCard from '../components/quiz/QuestionCard';

export default function QuizResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [gradeInfo, setGradeInfo] = useState(null);
  const [topicStats, setTopicStats] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({}); // idx -> boolean

  useEffect(() => {
    const loadAttemptDetails = async () => {
      try {
        // 1. Fetch Attempt Details from MongoDB API
        const attemptRes = await getResultByIdAPI(id);
        if (!attemptRes || !attemptRes.success || !attemptRes.data) {
          toast.error("Attempt result not found!");
          navigate('/');
          return;
        }

        const foundAttempt = attemptRes.data;
        setAttempt(foundAttempt);

        // 2. Fetch Associated Quiz from MongoDB API
        const quizRes = await getQuizById(foundAttempt.quizId);
        if (quizRes && quizRes.success && quizRes.data) {
          const foundQuiz = quizRes.data;
          setQuiz(foundQuiz);

          // 3. Compute Scoring Grade using utility
          const grade = calculateGrade(foundAttempt.score);
          setGradeInfo(grade);

          // 4. Group correctness statistics by subtopic safely
          const topicsMap = {};
          foundQuiz.questions.forEach((q, idx) => {
            const topic = q.topic || 'General';
            if (!topicsMap[topic]) {
              topicsMap[topic] = { topic, total: 0, correct: 0 };
            }
            topicsMap[topic].total += 1;
            
            const userSelection = foundAttempt.answers ? foundAttempt.answers[idx] : undefined;
            if (userSelection !== undefined && parseInt(userSelection) === q.correctAnswer) {
              topicsMap[topic].correct += 1;
            }
          });

          const processedTopics = Object.values(topicsMap).map(item => ({
            ...item,
            score: Math.round((item.correct / item.total) * 100)
          }));

          setTopicStats(processedTopics);
        } else {
          toast.error("Associated quiz details not found!");
          navigate('/');
        }
      } catch (err) {
        console.error("Failed to load result statistics:", err);
        toast.error("Error retrieving result data from database.");
        navigate('/');
      }
    };

    loadAttemptDetails();
  }, [id, navigate]);

  if (!attempt || !quiz || !gradeInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="animate-pulse text-primary font-bold text-lg">
          ✦ Analysing attempt results from MongoDB...
        </div>
      </div>
    );
  }

  // Circular gauge calculations
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attempt.score / 100) * circumference;

  // Toggle review table row details
  const toggleQuestionExpand = (idx) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Clipboard sharing text logic
  const handleShare = () => {
    const text = `I scored ${attempt.score}% (${gradeInfo.grade}) on "${attempt.quizTitle}" Quiz! Try it out at SmartPrep! 🔥`;
    navigator.clipboard.writeText(text);
    toast.success("Score copied to clipboard! 📋", {
      style: {
        background: '#1E293B',
        color: '#F1F5F9',
        border: '1px solid #10B981'
      }
    });
  };

  // Extract weak topics to direct Practice
  const handlePracticeWeakTopics = () => {
    navigate(`/quizzes?category=${quiz.category}`);
  };

  return (
    <div className="space-y-10 animate-page max-w-4xl mx-auto pb-12">
      
      {/* 1. SCORE HERO DISPLAY */}
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8 group">
        
        {/* Neon decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        
        {/* Left Circle Score Gauge */}
        <div className="relative h-32 w-32 md:h-40 md:w-40 flex items-center justify-center flex-shrink-0">
          <svg className="transform -rotate-90 w-32 h-32 md:w-40 md:w-40">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="stroke-surface-2 fill-transparent"
              strokeWidth="10"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className={`fill-transparent transition-all duration-1000 ${gradeInfo.textOnlyColor}`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl md:text-4xl font-extrabold text-text font-mono">{attempt.score}%</span>
            <span className="text-[10px] md:text-xs text-text-muted font-bold uppercase tracking-wider">Score</span>
          </div>
        </div>

        {/* Center / Right Scoring Details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
            <span className={`inline-flex items-center text-sm font-extrabold px-3 py-1 rounded-full border ${gradeInfo.colorClass}`}>
              Grade {gradeInfo.grade}
            </span>
            <h2 className="text-2xl font-headings font-bold text-text">
              {gradeInfo.message}
            </h2>
          </div>

          <p className="text-sm text-text-muted leading-relaxed max-w-xl">
            {gradeInfo.description}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 text-xs font-bold text-text-muted">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
              <span>{attempt.correctCount} / {attempt.totalQuestions} Correct</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4.5 w-4.5 text-secondary" />
              <span>{formatTime(attempt.timeTaken)} Taken</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <BookOpen className="h-4.5 w-4.5 text-cyan-400" />
              <span>{quiz.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOPIC PERFORMANCE ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Progress Bars by Topic */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-headings font-bold text-text tracking-wider uppercase pb-3 border-b border-border/40">
            Concept Mastery Breakdown
          </h3>
          <ResultChart data={topicStats} type="bar" />
        </div>

        {/* Right: Topic breakdowns details & CTA */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-headings font-bold text-text tracking-wider uppercase pb-3 border-b border-border/40">
              Diagnostic Gap Analysis
            </h3>
            <TopicBreakdown topicsData={topicStats} />
          </div>

          <button
            onClick={handlePracticeWeakTopics}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg hover:shadow-primary/20 mt-6"
          >
            <span>Practice Category Topics</span>
            <ArrowRight className="h-4.5 w-4.5 animate-bounce-slow" />
          </button>
        </div>
      </div>

      {/* 3. QUESTION REVIEW LEDGER TABLE */}
      <div className="space-y-6">
        <h3 className="text-xl font-headings font-bold text-text">
          Question-by-Question Review
        </h3>

        <div className="space-y-4">
          {quiz.questions.map((question, idx) => {
            const userAnswerIdx = attempt.answers ? attempt.answers[idx] : undefined;
            const isCorrect = userAnswerIdx !== undefined && parseInt(userAnswerIdx) === question.correctAnswer;
            const expanded = !!expandedQuestions[idx];

            return (
              <div 
                key={question._id || question.id}
                className={`bg-surface border rounded-2xl overflow-hidden shadow-md transition-all duration-300 ${
                  expanded ? 'border-border' : 'border-border/60 hover:border-border'
                }`}
              >
                {/* Collapsed Header trigger */}
                <div 
                  onClick={() => toggleQuestionExpand(idx)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-2/10 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-danger flex-shrink-0" />
                    )}
                    <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider bg-surface-2 px-2.5 py-1 rounded">
                      Q {idx + 1}
                    </span>
                    <span className="font-bold text-sm text-text truncate flex-1">
                      {question.questionText}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`hidden sm:inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${
                      isCorrect 
                        ? 'text-primary bg-primary/10 border-primary/20' 
                        : 'text-danger bg-danger/10 border-danger/20'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    {expanded ? <ChevronUp className="h-5 w-5 text-text-muted" /> : <ChevronDown className="h-5 w-5 text-text-muted" />}
                  </div>
                </div>

                {/* Expanded Card Body review */}
                {expanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-border/40 animate-page space-y-4 bg-surface-2/10">
                    <QuestionCard
                      question={question}
                      questionNumber={idx + 1}
                      totalQuestions={quiz.questions.length}
                      selectedAnswer={userAnswerIdx !== undefined ? parseInt(userAnswerIdx) : undefined}
                      onSelectAnswer={() => {}}
                      isFlagged={false}
                      onToggleFlag={() => {}}
                      reviewMode={true}
                      userAnswerIndex={userAnswerIdx !== undefined ? parseInt(userAnswerIdx) : undefined}
                      correctAnswerIndex={question.correctAnswer}
                    />

                    {/* AI ExplanationBot widget */}
                    <ExplanationBot 
                      question={question} 
                      correctAnswerText={question.options[question.correctAnswer]} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM ACTION ROW PANEL */}
      <div className="bg-surface border border-border p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <Link
          to="/"
          className="flex items-center justify-center space-x-1.5 border border-border px-5 py-3 rounded-xl text-xs font-bold text-text-muted hover:text-text hover:bg-surface-2/40 transition-all"
        >
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Share score */}
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-surface-2 border border-border px-5 py-3 rounded-xl text-xs font-bold text-text hover:bg-surface-2/80 active:scale-95 transition-all"
          >
            <Share2 className="h-4 w-4 text-accent" />
            <span>Share Score</span>
          </button>

          {/* Retake */}
          <Link
            to={`/quiz/${quiz.id}`}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-primary text-white font-extrabold px-6 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake Quiz</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
