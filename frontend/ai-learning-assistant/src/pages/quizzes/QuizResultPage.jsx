import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

import quizService from '../../services/quizService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

import { ArrowLeft, CheckCircle2, XCircle, Trophy, Target, BookOpen } from 'lucide-react'

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, SetResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        SetResults(data);
      } catch (error) {
        toast.error('Failed to fetch quiz results.');
        // console.error(error);
      } finally {
        setLoading(false)
      }
    };

    fetchResults()
  }, [quizId])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <div className='text-center'>
          <p className='text-slate-600 text-lg'>
            Quiz results not found.
          </p>
        </div>
      </div>
    );
  }

  const { data: { quiz, results: detailedResults } } = results;
  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter(r => r.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Outstanding! ';
    if (score >= 80) return 'Great job! ';
    if (score >= 70) return 'Good work! ';
    if (score >= 60) return 'No bad! ';
    return 'Keep practicing! ';
  };

  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
      {/* Back Button */}
      <div className='mb-6'>
        <Link
          to={`/documents/${quiz.document._id}`}
          className='group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200'
        >
          <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200' strokeWidth={2} />
          Back to Document
        </Link>
      </div>

      <PageHeader title={`${quiz.title || 'Quiz'} - Results`} />

      {/* Score Card */}
      <div className='glass-strong border-2 border-stone-200 rounded-2xl shadow-warm-lg p-6 sm:p-8 lg:p-10 mb-8'>
        <div className='text-center space-y-4 sm:space-y-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-primary/10 shadow-glow-primary'>
            <Trophy className='w-8 h-8 sm:w-9 sm:h-9 text-primary' strokeWidth={2} />
          </div>

          <div>
            <p className='text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 font-sans'>
              Your Score
            </p>

            <div className={`inline-block text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent mb-3`}>
              {score}%
            </div>
            <p className='text-lg sm:text-xl font-semibold text-foreground'>
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Stats */}
          <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4'>
            <div className='flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-stone-50 border border-stone-200 rounded-xl'>
              <Target className='w-4 h-4 sm:w-5 sm:h-5 text-stone-600' strokeWidth={2} />
              <span className='text-sm sm:text-base font-semibold text-stone-700'>
                {totalQuestions} Total
              </span>
            </div>
            <div className='flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary/10 border border-primary/20 rounded-xl'>
              <CheckCircle2 className='w-4 h-4 sm:w-5 sm:h-5 text-primary' strokeWidth={2} />
              <span className='text-sm sm:text-base font-semibold text-primary'>
                {correctAnswers} Correct
              </span>
            </div>
            <div className='flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-destructive/10 border border-destructive/20 rounded-xl'>
              <XCircle className='w-4 h-4 sm:w-5 sm:h-5 text-destructive' strokeWidth={2} />
              <span className='text-sm sm:text-base font-semibold text-destructive'>
                {incorrectAnswers} Incorrect
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className='space-y-4 sm:space-y-6'>
        <div className='flex items-center gap-3 mb-4'>
          <BookOpen className='w-5 h-5 sm:w-6 sm:h-6 text-primary' strokeWidth={2} />
          <h3 className='text-xl sm:text-2xl font-bold text-foreground'>
            Detailed Review
          </h3>
        </div>

        {detailedResults.map((result, index) => {
          const userAnswerIndex = result.options.findIndex(opt => opt === result.selectedAnswer);

          let correctAnswerIndex = -1;
          const parsedIndex = parseInt(result.correctAnswer);

          if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < result.options.length) {
            correctAnswerIndex = parsedIndex;
          } else {
            correctAnswerIndex = result.options.findIndex(opt => opt === result.correctAnswer);
          }

          const isCorrect = result.isCorrect;

          return (
            <div
              key={index}
              className='glass border-2 border-stone-200 rounded-2xl shadow-warm p-5 sm:p-6'
            >
              <div className='flex items-start justify-between gap-4 mb-4'>
                <div className='flex-1'>
                  <div className='inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-50 border border-stone-200 rounded-lg mb-3'>
                    <span className='text-xs sm:text-sm font-bold text-stone-600 font-sans'>
                      Question {index + 1}
                    </span>
                  </div>
                  <h4 className='text-base sm:text-lg font-bold text-foreground leading-relaxed'>
                    {result.question}
                  </h4>
                </div>

                <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center
                  ${isCorrect
                    ? 'bg-primary/10 border-2 border-primary/30'
                    : 'bg-destructive/10 border-2 border-destructive/30'
                  }`}>
                  {isCorrect ? (
                    <CheckCircle2 className='w-5 h-5 sm:w-6 sm:h-6 text-primary' strokeWidth={2.5} />
                  ) : (
                    <XCircle className='w-5 h-5 sm:w-6 sm:h-6 text-destructive' strokeWidth={2.5} />
                  )}
                </div>
              </div>

              <div className='space-y-2.5 sm:space-y-3 mb-5'>
                {result.options.map((option, optIndex) => {
                  const isCorrectOption = optIndex === correctAnswerIndex;
                  const isUserAnswer = optIndex === userAnswerIndex;
                  const isWrongAnswer = isUserAnswer && !isCorrect;

                  return (
                    <div
                      key={optIndex}
                      className={`relative px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 transition-all duration-200
                        ${isCorrectOption
                          ? 'bg-primary/5 border-primary/30 shadow-warm'
                          : isWrongAnswer
                            ? 'bg-destructive/5 border-destructive/30'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <span className={`text-sm sm:text-base font-medium
                          ${isCorrectOption
                            ? 'text-primary font-semibold'
                            : isWrongAnswer
                              ? 'text-destructive font-semibold'
                              : 'text-foreground'
                          }`}>
                          {option}
                        </span>

                        <div className='flex items-center gap-2'>
                          {isCorrectOption && (
                            <span className='inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/30 rounded-lg text-xs sm:text-sm font-bold text-primary'>
                              <CheckCircle2 className='w-3 h-3 sm:w-3.5 sm:h-3.5' strokeWidth={2.5} />
                              Correct
                            </span>
                          )}

                          {isWrongAnswer && !isCorrectOption && (
                            <span className='inline-flex items-center gap-1 px-2.5 py-1 bg-destructive/10 border border-destructive/30 rounded-lg text-xs sm:text-sm font-bold text-destructive'>
                              <XCircle className='w-3 h-3 sm:w-3.5 sm:h-3.5' strokeWidth={2.5} />
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className='p-4 sm:p-5 bg-gradient-to-br from-stone-50 to-stone-100/50 border border-stone-200 rounded-xl'>
                  <div className='flex items-start gap-3'>
                    <div className='shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-200 flex items-center justify-center mt-0.5'>
                      <BookOpen className='w-4 h-4 sm:w-5 sm:h-5 text-stone-600' strokeWidth={2} />
                    </div>

                    <div className='flex-1'>
                      <p className='text-xs sm:text-sm font-bold text-stone-600 uppercase tracking-wider mb-2 font-sans'>
                        Explanation
                      </p>
                      <p className='text-sm sm:text-base text-stone-700 leading-relaxed'>
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className='mt-8 flex justify-center'>
        <Link
          to={`/documents/${quiz.document._id}`}
          state={{ activeTab: 'Quizzes' }}
        >
          <button className='group relative px-6 sm:px-8 h-12 sm:h-14 gradient-primary hover:shadow-glow-primary text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-200 shadow-warm active:scale-95 overflow-hidden'>
            <span className='relative z-10 flex items-center gap-2.5'>
              <ArrowLeft className='w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200' strokeWidth={2.5} />
              Return to Document
            </span>
            <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
          </button>
        </Link>
      </div>
    </div>
  )
}

export default QuizResultPage