import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Cpu, Sliders, PlayCircle } from 'lucide-react';
import { generateAIQuiz } from '../../services/api';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

/**
 * AI Quiz Generator modal wizard
 */
export default function QuestionGenerator({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('Python');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  const topics = ['Python', 'JavaScript', 'Math', 'History', 'Science'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      // Call backend express AI generation endpoint
      const response = await generateAIQuiz(topic, difficulty, count);
      if (response && response.success && response.data) {
        toast.success("AI Quiz successfully compiled! 🧠⚡");
        
        // Close modal and redirect using the returned customId
        const newQuiz = response.data;
        onClose();
        navigate(`/quiz/${newQuiz.id}`);
      } else {
        throw new Error("AI generation response failed");
      }
    } catch (err) {
      console.error("Failed to generate custom quiz via backend:", err);
      toast.error("AI quiz compiler experienced a timeout. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✦ AI Custom Quiz Compiler" maxWidth="max-w-md">
      {generating ? (
        // AI Generating Shimmer Loader
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="relative h-20 w-20 mb-6 flex items-center justify-center bg-purple-500/10 rounded-full border border-purple-500/35 shadow-[0_0_24px_rgba(139,92,246,0.2)] animate-pulse">
            <Cpu className="h-10 w-10 text-accent animate-spin-slow" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-purple-400 fill-purple-400 animate-bounce" />
          </div>
          <h4 className="font-headings font-bold text-lg text-text mb-2 animate-pulse">
            ✦ AI is generating your quiz...
          </h4>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Structuring custom questions, fabricating incorrect distractors, and drafting thorough conceptual insights...
          </p>
          <div className="w-48 bg-surface-2 h-1.5 rounded-full overflow-hidden mt-6 relative border border-border">
            <div className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full animate-shimmer shimmer-bg w-full" />
          </div>
        </div>
      ) : (
        // Input settings
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-4 bg-purple-950/15 border border-purple-500/15 p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl" />
            <div className="flex items-center space-x-2 text-xs font-bold text-accent">
              <Sparkles className="h-4 w-4 fill-accent" />
              <span>POWERED BY SMARTPREP AI</span>
            </div>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Design a fully customized, instant exam-prep quiz. Choose a topic, adjust the difficulty tier, and our AI compiler will draft custom question vectors with in-depth mnemonics.
            </p>
          </div>

          {/* Topic Select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
              1. Select Topic
            </label>
            <div className="grid grid-cols-3 gap-2">
              {topics.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                    topic === t
                      ? 'bg-accent/15 border-accent text-accent shadow-md shadow-accent/5'
                      : 'bg-surface-2/30 border-border text-text-muted hover:text-text hover:bg-surface-2/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
              2. Select Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((d) => {
                let activeStyle = 'bg-primary/15 border-primary text-primary';
                if (d === 'Medium') activeStyle = 'bg-secondary/15 border-secondary text-secondary';
                if (d === 'Hard') activeStyle = 'bg-danger/15 border-danger text-danger';

                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      difficulty === d
                        ? activeStyle
                        : 'bg-surface-2/30 border-border text-text-muted hover:text-text hover:bg-surface-2/60'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase tracking-wider">
              <span>3. Questions Count</span>
              <span className="text-text bg-surface-2 px-2 py-0.5 rounded border border-border">{count} Qs</span>
            </div>
            <div className="flex items-center space-x-4 pt-1">
              <span className="text-xs text-text-muted">3</span>
              <input
                type="range"
                min="3"
                max="10"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="flex-1 accent-accent h-1.5 bg-surface-2 rounded-full cursor-pointer"
              />
              <span className="text-xs text-text-muted">10</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border/40">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-accent to-purple-600 text-white font-bold py-3.5 px-6 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg hover:shadow-accent/20"
            >
              <Sparkles className="h-5 w-5 fill-white animate-bounce" />
              <span>Compile AI Quiz</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
