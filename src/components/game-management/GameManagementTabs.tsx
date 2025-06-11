// src/components/game-management/GameManagementTabs.tsx
interface Tab {
  id: string
  label: string
  icon: string
  count: number
}

interface GameManagementTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  disabled: boolean
}

export function GameManagementTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  disabled 
}: GameManagementTabsProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isDisabled = disabled && tab.id !== 'games'
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : isDisabled 
                    ? 'text-slate-500 cursor-not-allowed opacity-50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title={isDisabled ? 'Select a game first' : ''}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : isDisabled
                    ? 'bg-slate-600/30 text-slate-500'
                    : 'bg-slate-600/50 text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}