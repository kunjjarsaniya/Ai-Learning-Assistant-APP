import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, Sparkles } from 'lucide-react'
import { useParams } from 'react-router-dom'
import aiService from '../../services/aiService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../common/Spinner'
import MarkdownRenderer from '../common/MarkdownRenderer'

const ChatInterface = () => {
    const { id: documentId } = useParams();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const messageEndRef = useRef(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setInitialLoading(true);
                const response = await aiService.getChatHistory(documentId);
                setHistory(response.data || []);
            } catch (error) {
                // console.error('Failed to fetch chat history:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchChatHistory();
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);


    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        setHistory((prev) => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await aiService.chat(documentId, userMessage.content);
            const assistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date(),
                relevateChunks: response.data.relevateChunks
            };

            setHistory((prev) => [...prev, assistantMessage]);
        } catch (error) {
            // console.error('Chat error:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setHistory((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (msg, index) => {
        const isUser = msg.role === 'user';
        return (
            <div
                key={index}
                className={`flex items-start gap-3 sm:gap-4 my-4 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                    <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-primary shadow-glow-primary flex items-center justify-center shrink-0'>
                        <Sparkles className='w-4 h-4 sm:w-5 sm:h-5 text-white' strokeWidth={2} />
                    </div>
                )}
                <div className={`max-w-[75%] sm:max-w-xl p-3 sm:p-4 rounded-2xl shadow-warm
                    ${isUser
                        ? 'gradient-primary text-white rounded-br-md'
                        : 'bg-card border border-stone-200 text-foreground rounded-bl-md'
                    }`}>
                    {isUser ? (
                        <p className='text-sm leading-relaxed'>{msg.content}</p>
                    ) : (
                        <div className='prose prose-sm max-w-none'>
                            <MarkdownRenderer content={msg.content} />
                        </div>
                    )}
                </div>
                {isUser && (
                    <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-700 font-semibold text-sm shrink-0 shadow-warm'>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </div>
        );
    };

    if (initialLoading) {
        return (
            <div className='flex flex-col h-[60vh] sm:h-[70vh] glass-strong border border-stone-200 rounded-2xl items-center justify-center shadow-warm-lg'>
                <div className='w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center'>
                    <MessageSquare className='w-7 h-7 text-primary' strokeWidth={2} />
                </div>
                <Spinner />
                <p className='text-sm text-muted-foreground mt-3 font-medium'>Loading chat history...</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col h-[500px] glass-strong border border-stone-200 rounded-2xl shadow-warm-lg overflow-hidden'>
            {/* Message Area */}
            <div className='flex-1 p-4 sm:p-6 overflow-y-auto bg-gradient-to-br from-stone-50/50 via-background/50 to-stone-50/50'>
                {history.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-center px-4'>
                        <div className='w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-glow-primary'>
                            <MessageSquare className='w-8 h-8 sm:w-9 sm:h-9 text-primary' strokeWidth={2} />
                        </div>
                        <h3 className='text-base sm:text-lg font-semibold text-foreground mb-2'>Start a conversation</h3>
                        <p className='text-sm sm:text-base text-muted-foreground'>Ask me anything about the document!</p>
                    </div>
                ) : (
                    history.map(renderMessage)
                )}
                <div ref={messageEndRef} />
                {loading && (
                    <div className='flex items-center gap-2 sm:gap-3 my-3 sm:my-4'>
                        <div className='w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-primary shadow-glow-primary flex items-center justify-center shrink-0'>
                            <Spinner className='w-8 h-8 sm:w-9 sm:h-9 text-white' strokeWidth={2} />
                        </div>
                        <div className='flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-md bg-card border border-stone-200'>
                            <div className='flex gap-1'>
                                <span className='w-2 h-2 rounded-full bg-stone-400 animate-bounce' style={{ animationDelay: '0ms' }}></span>
                                <span className='w-2 h-2 rounded-full bg-stone-400 animate-bounce' style={{ animationDelay: '150ms' }}></span>
                                <span className='w-2 h-2 rounded-full bg-stone-400 animate-bounce' style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className='p-3 sm:p-5 border-t border-stone-200 bg-card'>
                <form onSubmit={handleSendMessage} className='flex items-center gap-2 sm:gap-3'>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder='Ask a follow-up question...'
                        className='flex-1 h-10 sm:h-12 px-3 sm:px-4 border-2 border-stone-200 rounded-xl bg-stone-50/50 text-foreground placeholder-stone-400 text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:border-primary focus:bg-background focus:shadow-glow-primary'
                        disabled={loading}
                    />
                    <button
                        type='submit'
                        disabled={loading || !message.trim()}
                        className='shrink-0 w-10 h-10 sm:w-12 sm:h-12 gradient-primary hover:shadow-glow-primary text-white rounded-xl transition-all duration-200 shadow-warm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center'
                    >
                        <Send className='w-4 h-4 sm:w-5 sm:h-5' strokeWidth={2} />
                    </button>
                </form>
            </div>
        </div>
    )
};

export default ChatInterface;