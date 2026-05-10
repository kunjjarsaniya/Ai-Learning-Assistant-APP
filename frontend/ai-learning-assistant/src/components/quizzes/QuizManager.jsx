import React, { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import quizService from '../../services/quizService'
import aiService from '../../services/aiService'
import Spinner from '../common/Spinner'
import Button from '../common/Button'
import Model from '../common/Model'
import QuizCard from './QuizCard'

import EmptyState from '../common/EmptyState'

const QuizManager = ({ documentId }) => {

    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [isGenerateModelOpen, setIsGenerateModelOpen] = useState(false)
    const [numQuestions, setNumQuestions] = useState(5)

    const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState(null)

    const fetchQuizzes = async () => {
        setLoading(true)
        try {
            const data = await quizService.getQuizzesForDocument(documentId)
            setQuizzes(data.data)
        } catch (error) {
            toast.error('Failed to fetch quizzes')
            // console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (documentId) {
            fetchQuizzes()
        }
    }, [documentId])

    const handleGenerateQuiz = async (e) => {
        e.preventDefault()
        setGenerating(true)
        try {
            await aiService.generateQuiz(documentId, { numQuestions });
            toast.success('Quiz generated successfully')
            setIsGenerateModelOpen(false)
            fetchQuizzes()
        } catch (error) {
            toast.error(error.message || 'Failed to generate quiz')
            // console.error(error)
        } finally {
            setGenerating(false)
        }
    };

    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz)
        setIsDeleteModelOpen(true)
    };

    const handleConfirmDelete = async () => {
        if (!selectedQuiz) return
        setDeleting(true)

        try {
            await quizService.deleteQuiz(selectedQuiz._id || selectedQuiz.id)
            toast.success(`${selectedQuiz.title || 'Quiz'} deleted.`)
            setIsDeleteModelOpen(false)
            setSelectedQuiz(null)
            setQuizzes(quizzes.filter(q => (q._id || q.id) !== (selectedQuiz._id || selectedQuiz.id)))
        } catch (error) {
            toast.error(error.message || 'Failed to delete quiz')
            // console.error(error)
        } finally {
            setDeleting(false)
        }
    };

    const renderQuizContent = () => {
        if (loading) {
            return <Spinner />

        }
        if (quizzes.length === 0) {
            return (
                <EmptyState
                    title="No Quizzes Yet"
                    description="Generate a quiz from your document to test your knowledge."
                />
            );
        };

        return (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                {quizzes.map((quiz) => (
                    <QuizCard key={quiz._id || quiz.id} quiz={quiz} onDelete={handleDeleteRequest} />
                ))}
            </div>
        );
    };

    return (
        <div className='bg-card border-2 border-border rounded-2xl shadow-warm-lg p-4 sm:p-6 lg:p-8 min-h-[500px]'>
            <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-2 mb-6'>
                <div>
                    <h3 className='text-base sm:text-lg font-semibold text-foreground'>Your Quizzes</h3>
                    <p className='text-xs sm:text-sm text-muted-foreground mt-0.5 font-sans'>
                        {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} available
                    </p>
                </div>
                <Button onClick={() => setIsGenerateModelOpen(true)} className="w-full sm:w-auto" variant="primary">
                    <Plus size={16} />
                    Generate Quiz
                </Button>
            </div>

            {renderQuizContent()}

            {/* Generate Quizzed */}
            <Model
                isOpen={isGenerateModelOpen}
                onClose={() => setIsGenerateModelOpen(false)}
                title="Generate New Quiz"
            >
                <form onSubmit={handleGenerateQuiz} className='space-y-4 sm:space-y-6'>
                    <div>
                        <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 font-sans'>
                            Number of Questions
                        </label>
                        <input
                            type="number"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            required
                            className='w-full h-10 sm:h-11 px-3 sm:px-4 border-2 border-border rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-glow-primary'
                        />
                    </div>
                    <div className='flex flex-col sm:flex-row justify-end gap-3 pt-2'>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsGenerateModelOpen(false)}
                            disabled={generating}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={generating}
                            variant="primary"
                            className="flex-1 sm:flex-none"
                        >
                            {generating ? "Generating..." : "Generate Quiz"}
                        </Button>
                    </div>
                </form>
            </Model>

            {/* Delete Confirmation */}
            <Model
                isOpen={isDeleteModelOpen}
                onClose={() => setIsDeleteModelOpen(false)}
                title="Confirm Delete Quiz"
            >
                <div className='space-y-4 sm:space-y-6'>
                    <p className='text-xs sm:text-sm text-muted-foreground font-sans'>
                        Are you sure you want to delete this quiz: <span className='font-semibold text-foreground'>{selectedQuiz?.title || 'this quiz'}</span>? This action cannot be undone.
                    </p>

                    <div className='flex flex-col sm:flex-row justify-end gap-3 pt-2'>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsDeleteModelOpen(false)}
                            disabled={deleting}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            className='flex-1 sm:flex-none bg-destructive hover:bg-destructive/90 focus:ring-destructive'
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>

            </Model>
        </div>
    )
}

export default QuizManager