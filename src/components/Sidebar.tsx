import React from 'react';
import { 
  LayoutGrid, 
  Search, 
  Inbox, 
  Star, 
  Clock, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Settings,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Space, Board } from '../types';

interface SidebarProps {
  spaces: Space[];
  boards: Board[];
  activeBoardId?: string;
  onSelectBoard: (boardId: string) => void;
  companyName?: string;
}

export function Sidebar({ spaces, boards, activeBoardId, onSelectBoard, companyName }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [expandedSpaces, setExpandedSpaces] = React.useState<Record<string, boolean>>({});

  const toggleSpace = (spaceId: string) => {
    setExpandedSpaces(prev => ({ ...prev, [spaceId]: !prev[spaceId] }));
  };

  return (
    <aside 
      className={cn(
        "flex flex-col bg-[#0F172A] text-slate-300 transition-all duration-300 border-r border-slate-800",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center h-10 px-2">
            <span className="font-bold text-white text-xl tracking-tight truncate">{companyName || 'Dofoq'}</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-800 rounded transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <NavItem icon={<Search className="w-5 h-5" />} label="Search" isCollapsed={isCollapsed} />
        <NavItem icon={<LayoutGrid className="w-5 h-5" />} label="My Work" isCollapsed={isCollapsed} />
        <NavItem icon={<Inbox className="w-5 h-5" />} label="Inbox" isCollapsed={isCollapsed} />
        
        <div className="pt-4 pb-2">
          {!isCollapsed && <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Favorites</span>}
          <NavItem icon={<Star className="w-5 h-5 text-amber-400" />} label="Starred Board" isCollapsed={isCollapsed} />
        </div>

        <div className="pt-4">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Spaces</span>
              <button className="p-0.5 hover:bg-slate-800 rounded"><Plus className="w-3 h-3" /></button>
            </div>
          )}
          
          {spaces.map(space => (
            <div key={space.id} className="space-y-1">
              <button
                onClick={() => toggleSpace(space.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm",
                  isCollapsed && "justify-center"
                )}
              >
                {!isCollapsed && (expandedSpaces[space.id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
                <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 text-xs">{space.icon || '📁'}</span>
                {!isCollapsed && <span className="flex-1 text-left font-medium">{space.name}</span>}
              </button>
              
              {!isCollapsed && expandedSpaces[space.id] && (
                <div className="ml-6 space-y-1">
                  {boards.filter(b => b.spaceId === space.id).map(board => (
                    <button
                      key={board.id}
                      onClick={() => onSelectBoard(board.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                        activeBoardId === board.id ? "bg-indigo-600 text-white" : "hover:bg-slate-800"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {board.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-slate-800 space-y-1">
        <NavItem icon={<Trash2 className="w-5 h-5" />} label="Trash" isCollapsed={isCollapsed} />
        <NavItem icon={<Settings className="w-5 h-5" />} label="Admin" isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, isCollapsed }: { icon: React.ReactNode, label: string, isCollapsed: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium",
      isCollapsed && "justify-center"
    )}>
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </button>
  );
}
