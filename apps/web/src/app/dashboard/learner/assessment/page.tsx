"use client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface LearnerQuestion {
  id: string;
  subject: string;
  questionText: string;
  type: "multiple_choice" | "picture_choice";
  options: { label: string; value: string; emoji?: string }[];
  difficulty: number;
  correctAnswer: string;
}

const LEARNER_ASSESSMENT_SUBJECTS = [
  { key: "math", label: "Math", color: "#7C3AED", emoji: "🔢" },
  { key: "ela", label: "Reading", color: "#10B981", emoji: "📖" },
  { key: "science", label: "Science", color: "#F59E0B", emoji: "🔬" },
];

const LEARNER_QUESTIONS: LearnerQuestion[] = [
  { id: "m1", subject: "math", questionText: "What is 3 + 4?", type: "multiple_choice", options: [{ label: "5", value: "5" }, { label: "6", value: "6" }, { label: "7", value: "7", emoji: "🌟" }, { label: "8", value: "8" }], difficulty: 1, correctAnswer: "7" },
  { id: "m2", subject: "math", questionText: "What is 8 - 3?", type: "multiple_choice", options: [{ label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5", emoji: "🌟" }, { label: "6", value: "6" }], difficulty: 1, correctAnswer: "5" },
  { id: "m3", subject: "math", questionText: "What is 6 x 2?", type: "multiple_choice", options: [{ label: "8", value: "8" }, { label: "10", value: "10" }, { label: "12", value: "12", emoji: "🌟" }, { label: "14", value: "14" }], difficulty: 2, correctAnswer: "12" },
  { id: "m4", subject: "math", questionText: "Which shape has 4 equal sides?", type: "multiple_choice", options: [{ label: "Triangle", value: "triangle" }, { label: "Square", value: "square", emoji: "🌟" }, { label: "Circle", value: "circle" }, { label: "Pentagon", value: "pentagon" }], difficulty: 1, correctAnswer: "square" },
  { id: "m5", subject: "math", questionText: "What comes next: 2, 4, 6, 8, __?", type: "multiple_choice", options: [{ label: "9", value: "9" }, { label: "10", value: "10", emoji: "🌟" }, { label: "11", value: "11" }, { label: "12", value: "12" }], difficulty: 2, correctAnswer: "10" },
  { id: "m6", subject: "math", questionText: "What is half of 10?", type: "multiple_choice", options: [{ label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5", emoji: "🌟" }, { label: "6", value: "6" }], difficulty: 2, correctAnswer: "5" },

  { id: "e1", subject: "ela", questionText: "Which word rhymes with 'cat'?", type: "multiple_choice", options: [{ label: "Dog", value: "dog" }, { label: "Hat", value: "hat", emoji: "🌟" }, { label: "Sun", value: "sun" }, { label: "Cup", value: "cup" }], difficulty: 1, correctAnswer: "hat" },
  { id: "e2", subject: "ela", questionText: "What is the opposite of 'big'?", type: "multiple_choice", options: [{ label: "Tall", value: "tall" }, { label: "Small", value: "small", emoji: "🌟" }, { label: "Wide", value: "wide" }, { label: "Fast", value: "fast" }], difficulty: 1, correctAnswer: "small" },
  { id: "e3", subject: "ela", questionText: "Which sentence is correct?", type: "multiple_choice", options: [{ label: "The cat sitted on the mat.", value: "a" }, { label: "The cat sat on the mat.", value: "b", emoji: "🌟" }, { label: "The cat sit on the mat.", value: "c" }, { label: "The cat setting on the mat.", value: "d" }], difficulty: 2, correctAnswer: "b" },
  { id: "e4", subject: "ela", questionText: "What is a noun?", type: "multiple_choice", options: [{ label: "An action word", value: "action" }, { label: "A describing word", value: "describing" }, { label: "A person, place, or thing", value: "person_place_thing", emoji: "🌟" }, { label: "A connecting word", value: "connecting" }], difficulty: 2, correctAnswer: "person_place_thing" },
  { id: "e5", subject: "ela", questionText: "Which word means the same as 'happy'?", type: "multiple_choice", options: [{ label: "Sad", value: "sad" }, { label: "Angry", value: "angry" }, { label: "Joyful", value: "joyful", emoji: "🌟" }, { label: "Tired", value: "tired" }], difficulty: 1, correctAnswer: "joyful" },
  { id: "e6", subject: "ela", questionText: "What comes at the end of a question?", type: "multiple_choice", options: [{ label: "Period (.)", value: "period" }, { label: "Exclamation mark (!)", value: "exclamation" }, { label: "Question mark (?)", value: "question", emoji: "🌟" }, { label: "Comma (,)", value: "comma" }], difficulty: 1, correctAnswer: "question" },

  { id: "s1", subject: "science", questionText: "What do plants need to grow?", type: "multiple_choice", options: [{ label: "Only water", value: "water" }, { label: "Sunlight, water, and soil", value: "all", emoji: "🌟" }, { label: "Only soil", value: "soil" }, { label: "Only sunlight", value: "sunlight" }], difficulty: 1, correctAnswer: "all" },
  { id: "s2", subject: "science", questionText: "Which is a living thing?", type: "multiple_choice", options: [{ label: "Rock", value: "rock" }, { label: "Water", value: "water" }, { label: "Tree", value: "tree", emoji: "🌟" }, { label: "Cloud", value: "cloud" }], difficulty: 1, correctAnswer: "tree" },
  { id: "s3", subject: "science", questionText: "What is the closest star to Earth?", type: "multiple_choice", options: [{ label: "The Moon", value: "moon" }, { label: "The Sun", value: "sun", emoji: "🌟" }, { label: "Mars", value: "mars" }, { label: "Polaris", value: "polaris" }], difficulty: 2, correctAnswer: "sun" },
  { id: "s4", subject: "science", questionText: "What are the three states of matter?", type: "multiple_choice", options: [{ label: "Hot, cold, warm", value: "temp" }, { label: "Solid, liquid, gas", value: "states", emoji: "🌟" }, { label: "Big, medium, small", value: "size" }, { label: "Red, blue, green", value: "color" }], difficulty: 2, correctAnswer: "states" },
  { id: "s5", subject: "science", questionText: "What force keeps us on the ground?", type: "multiple_choice", options: [{ label: "Wind", value: "wind" }, { label: "Magnetism", value: "magnetism" }, { label: "Gravity", value: "gravity", emoji: "🌟" }, { label: "Electricity", value: "electricity" }], difficulty: 2, correctAnswer: "gravity" },
  { id: "s6", subject: "science", questionText: "Which animal is a mammal?", type: "multiple_choice", options: [{ label: "Snake", value: "snake" }, { label: "Fish", value: "fish" }, { label: "Dog", value: "dog", emoji: "🌟" }, { label: "Frog", value: "frog" }], difficulty: 1, correctAnswer: "dog" },
];

export default function LearnerAssessmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [scores, setScores] = useState<Record<string, { correct: number; total: number }>>({});

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const currentSubject = LEARNER_ASSESSMENT_SUBJECTS[currentSubjectIdx];
  const subjectQuestions = LEARNER_QUESTIONS.filter(q => q.subject === currentSubject?.key);
  const question = subjectQuestions[currentQuestionIdx];

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = LEARNER_QUESTIONS.length;

  const selectAnswer = (questionId: string, value: string, correct: string) => {
    if (answers[questionId]) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setShowResult(value === correct);

    setTimeout(() => {
      setShowResult(null);
      if (currentQuestionIdx < subjectQuestions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else if (currentSubjectIdx < LEARNER_ASSESSMENT_SUBJECTS.length - 1) {
        setCurrentSubjectIdx(currentSubjectIdx + 1);
        setCurrentQuestionIdx(0);
      } else {
        const finalScores: Record<string, { correct: number; total: number }> = {};
        for (const sub of LEARNER_ASSESSMENT_SUBJECTS) {
          const qs = LEARNER_QUESTIONS.filter(q => q.subject === sub.key);
          const correct = qs.filter(q => answers[q.id] === q.correctAnswer || (q.id === questionId && value === q.correctAnswer)).length;
          finalScores[sub.key] = { correct, total: qs.length };
        }
        setScores(finalScores);
        setCompleted(true);
      }
    }, 1200);
  };

  if (loading || !user) return null;

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center max-w-md space-y-6">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Great Job!</h1>
          <p className="text-slate-500">You finished the assessment! Here are your results:</p>
          <div className="space-y-3">
            {LEARNER_ASSESSMENT_SUBJECTS.map(sub => {
              const score = scores[sub.key];
              if (!score) return null;
              const pct = Math.round((score.correct / score.total) * 100);
              return (
                <div key={sub.key} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: sub.color + "10" }}>
                  <span className="text-2xl">{sub.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-heading font-bold text-sm" style={{ color: sub.color }}>{sub.label}</p>
                    <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: sub.color }} />
                    </div>
                  </div>
                  <span className="font-bold text-sm" style={{ color: sub.color }}>{score.correct}/{score.total}</span>
                </div>
              );
            })}
          </div>
          <button onClick={() => router.push("/dashboard/learner")}
            className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary-dark transition shadow-lg shadow-purple-200">
            Start Learning!
          </button>
        </div>
      </div>
    );
  }

  if (!question || !currentSubject) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(135deg, ${currentSubject.color}08, white, ${currentSubject.color}05)` }}>
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={80} height={24} />
          <span className="font-heading font-bold text-sm text-slate-500">Baseline Assessment</span>
        </div>
        <span className="text-sm text-slate-400 font-semibold">{totalAnswered}/{totalQuestions}</span>
      </header>

      <div className="h-2 bg-slate-100">
        <div className="h-full transition-all duration-300 rounded-r-full" style={{ width: `${(totalAnswered / totalQuestions) * 100}%`, backgroundColor: currentSubject.color }} />
      </div>

      <div className="flex gap-3 justify-center py-4">
        {LEARNER_ASSESSMENT_SUBJECTS.map((sub, idx) => {
          const isCurrent = idx === currentSubjectIdx;
          const isDone = idx < currentSubjectIdx;
          return (
            <div key={sub.key}
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${
                isCurrent ? "text-white shadow-md" : isDone ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
              }`}
              style={isCurrent ? { backgroundColor: sub.color } : undefined}>
              <span>{sub.emoji}</span>
              <span>{sub.label}</span>
              {isDone && <span>&#10003;</span>}
            </div>
          );
        })}
      </div>

      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 max-w-lg w-full space-y-6 relative">
          {showResult !== null && (
            <div className={`absolute inset-0 rounded-3xl flex items-center justify-center z-10 ${showResult ? "bg-green-50/90" : "bg-red-50/90"}`}>
              <div className="text-center">
                <span className="text-6xl">{showResult ? "🌟" : "💪"}</span>
                <p className="text-lg font-heading font-bold mt-2" style={{ color: showResult ? "#16a34a" : "#dc2626" }}>
                  {showResult ? "Correct!" : "Keep trying!"}
                </p>
              </div>
            </div>
          )}

          <div className="text-center">
            <span className="text-3xl">{currentSubject.emoji}</span>
            <p className="text-xs font-bold uppercase tracking-wider mt-2" style={{ color: currentSubject.color }}>
              {currentSubject.label} - Question {currentQuestionIdx + 1} of {subjectQuestions.length}
            </p>
          </div>

          <h2 className="text-xl font-heading font-bold text-slate-900 text-center leading-relaxed">
            {question.questionText}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {question.options.map(opt => {
              const isSelected = answers[question.id] === opt.value;
              const isCorrect = question.correctAnswer === opt.value;
              const hasAnswered = answers[question.id] !== undefined;

              let borderColor = "#e2e8f0";
              let bgColor = "white";
              if (hasAnswered && isSelected && isCorrect) { borderColor = "#16a34a"; bgColor = "#f0fdf4"; }
              else if (hasAnswered && isSelected && !isCorrect) { borderColor = "#dc2626"; bgColor = "#fef2f2"; }
              else if (hasAnswered && isCorrect) { borderColor = "#16a34a"; bgColor = "#f0fdf4"; }

              return (
                <button key={opt.value}
                  onClick={() => selectAnswer(question.id, opt.value, question.correctAnswer)}
                  disabled={hasAnswered}
                  className="px-4 py-4 rounded-2xl border-2 text-sm font-bold transition hover:scale-[1.02] disabled:hover:scale-100"
                  style={{ borderColor, backgroundColor: bgColor, color: hasAnswered && isCorrect ? "#16a34a" : "#334155" }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
