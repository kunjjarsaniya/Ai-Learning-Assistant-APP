import React, { useState } from 'react';
import { Bell, Check, Clock, X } from 'lucide-react';
import moment from 'moment';

const NotificationDropdown = ({
    isOpen,
    onClose,
    notifications = [],
    markAsRead,
    markAllAsRead,
    clearNotification
}) => {

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleClear = (e, id) => {
        e.stopPropagation();
        clearNotification(id);
    };

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className="absolute right-0 top-12 mt-2 w-80 md:w-96 bg-card border border-stone-200/60 rounded-2xl shadow-2xl shadow-primary/5 z-50 overflow-hidden transform transition-all duration-200 origin-top-right animate-in fade-in zoom-in-95 backdrop-blur-xl">
                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1.5 px-2 py-1 hover:bg-primary/10 rounded-md"
                        >
                            <Check size={14} /> Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-10 text-center text-stone-500">
                            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-6 h-6 text-stone-400" />
                            </div>
                            <p className="text-sm font-medium text-stone-600">No notifications</p>
                            <p className="text-xs text-stone-400 mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-50">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`relative p-5 transition-all cursor-pointer group hover:bg-stone-50 ${!notification.read ? 'bg-primary/5' : 'bg-transparent'}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${!notification.read ? 'bg-primary ring-2 ring-primary/20' : 'bg-stone-300'}`} />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm ${!notification.read ? 'font-bold text-stone-900' : 'font-medium text-stone-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-stone-400 whitespace-nowrap flex items-center gap-1 bg-stone-100 px-1.5 py-0.5 rounded-md">
                                                    <Clock size={10} />
                                                    {moment(notification.timestamp).fromNow(true)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>

                                        <button
                                            onClick={(e) => handleClear(e, notification.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-md self-start"
                                            title="Remove notification"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationDropdown;
