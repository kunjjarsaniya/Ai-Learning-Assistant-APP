import React from 'react'

const Tabs = ({
    tabs,
    activeTab,
    setActiveTab
}) => {
    return (
        <div className='w-full'>
            <div className='relative border-b-2 border-border'>
                <nav className='flex flex-wrap gap-1 sm:gap-2 overflow-x-auto scrollbar-hide'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`relative pb-4 sm:pb-6 px-3 sm:px-6 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap
                                ${activeTab === tab.name
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span className='relative z-10'>{tab.label}</span>
                            {activeTab === tab.name && (
                                <div className='absolute bottom-0 left-0 right-0 h-0.5 gradient-primary rounded-full shadow-glow-primary' />
                            )}
                            {activeTab === tab.name && (
                                <div className='absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-t-xl -z-10' />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            <div className='py-4 sm:py-6'>
                {tabs.map((tab) => {
                    if (tab.name === activeTab) {
                        return (
                            <div
                                key={tab.name}
                                className='animate-in fade-in duration-300'
                            >
                                {tab.content}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    )
};

export default Tabs