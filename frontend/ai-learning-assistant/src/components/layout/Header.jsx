import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, User, Menu } from 'lucide-react'
import NotificationDropdown from '../notifications/NotificationDropdown'

import { useNotification } from '../../context/NotificationContext'

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth()
    const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotification();
    const [showNotifications, setShowNotifications] = useState(false)

    // We can show the green dot only if there are unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="sticky top-0 z-40 w-full h-16 glass-strong border-b border-border">
            <div className='flex items-center h-full px-6 justify-between'>
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleSidebar}
                    className='md:hidden inline-flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5 transition-all duration-200'
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={24} />
                </button>

                <div className="hidden md:block"></div>

                <div className="flex items-center gap-3 relative">
                    {/* Notification Bell */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative inline-flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/5 transition-all duration-200 group ${showNotifications ? 'bg-primary/10 text-primary' : ''}`}
                    >
                        <Bell size={20} strokeWidth={2} className='transition-transform duration-200' />
                        {unreadCount > 0 && (
                            <span className='absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-card animate-pulse'></span>
                        )}
                    </button>

                    <NotificationDropdown
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                        notifications={notifications}
                        markAsRead={markAsRead}
                        markAllAsRead={markAllAsRead}
                        clearNotification={clearNotification}
                    />

                    {/* User Profile */}
                    <div className='flex items-center gap-3 pl-3 border-l border-border'>
                        <div className='flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-colors duration-200 cursor-pointer group'>
                            <div className='w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-glow-primary group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-200'>
                                <User size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className='text-sm font-semibold text-foreground'>
                                    {user?.username || 'User'}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
