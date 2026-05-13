import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "tests" | "quiz" | "results";

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

interface Quiz {
  id: number;
  title: string;
  subject: string;
  grade: string;
  questions: Question[];
  timeLimit: number;
}

interface Result {
  id: number;
  quizTitle: string;
  subject: string;
  score: number;
  total: number;
  timeSpent: number;
  date: string;
}

const QUIZZES: Quiz[] = [
  {
    id: 1,
    title: "Алгебра: уравнения",
    subject: "Математика",
    grade: "7 класс",
    timeLimit: 120,
    questions: [
      { id: 1, text: "Решите уравнение: 2x + 6 = 14", options: ["x = 3", "x = 4", "x = 5", "x = 10"], correct: 1 },
      { id: 2, text: "Чему равно x в уравнении: 3x − 9 = 0?", options: ["x = 0", "x = 3", "x = 6", "x = 9"], correct: 1 },
      { id: 3, text: "Найдите x: 5(x − 2) = 15", options: ["x = 1", "x = 3", "x = 5", "x = 7"], correct: 2 },
      { id: 4, text: "Решите: x/4 = 3", options: ["x = 3/4", "x = 7", "x = 12", "x = 16"], correct: 2 },
      { id: 5, text: "Чему равно x: 2x + 3 = x + 7?", options: ["x = 2", "x = 4", "x = 5", "x = 10"], correct: 1 },
    ],
  },
  {
    id: 2,
    title: "Части речи",
    subject: "Русский язык",
    grade: "5 класс",
    timeLimit: 90,
    questions: [
      { id: 1, text: "К какой части речи относится слово «бежать»?", options: ["Существительное", "Прилагательное", "Глагол", "Наречие"], correct: 2 },
      { id: 2, text: "Что обозначает имя существительное?", options: ["Действие предмета", "Предмет", "Признак предмета", "Количество"], correct: 1 },
      { id: 3, text: "«Красивый» — это...", options: ["Глагол", "Наречие", "Прилагательное", "Существительное"], correct: 2 },
      { id: 4, text: "Какое слово является наречием?", options: ["Быстрый", "Быстро", "Быстрота", "Быстрить"], correct: 1 },
      { id: 5, text: "«Я, ты, он» — это...", options: ["Существительные", "Местоимения", "Глаголы", "Союзы"], correct: 1 },
    ],
  },
  {
    id: 3,
    title: "Великие открытия",
    subject: "История",
    grade: "6 класс",
    timeLimit: 150,
    questions: [
      { id: 1, text: "В каком году Колумб открыл Америку?", options: ["1488", "1492", "1498", "1504"], correct: 1 },
      { id: 2, text: "Кто первым совершил кругосветное путешествие?", options: ["Колумб", "Васко да Гама", "Магеллан", "Дрейк"], correct: 2 },
      { id: 3, text: "Что открыл Васко да Гама?", options: ["Америку", "Морской путь в Индию", "Австралию", "Антарктиду"], correct: 1 },
      { id: 4, text: "В каком веке произошли великие географические открытия?", options: ["XIII–XIV", "XIV–XV", "XV–XVI", "XVI–XVII"], correct: 2 },
      { id: 5, text: "Кто финансировал экспедицию Колумба?", options: ["Португалия", "Испания", "Англия", "Нидерланды"], correct: 1 },
    ],
  },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [lastResult, setLastResult] = useState<Result | null>(null);

  const finishQuiz = useCallback(
    (finalAnswers: (number | null)[], remainingTime: number) => {
      if (!activeQuiz) return;
      const score = finalAnswers.filter(
        (a, i) => a === activeQuiz.questions[i]?.correct
      ).length;
      const timeSpent = activeQuiz.timeLimit - remainingTime;
      const result: Result = {
        id: Date.now(),
        quizTitle: activeQuiz.title,
        subject: activeQuiz.subject,
        score,
        total: activeQuiz.questions.length,
        timeSpent,
        date: new Date().toLocaleDateString("ru-RU"),
      };
      setResults((prev) => [result, ...prev]);
      setLastResult(result);
      setQuizFinished(true);
    },
    [activeQuiz]
  );

  useEffect(() => {
    if (page !== "quiz" || quizFinished) return;
    if (timeLeft <= 0) {
      const all = [...answers];
      all[currentQ] = selected;
      finishQuiz(all, 0);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [page, timeLeft, quizFinished, finishQuiz, answers, currentQ, selected]);

  function startQuiz(quiz: Quiz) {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setSelected(null);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setTimeLeft(quiz.timeLimit);
    setQuizFinished(false);
    setLastResult(null);
    setPage("quiz");
  }

  function nextQuestion() {
    if (!activeQuiz) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);
    setSelected(null);
    if (currentQ + 1 >= activeQuiz.questions.length) {
      finishQuiz(newAnswers, timeLeft);
    } else {
      setCurrentQ((q) => q + 1);
    }
  }

  const isUrgent = timeLeft <= 30 && timeLeft > 0 && !quizFinished;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setPage("home")}
            className="font-display text-xl font-semibold text-foreground tracking-tight"
          >
            КнаниеТест
          </button>
          <div className="flex items-center gap-1">
            {(["home", "tests", "results"] as const).map((p) => {
              const labels = { home: "Главная", tests: "Тесты", results: "Результаты" };
              const icons = { home: "House", tests: "BookOpen", results: "BarChart3" };
              const isActive = page === p || (page === "quiz" && p === "tests");
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon name={icons[p]} size={15} />
                  <span className="hidden sm:inline">{labels[p]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="animate-fade-in">
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">
              Образовательная платформа
            </p>
            <h1 className="font-display text-6xl md:text-7xl font-semibold leading-tight text-foreground mb-6">
              Проверь<br />
              <em className="italic font-normal">свои знания</em>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
              Тесты по основным школьным предметам с таймером. Отслеживай прогресс и улучшай результаты.
            </p>
            <button
              onClick={() => setPage("tests")}
              className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity"
            >
              Начать тестирование
              <Icon name="ArrowRight" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-20">
            {[
              { label: "Тестов доступно", value: "3", icon: "BookOpen" },
              { label: "Вопросов в среднем", value: "5", icon: "HelpCircle" },
              { label: "Пройдено тестов", value: String(results.length), icon: "CheckCircle" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
                <Icon name={s.icon} size={20} className="text-accent mb-3" />
                <div className="text-3xl font-bold font-display text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUIZZES.map((q) => (
              <button
                key={q.id}
                onClick={() => startQuiz(q)}
                className="text-left bg-card border border-border rounded-2xl p-5 hover:border-foreground transition-all hover:-translate-y-0.5 animate-fade-in group"
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">{q.subject} · {q.grade}</div>
                <div className="font-semibold text-foreground text-sm mb-3">{q.title}</div>
                <div className="flex items-center gap-1 text-xs text-accent font-medium group-hover:gap-2 transition-all">
                  Пройти <Icon name="ArrowRight" size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TESTS */}
      {page === "tests" && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-fade-in">
            <h2 className="font-display text-4xl font-semibold text-foreground mb-2">Доступные тесты</h2>
            <p className="text-muted-foreground mb-8">Выбери тему и проверь свои знания</p>
          </div>
          <div className="grid gap-4">
            {QUIZZES.map((quiz, i) => (
              <div
                key={quiz.id}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in hover:border-foreground transition-all"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {quiz.subject}
                    </span>
                    <span className="text-xs text-muted-foreground">{quiz.grade}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{quiz.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="HelpCircle" size={13} />
                      {quiz.questions.length} вопросов
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={13} />
                      {formatTime(quiz.timeLimit)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => startQuiz(quiz)}
                  className="shrink-0 bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  Начать
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUIZ */}
      {page === "quiz" && activeQuiz && (
        <div className="max-w-2xl mx-auto px-6 py-10">
          {!quizFinished ? (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {activeQuiz.subject}
                  </p>
                  <p className="font-semibold text-foreground">{activeQuiz.title}</p>
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-all ${
                    isUrgent
                      ? "bg-red-100 text-red-600 animate-timer-pulse"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <Icon name="Clock" size={16} className={isUrgent ? "text-red-500" : "text-muted-foreground"} />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="flex gap-1.5 mb-8">
                {activeQuiz.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i < currentQ ? "bg-foreground" : i === currentQ ? "bg-accent" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              <div className="mb-8">
                <p className="text-xs text-muted-foreground font-medium mb-3">
                  Вопрос {currentQ + 1} из {activeQuiz.questions.length}
                </p>
                <h2 className="font-display text-2xl font-semibold text-foreground leading-snug">
                  {activeQuiz.questions[currentQ].text}
                </h2>
              </div>

              <div className="grid gap-3 mb-8">
                {activeQuiz.questions[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all hover:border-foreground ${
                      selected === i
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${
                        selected === i
                          ? "bg-background/20 text-background"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={nextQuestion}
                disabled={selected === null}
                className="w-full bg-foreground text-background py-3.5 rounded-xl font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-all"
              >
                {currentQ + 1 === activeQuiz.questions.length ? "Завершить тест" : "Следующий вопрос"}
                <Icon name="ArrowRight" size={15} className="inline ml-2" />
              </button>
            </div>
          ) : (
            lastResult && (
              <div className="animate-scale-in text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary mb-6">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {Math.round((lastResult.score / lastResult.total) * 100)}%
                  </span>
                </div>
                <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
                  {lastResult.score >= lastResult.total * 0.8
                    ? "Отличный результат!"
                    : lastResult.score >= lastResult.total * 0.5
                    ? "Хороший результат"
                    : "Можно лучше"}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {lastResult.score} из {lastResult.total} правильных · {formatTime(lastResult.timeSpent)} затрачено
                </p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: "Правильно", value: String(lastResult.score), icon: "CheckCircle" },
                    { label: "Неверно", value: String(lastResult.total - lastResult.score), icon: "XCircle" },
                    { label: "Время", value: formatTime(lastResult.timeSpent), icon: "Clock" },
                  ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                      <Icon name={s.icon} size={16} className="text-muted-foreground mx-auto mb-1" />
                      <div className="font-bold text-foreground text-xl font-display">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => startQuiz(activeQuiz)}
                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
                  >
                    <Icon name="RotateCcw" size={15} />
                    Пройти снова
                  </button>
                  <button
                    onClick={() => setPage("tests")}
                    className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-border transition-colors"
                  >
                    <Icon name="BookOpen" size={15} />
                    Другой тест
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* RESULTS */}
      {page === "results" && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-fade-in">
            <h2 className="font-display text-4xl font-semibold text-foreground mb-2">Результаты</h2>
            <p className="text-muted-foreground mb-8">История пройденных тестов</p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-24 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
                <Icon name="BarChart3" size={24} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Ты ещё не прошёл ни одного теста</p>
              <button
                onClick={() => setPage("tests")}
                className="mt-4 inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                Начать тестирование
                <Icon name="ArrowRight" size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { label: "Тестов пройдено", value: String(results.length), icon: "CheckCircle" },
                  {
                    label: "Средний балл",
                    value: Math.round((results.reduce((a, r) => a + r.score / r.total, 0) / results.length) * 100) + "%",
                    icon: "TrendingUp",
                  },
                  {
                    label: "Лучший результат",
                    value: Math.round(Math.max(...results.map((r) => r.score / r.total)) * 100) + "%",
                    icon: "Trophy",
                  },
                  {
                    label: "Всего вопросов",
                    value: String(results.reduce((a, r) => a + r.total, 0)),
                    icon: "HelpCircle",
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-2xl p-4 animate-fade-in">
                    <Icon name={s.icon} size={16} className="text-accent mb-2" />
                    <div className="text-2xl font-bold font-display text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                {results.map((r, i) => {
                  const pct = Math.round((r.score / r.total) * 100);
                  return (
                    <div
                      key={r.id}
                      className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 animate-fade-in"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-display text-sm shrink-0 ${
                          pct >= 80
                            ? "bg-green-100 text-green-700"
                            : pct >= 50
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {pct}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{r.quizTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.score}/{r.total} верных · {formatTime(r.timeSpent)} · {r.date}
                        </p>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{r.subject}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
