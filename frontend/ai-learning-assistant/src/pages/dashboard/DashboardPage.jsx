import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/common/Spinner'
import progressService from '../../services/progressService';
import toast from 'react-hot-toast'
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock, Plus, Zap, ArrowRight } from 'lucide-react'
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
        // console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse pt-12">
           <div className="h-32 bg-card rounded-3xl w-full border border-border"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="h-40 bg-card rounded-2xl border border-border"></div>
             <div className="h-40 bg-card rounded-2xl border border-border"></div>
             <div className="h-40 bg-card rounded-2xl border border-border"></div>
           </div>
        </div>
      </div>
    )
  }

  const overview = dashboardData?.overview || { totalDocuments: 0, totalFlashcards: 0, totalQuizzes: 0, streak: 0 };
  const recentDocs = dashboardData?.recentActivity?.documents || [];

  const stats = [
    {
      label: "Documents",
      value: overview.totalDocuments,
      icon: FileText,
    },
    {
      label: "Flashcards",
      value: overview.totalFlashcards,
      icon: BookOpen,
    },
    {
      label: "Quizzes",
      value: overview.totalQuizzes,
      icon: BrainCircuit,
    }
  ]

  return (
    <div className='min-h-screen bg-background text-foreground pb-20'>
      <div className='max-w-6xl mx-auto px-6 pt-12'>

        {/* Helper/Welcome Hero Banner */}
        <div className='relative overflow-hidden rounded-3xl mb-16 border border-border bg-card'>
          <div className='absolute inset-0 gradient-mesh opacity-100'></div>
          <div className='relative z-10 p-10 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div>
              <h1 className='text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground'>
                Welcome, {user?.username || 'Student'}.
              </h1>
              <p className='text-muted-foreground font-sans text-lg md:text-xl'>
                Ready to conquer your study goals today?
              </p>
            </div>

            <div className='flex items-center gap-4 shrink-0'>
              <div className='flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-md rounded-full border border-white/40 shadow-warm'>
                <TrendingUp size={20} className='text-accent' />
                <span className='font-sans font-semibold text-sm text-foreground'>{overview.streak || 0} Day Streak</span>
              </div>
              <Link to="/documents">
                <button className='flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-full font-sans font-medium text-sm hover:shadow-glow-primary transition-all shadow-warm hover:-translate-y-1'>
                  <Plus size={18} />
                  Upload Document
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-glow-primary overflow-hidden hover:-translate-y-1"
            >
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className='flex items-center justify-between mb-6'>
                <span className='font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                  {stat.label}
                </span>
                <div className='p-2.5 rounded-xl bg-primary/5 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300'>
                  <stat.icon className='w-5 h-5' strokeWidth={2} />
                </div>
              </div>
              <div className='text-5xl font-numbers font-medium tracking-tight text-foreground'>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Recent Activity */}
          <div className='lg:col-span-8'>
            <div className='flex items-center justify-between mb-8'>
              <h3 className='text-2xl font-bold text-foreground tracking-tight'>Recent Activity</h3>
              <Link to="/documents" className='text-muted-foreground hover:text-primary font-sans text-sm font-medium transition-colors'>View all</Link>
            </div>

            {recentDocs.length > 0 ? (
              <div className='space-y-4'>
                {recentDocs.map((doc, i) => (
                  <Link to={`/documents/${doc._id}`} key={doc._id} className='block group'>
                    <div className='flex items-center justify-between p-5 border border-border rounded-2xl hover:border-primary/50 transition-all bg-card hover:bg-primary/5'>
                      <div className='flex items-center gap-5'>
                        <div className='p-3.5 bg-primary/5 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors'>
                          <FileText className='w-6 h-6 text-muted-foreground group-hover:text-primary' strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className='font-sans font-semibold text-foreground group-hover:text-primary transition-colors text-lg mb-1'>
                            {doc.title}
                          </h4>
                          <p className='font-sans text-sm text-muted-foreground'>
                            Accessed {new Date(doc.lastAccessed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className='w-5 h-5 text-muted-foreground group-hover:text-primary transition-all -translate-x-2 group-hover:translate-x-0' />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='p-12 border border-dashed border-border rounded-2xl text-center bg-card'>
                <Clock className='w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-50' />
                <p className='font-sans text-muted-foreground'>No recent activity found. Upload a document to start studying.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className='lg:col-span-4'>
            <h3 className='text-2xl font-bold text-foreground mb-8 tracking-tight'>Quick Actions</h3>
            <div className='space-y-4'>
              <Link to="/documents" className='block group'>
                <div className='relative overflow-hidden p-6 gradient-primary text-white rounded-2xl hover:shadow-glow-primary transition-all hover:-translate-y-1'>
                  <div className='absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10'></div>
                  <div className='flex items-center justify-between mb-4 relative z-10'>
                    <div className='p-2 bg-white/20 rounded-lg'>
                      <Plus className='w-6 h-6' />
                    </div>
                    <ArrowRight className='w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                  <h4 className='font-sans font-bold text-xl mb-1 relative z-10'>Upload Document</h4>
                  <p className='font-sans text-white/80 text-sm relative z-10'>Add new study materials.</p>
                </div>
              </Link>

              <Link to="/flashcards" className='block group'>
                <div className='p-6 border border-border rounded-2xl hover:border-primary/50 transition-all bg-card hover:shadow-glow-primary hover:-translate-y-1'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='p-2 bg-primary/10 rounded-lg text-primary'>
                      <BookOpen className='w-6 h-6' />
                    </div>
                    <ArrowRight className='w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary' />
                  </div>
                  <h4 className='font-sans font-bold text-xl mb-1 text-foreground'>Study Flashcards</h4>
                  <p className='font-sans text-muted-foreground text-sm'>Review your generated decks.</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DashboardPage