import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X, Calendar, Network, BarChart3 } from 'lucide-react'

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const navLinks = [
        { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
        { to: '/documents', icon: FileText, text: 'Documents' },
        { to: '/study-planner', icon: Calendar, text: 'Study Planner' },
        { to: '/mind-map', icon: Network, text: 'Mind Maps' },
        { to: '/progress', icon: BarChart3, text: 'Progress' },
        { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
        { to: '/profile', icon: User, text: 'Profile' },
    ]

    return <>

        <div className={`fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={toggleSidebar}
            aria-hidden="true"
        ></div>

        <aside
            className={`fixed top-0 left-0 h-full w-64 glass-strong z-50 md:relative md:w-64 md:shrink-0 md:flex md:flex-col md:translate-x-0 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            {/* Logo and Close button for mobile */}
            <div className='flex items-center justify-between h-16 px-5 border-b border-border'>
                <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-glow-primary'>
                        <BrainCircuit className='text-white' size={22} strokeWidth={2.5} />
                    </div>
                    <h1 className='text-base md:text-2xl font-bold text-foreground tracking-tight' style={{ fontFamily: 'var(--font-display)' }}>RankUp</h1>
                </div>
                <button onClick={toggleSidebar} className='md:hidden text-muted-foreground hover:text-primary transition-colors'>
                    <X size={24} />
                </button>
            </div>

            {/* Navigation */}
            <nav className='flex-1 px-3 py-6 space-y-1.5'>
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border-l-2    
                                ${isActive
                                ? 'bg-primary/10 text-primary border-primary shadow-[inset_2px_0_10px_rgba(6,95,70,0.1)]'
                                : 'border-transparent text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <link.icon
                                    size={18}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-all duration-200 
                                        ${isActive ? 'text-primary' : 'group-hover:scale-110'}
                                        `}
                                />
                                {link.text}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className='px-3 py-4 border-t border-border'>
                <button
                    onClick={handleLogout}
                    className='group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-l-2 border-transparent hover:border-destructive
                    transition-all duration-200 rounded-xl'
                >
                    <LogOut
                        size={18}
                        strokeWidth={2}
                        className='transition-transform duration-200 group-hover:scale-110'
                    />
                    Logout
                </button>
            </div>
        </aside>
    </>
}

export default Sidebar