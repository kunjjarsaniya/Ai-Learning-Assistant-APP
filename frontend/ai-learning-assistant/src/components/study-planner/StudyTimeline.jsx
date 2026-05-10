import React from 'react';
import { CheckCircle2, Circle, ArrowLeft, Clock } from 'lucide-react';
import moment from 'moment';

const StudyTimeline = ({ plan, onBack, onTopicUpdate }) => {
    
    // Calculate total progress
    let totalTopics = 0;
    let completedTopics = 0;
    
    plan.scheduleDays.forEach(day => {
        day.topics.forEach(topic => {
            totalTopics++;
            if (topic.isCompleted) completedTopics++;
        });
    });

    const progressPercentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Back Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                    <ArrowLeft
                        className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                        strokeWidth={2}
                    />
                    Back to Plans
                </button>
            </div>

            {/* Plan Overview Card */}
            <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">{plan.title}</h2>
                <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between mb-8">
                    <div className="flex gap-6">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Exam Date</p>
                            <p className="text-sm font-medium text-foreground">{moment(plan.examDate).format('MMMM D, YYYY')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pace</p>
                            <p className="text-sm font-medium text-foreground">{plan.dailyHours} hours / day</p>
                        </div>
                    </div>
                    
                    <div className="w-full sm:w-1/3">
                        <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="text-primary">{progressPercentage}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-1000 ease-out" 
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-border/60 ml-4 space-y-12">
                    {plan.scheduleDays.map((day, dayIndex) => {
                        
                        const isToday = moment(day.date).isSame(moment(), 'day');
                        const isPast = moment(day.date).isBefore(moment(), 'day');
                        
                        return (
                            <div key={day._id || dayIndex} className="relative">
                                {/* Day Node */}
                                <div className={`absolute -left-[35px] sm:-left-[43px] w-6 h-6 rounded-full border-4 border-card flex items-center justify-center 
                                    ${isToday ? 'bg-primary' : isPast ? 'bg-primary/50' : 'bg-border'}`}
                                ></div>

                                {/* Day Header */}
                                <div className="mb-4">
                                    <h4 className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                                        Day {day.dayNumber}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                        {moment(day.date).format('dddd, MMMM D')}
                                    </p>
                                </div>

                                {/* Topics List */}
                                <div className="space-y-3">
                                    {day.topics.map(topic => (
                                        <div 
                                            key={topic._id}
                                            onClick={() => onTopicUpdate(plan._id, topic._id, !topic.isCompleted)}
                                            className={`group flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                ${topic.isCompleted 
                                                    ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                                                    : 'bg-card border-border hover:border-primary/40 hover:shadow-glow-primary'
                                                }`}
                                        >
                                            <button className="mt-0.5 shrink-0 transition-transform group-active:scale-90">
                                                {topic.isCompleted ? (
                                                    <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary/50" strokeWidth={2.5} />
                                                )}
                                            </button>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <h5 className={`font-semibold text-sm sm:text-base transition-colors ${topic.isCompleted ? 'text-foreground/60 line-through' : 'text-foreground'}`}>
                                                        {topic.title}
                                                    </h5>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 bg-secondary px-2 py-1 rounded-md font-medium">
                                                        <Clock size={12} />
                                                        <span>{topic.estimatedMinutes}m</span>
                                                    </div>
                                                </div>
                                                {topic.description && (
                                                    <p className={`text-xs sm:text-sm font-sans ${topic.isCompleted ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                                                        {topic.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudyTimeline;
