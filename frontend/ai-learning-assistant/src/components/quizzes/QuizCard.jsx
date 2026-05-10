import React from 'react'
import { Link } from 'react-router-dom'
import { Play, BarChart2, Trash2, Award } from 'lucide-react'
import moment from 'moment'

const QuizCard = ({ quiz, onDelete }) => {
    return (
        <div className='group relative bg-card border-2 border-border hover:border-primary rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-glow-primary flex flex-col justify-between min-h-[280px]'>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(quiz)
                }}
                className='absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'
            >
                <Trash2 className='w-4 h-4' strokeWidth={2.5} />
            </button>

            <div className='space-y-3 sm:space-y-4'>
                {/* Status Badge */}
                <div className='inline-flex items-center gap-1.5 py-1 rounded-lg text-xs sm:text-sm font-semibold'>
                    <div className='flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5'>
                        <Award className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary' strokeWidth={2.5} />
                        <span className='text-primary'>Score: {quiz?.score || 0}</span>
                    </div>
                </div>

                {/* Quiz Name */}
                <div>
                    <h3
                        className='text-lg sm:text-xl font-bold text-foreground mb-1.5 line-clamp-2'
                        title={quiz.title}
                    >
                        {quiz.title ||
                            `Quiz - ${moment(quiz.createdAt).format('DD MMM YYYY')}`}
                    </h3>
                    <p className='text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide font-sans'>
                        CREATED {moment(quiz.createdAt).format('DD MMM YYYY')}
                    </p>
                </div>

                {/* Quiz Info */}
                <div className='flex items-center gap-3 pt-2 border-t border-border'>
                    <div className='px-3 sm:px-4 py-1.5 sm:py-2 bg-background border border-border rounded-lg'>
                        <span className='text-sm sm:text-base font-semibold text-foreground'>
                            {quiz.questions.length}{" "}
                            {quiz.questions.length === 1 ? "Question" : "Questions"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className='mt-2 pt-4 border-t border-border'>
                {quiz?.completedAt || quiz?.userAnswer?.length > 0 ? (
                    <Link to={`/quizzes/${quiz._id || quiz.id}/results`} className='w-full block'>
                        <button className='group/btn relative w-full h-12 sm:h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base sm:text-lg rounded-xl transition-all duration-200 shadow-warm active:scale-95 overflow-hidden'>
                            <span className='relative z-10 flex items-center justify-center gap-2.5'>
                                <BarChart2 className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={2.5} />
                                View Results
                            </span>
                        </button>
                    </Link>
                ) : (
                    <Link to={`/quizzes/${quiz._id || quiz.id}`} className='w-full block'>
                        <button className='group/btn relative w-full h-12 sm:h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base sm:text-lg rounded-xl transition-all duration-200 shadow-warm active:scale-95 overflow-hidden'>
                            <span className='relative z-10 flex items-center justify-center gap-2.5'>
                                <Play className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={2.5} />
                                Start Quiz
                            </span>
                        </button>
                    </Link>
                )}
            </div>
        </div>
    )
}

export default QuizCard