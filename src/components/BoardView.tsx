import React from 'react';
import { 
  Table as TableIcon, 
  Filter, 
  ArrowUpDown, 
  EyeOff, 
  Plus, 
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  CheckCircle2,
  Star,
  Search,
  Info,
  Clock,
  Sparkles,
  X,
  Zap,
  Share2,
  Settings2,
  Users,
  Grid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Board, Group, Item, ColumnDefinition, Activity } from '../types';
import { boardService } from '../services/boardService';
import { ActivityLog } from './ActivityLog';
import { ItemDetails } from './ItemDetails';
import { AnimatePresence } from 'motion/react';

interface BoardViewProps {
  board: Board;
  groups: Group[];
  items: Item[];
  workspaceId: string;
}

const STATUS_OPTIONS = [
  { label: 'Working on it', color: '#FDAB3D' },
  { label: 'Done', color: '#00C875' },
  { label: 'Stuck', color: '#E2445C' },
  { label: 'Not Started', color: '#C4C4C4' },
];

export function BoardView({ board, groups, items, workspaceId }: BoardViewProps) {
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const [activePicker, setActivePicker] = React.useState<{ itemId: string, colId: string } | null>(null);
  const [isActivityLogOpen, setIsActivityLogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);
  const [activities, setActivities] = React.useState<Activity[]>([]);

  React.useEffect(() => {
    if (workspaceId && board.id) {
      const unsub = boardService.getActivities(workspaceId, board.id, setActivities);
      return () => unsub?.();
    }
  }, [workspaceId, board.id]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleAddItem = async (groupId: string) => {
    const newItem = {
      name: 'New Item',
      groupId,
      boardId: board.id,
      order: items.filter(i => i.groupId === groupId).length,
      values: {}
    };
    const res = await boardService.createItem(workspaceId, board.id, newItem);
    if (res) {
      await boardService.logActivity(workspaceId, board.id, {
        action: 'Created item',
        details: 'New Item',
        itemId: res.id
      });
    }
  };

  const handleUpdateStatus = async (itemId: string, colId: string, status: any) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const oldStatus = item.values[colId]?.label || 'None';
    const newValues = { ...item.values, [colId]: status };
    await boardService.updateItem(workspaceId, board.id, itemId, { values: newValues });
    
    await boardService.logActivity(workspaceId, board.id, {
      action: `Updated status for ${item.name}`,
      details: `Changed from ${oldStatus} to ${status.label}`,
      itemId
    });

    setActivePicker(null);
  };

  const handleAddGroup = async () => {
    const newGroup = {
      name: 'New Group',
      color: '#00C875',
      order: groups.length,
      boardId: board.id
    };
    await boardService.createGroup(workspaceId, board.id, newGroup);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F6F8] overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-6 pb-2 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{board.name}</h2>
            <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><ChevronDown className="w-5 h-5" /></button>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Sidekick
              </button>
              <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                <Zap className="w-4 h-4 text-indigo-500" /> AI suggestions <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1 rounded">New</span>
              </button>
              <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                <Share2 className="w-4 h-4" /> Integrate
              </button>
              <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                <Settings2 className="w-4 h-4" /> Automate
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
            </div>
            <button className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              Invite / 1 <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <ViewTab icon={<TableIcon className="w-4 h-4" />} label="Main table" active />
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><Plus className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-4">
        <div className="flex items-center bg-indigo-600 rounded-lg overflow-hidden">
          <button className="px-4 py-1.5 text-white text-sm font-medium hover:bg-indigo-700 transition-colors border-r border-indigo-500">New task</button>
          <button className="px-2 py-1.5 text-white hover:bg-indigo-700 transition-colors"><ChevronDown className="w-4 h-4" /></button>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-600">
          <Search className="w-4 h-4" />
          <span className="text-sm">Search</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-600">
          <User className="w-4 h-4" />
          <span className="text-sm">Person</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter</span>
          <ChevronDown className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-600">
          <ArrowUpDown className="w-4 h-4" />
          <span className="text-sm">Sort</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-600">
          <EyeOff className="w-4 h-4" />
          <span className="text-sm">Hide</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-600">
          <Grid className="w-4 h-4" />
          <span className="text-sm">Group by</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {groups.map(group => {
          const groupItems = items.filter(i => i.groupId === group.id);
          return (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center gap-2 group">
                <button 
                  onClick={() => toggleGroup(group.id)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  {expandedGroups[group.id] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <h3 className="font-bold text-lg" style={{ color: group.color }}>{group.name}</h3>
              </div>

              {!expandedGroups[group.id] && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-white border-b border-slate-200">
                        <th className="w-10 px-4 py-3">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%] text-center">Task</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-l border-slate-200 text-center">Owner</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-l border-slate-200 text-center">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-l border-slate-200 text-center">Due date</th>
                        <th className="w-10 px-4 py-3 border-l border-slate-200">
                          <Plus className="w-4 h-4 text-slate-400" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupItems.map(item => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group relative">
                          <td className="px-4 py-3">
                            <input type="checkbox" className="rounded border-slate-300" />
                          </td>
                          <td 
                            className="px-4 py-3 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-100/50 transition-colors"
                            onClick={() => setSelectedItem(item)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{item.name}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button className="p-1 hover:bg-slate-200 rounded"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /></button>
                                <button className="p-1 hover:bg-slate-200 rounded"><Plus className="w-3.5 h-3.5 text-slate-400" /></button>
                              </div>
                            </div>
                          </td>
                          <td className="p-0 border-l border-slate-100 h-full">
                            <div className="h-full min-h-[44px] flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white">
                                <User className="w-5 h-5" />
                              </div>
                            </div>
                          </td>
                          <td className="p-0 border-l border-slate-100 h-full">
                            <div className="h-full min-h-[44px] flex items-center justify-center">
                              {renderCellValue(
                                item.values['status'], 
                                { id: 'status', title: 'Status', type: 'status' }, 
                                item.id, 
                                () => setActivePicker({ itemId: item.id, colId: 'status' })
                              )}
                              
                              {/* Status Picker Popover */}
                              {activePicker?.itemId === item.id && activePicker?.colId === 'status' && (
                                <div className="absolute z-50 mt-2 top-full bg-white rounded-xl shadow-2xl border border-slate-200 p-2 w-48 animate-in fade-in zoom-in duration-150">
                                  <div className="grid grid-cols-1 gap-1">
                                    {STATUS_OPTIONS.map(opt => (
                                      <button
                                        key={opt.label}
                                        onClick={() => handleUpdateStatus(item.id, 'status', opt)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                                      >
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-0 border-l border-slate-100 h-full">
                            <div className="h-full min-h-[44px] flex items-center justify-center text-sm text-slate-600">
                              {item.values['date'] || '—'}
                            </div>
                          </td>
                          <td className="border-l border-slate-100" />
                        </tr>
                      ))}
                      <tr className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleAddItem(group.id)}>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 text-sm text-slate-400 italic flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Add task
                        </td>
                        <td className="border-l border-slate-100" />
                        <td className="border-l border-slate-100" />
                        <td className="border-l border-slate-100" />
                        <td className="border-l border-slate-100" />
                      </tr>
                    </tbody>
                    {/* Summary Row */}
                    <tfoot>
                      <tr className="bg-white border-t border-slate-200">
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 border-l border-slate-200" />
                        <td className="px-4 py-3 border-l border-slate-200">
                          {renderSummary(groupItems, { id: 'status', title: 'Status', type: 'status' })}
                        </td>
                        <td className="px-4 py-3 border-l border-slate-200">
                          {renderSummary(groupItems, { id: 'date', title: 'Due date', type: 'date' })}
                        </td>
                        <td className="border-l border-slate-200" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Add New Group Button */}
        <div className="pb-12">
          <button 
            onClick={handleAddGroup}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add new group
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isActivityLogOpen && (
          <ActivityLog 
            activities={activities} 
            onClose={() => setIsActivityLogOpen(false)} 
          />
        )}
        {selectedItem && (
          <ItemDetails 
            item={selectedItem}
            workspaceId={workspaceId}
            boardId={board.id}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewTab({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
      active ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
    )}>
      {icon}
      {label}
    </button>
  );
}

function renderCellValue(value: any, column: ColumnDefinition, itemId: string, onOpenPicker: () => void) {
  if (!value && column.type !== 'status') return <span className="text-slate-300">—</span>;
  
  switch (column.type) {
    case 'status':
      const status = value || { label: '', color: '#C4C4C4' };
      return (
        <button 
          onClick={onOpenPicker}
          className="w-full h-full flex items-center justify-center px-2 py-1 text-xs font-bold text-white text-center uppercase transition-opacity hover:opacity-90"
          style={{ backgroundColor: status.color }}
        >
          {status.label}
        </button>
      );
    case 'person':
      const people = Array.isArray(value) ? value : [];
      return (
        <div className="flex -space-x-2">
          {people.length > 0 ? people.map((p: any) => (
            <div key={p.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
              {p.initials || 'U'}
            </div>
          )) : (
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      );
    case 'date':
      return (
        <div className="text-sm text-slate-600 flex items-center gap-1">
          {value ? value : <span className="text-slate-300">Set date</span>}
        </div>
      );
    default:
      return <span className="text-sm text-slate-600">{String(value || '')}</span>;
  }
}

function renderSummary(items: Item[], column: ColumnDefinition) {
  if (items.length === 0) return null;

  if (column.type === 'status') {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const status = item.values[column.id]?.label || 'Not Started';
      counts[status] = (counts[status] || 0) + 1;
    });
    
    const total = items.length;

    return (
      <div className="space-y-1.5">
        <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
          {STATUS_OPTIONS.map(opt => {
            const count = counts[opt.label] || 0;
            if (count === 0) return null;
            const width = (count / total) * 100;
            return (
              <div 
                key={opt.label} 
                className="h-full transition-all duration-500" 
                style={{ width: `${width}%`, backgroundColor: opt.color }}
                title={`${opt.label}: ${count}`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          {STATUS_OPTIONS.map(opt => {
            const count = counts[opt.label] || 0;
            if (count === 0) return null;
            return (
              <div key={opt.label} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: opt.color }} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{Math.round((count/total)*100)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (column.type === 'date') {
    // Simple date range summary
    return (
      <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold text-center whitespace-nowrap border border-indigo-100">
        Mar 30 - Apr 15
      </div>
    );
  }

  if (column.type === 'person') {
    const uniqueAssignees = new Set();
    items.forEach(item => {
      const assignees = item.values[column.id] || [];
      if (Array.isArray(assignees)) {
        assignees.forEach(a => uniqueAssignees.add(a.id));
      }
    });
    return (
      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <User className="w-3 h-3" />
        {uniqueAssignees.size} People
      </div>
    );
  }

  return null;
}

