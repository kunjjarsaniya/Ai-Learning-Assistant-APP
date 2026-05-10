import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, CheckCircle2 } from 'lucide-react';
import quizService from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

const QuizTakePage = () => {

  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        if (response.data.completedAt) {
          toast.success('You have already completed this quiz.');
          navigate(`/quizzes/${quizId}/results`);
          return;
        }
        setQuiz(response.data);
      } catch (error) {
        toast.error('Failed to fetch quiz.');
        // console.error(error);
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [quizId])

  const handleOptionChange = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);

    try {
      const formattedAnswers = Object.keys(selectedAnswers).map((questionId) => {
        const question = quiz.questions.find((q) => q._id === questionId);
        const questionIndex = quiz.questions.findIndex((q) => q._id === questionId);
        const optionIndex = selectedAnswers[questionId];
        const selectedAnswer = question.options[optionIndex];
        return { questionIndex, selectedAnswer };
      });

      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success('Quiz submitted successfully.');
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner />
      </div>
    )
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <div className='text-center'>
          <p className='text-slate-600 text-lg'>
            Quiz not found or has no questions.
          </p>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers.hasOwnProperty(currentQuestion._id);
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className='max-w-4xl mx-auto'>
      <PageHeader title={quiz.title || 'Take Quiz'} />

      {/* Progress Bar */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-sm font-semibold text-slate-700'>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className='text-sm font-semibold text-slate-500'>
            {answeredCount} answered
          </span>
        </div>

        <div className='relative h-2 bg-stone-200 rounded-full overflow-hidden'>
          <div
            className='absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-in-out'
            style={{
              width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`
            }}
          >
          </div>
        </div>

        {/* Question Card */}
        <div className='bg-card border-2 border-border rounded-2xl shadow-warm-lg p-6 mb-8'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl mb-6'>
            <div className='w-2 h-2 bg-primary rounded-full animate-pulse' />
            <span className='text-sm font-semibold text-primary'>
              Question {currentQuestionIndex + 1}
            </span>
          </div>

          <h3 className='text-lg font-semibold text-slate-900 mb-6 leading-relaxed'>
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className='space-y-3'>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion._id] === index;
              return (
                <label
                  key={index}
                  className={`group relative flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 
                      ${isSelected
                      ? 'bg-primary/5 border-primary shadow-sm shadow-primary/10'
                      : 'border-border bg-background hover:border-primary/40 hover:bg-card hover:shadow-md'
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={index}
                    checked={isSelected}
                    onChange={() => handleOptionChange(currentQuestion._id, index)}
                    className='sr-only'
                  />

                  {/* Custom Radio Button */}
                  <div className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                      ${isSelected
                      ? 'border-primary bg-primary'
                      : 'border-stone-300 bg-background group-hover:border-primary/50'
                    }`}>
                    {isSelected && (
                      <div className='w-2 h-2 bg-primary-foreground rounded-full' />
                    )}
                  </div>

                  {/* Option Text */}
                  <span className={`ml-4 text-sm font-medium transition-colors duration-200 
                    ${isSelected
                      ? 'text-primary'
                      : 'text-foreground group-hover:text-foreground'
                    }`}>
                    {option}
                  </span>

                  {/* Selected Checkmark */}
                  {isSelected && (
                    <CheckCircle2
                      className='ml-auto w-5 h-5 text-primary'
                      strokeWidth={2.5}
                    />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className='flex items-center justify-between gap-4'>
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || submitting}
            variant='secondary'
          >
            <ChevronLeft className='w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200' strokeWidth={2.5} />
            Previous
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className='group relative px-8 h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm rounded-xl transition-all duration-200 shadow-warm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden'
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                {submitting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='w-4 h-4' strokeWidth={2.5} />
                    Submit Quiz
                  </>
                )}
              </span>
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={submitting}
            >
              Next
              <ChevronRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Question Navigation Dots */}
        <div className='mt-0 flex items-center justify-center gap-2 flex-wrap'>
          {quiz.questions.map((_, index) => {
            const isAnsweredQuestion = selectedAnswers.hasOwnProperty(quiz.questions[index]._id);
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                disabled={submitting}
                className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200 ${isCurrent
                  ? 'bg-primary text-primary-foreground shadow-warm scale-110'
                  : isAnsweredQuestion
                    ? 'bg-primary/20 text-primary hover:bg-primary/30'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  )
}

export default QuizTakePage