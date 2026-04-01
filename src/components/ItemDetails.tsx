import React from 'react';
import { 
  X, 
  Home, 
  FileText, 
  Clock, 
  Plus, 
  User, 
  MoreHorizontal, 
  MessageSquare,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  Quote,
  Smile,
  Paperclip,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { Item, Update } from '../types';
import { boardService } from '../services/boardService';
import { cn } from '../lib/utils';

interface ItemDetailsProps {
  item: Item;
  workspaceId: string;
  boardId: string;
  onClose: () => void;
}

export function ItemDetails({ item, workspaceId, boardId, onClose }: ItemDetailsProps) {
  const [activeTab, setActiveTab] = React.useState('updates');
  const [updateContent, setUpdateContent] = React.useState('');
  const [updates, setUpdates] = React.useState<Update[]>([]);
  const [isPosting, setIsPosting] = React.useState(false);

  React.useEffect(() => {
    const unsub = boardService.getUpdates(workspaceId, boardId, item.id, setUpdates);
    return () => unsub?.();
  }, [workspaceId, boardId, item.id]);

  const handlePostUpdate = async () => {
    if (!updateContent.trim() || isPosting) return;
    setIsPosting(true);
    try {
      await boardService.addUpdate(workspaceId, boardId, item.id, updateContent);
      setUpdateContent('');
      await boardService.logActivity(workspaceId, boardId, {
        action: `Posted update on ${item.name}`,
        itemId: item.id
      });
    } catch (error) {
      console.error('Failed to post update', error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 w-[600px] h-full bg-white shadow-2xl border-l border-slate-200 z-[60] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              <User className="w-4 h-4" />
            </div>
            <button className="p-1 hover:bg-slate-100 rounded text-slate-400">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Tab icon={<Home className="w-4 h-4" />} label="Updates" active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} />
          <Tab icon={<FileText className="w-4 h-4" />} label="Files" active={activeTab === 'files'} onClick={() => setActiveTab('files')} />
          <Tab icon={<Clock className="w-4 h-4" />} label="Activity Log" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {activeTab === 'updates' && (
          <div className="p-6 space-y-6">
            {/* Rich Text Editor Placeholder */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50">
                <EditorButton icon={<Bold className="w-3.5 h-3.5" />} />
                <EditorButton icon={<Italic className="w-3.5 h-3.5" />} />
                <EditorButton icon={<Underline className="w-3.5 h-3.5" />} />
                <EditorButton icon={<Strikethrough className="w-3.5 h-3.5" />} />
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <EditorButton icon={<Link className="w-3.5 h-3.5" />} />
                <EditorButton icon={<List className="w-3.5 h-3.5" />} />
                <EditorButton icon={<ListOrdered className="w-3.5 h-3.5" />} />
                <EditorButton icon={<Quote className="w-3.5 h-3.5" />} />
              </div>
              <textarea
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                placeholder="Write an update..."
                className="w-full p-4 min-h-[120px] outline-none text-sm resize-none"
              />
              <div className="flex items-center justify-between p-3 bg-white border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <EditorButton icon={<Smile className="w-4 h-4" />} />
                  <EditorButton icon={<Paperclip className="w-4 h-4" />} />
                  <span className="text-xs text-slate-400 ml-2">@ Mention teammates</span>
                </div>
                <button
                  onClick={handlePostUpdate}
                  disabled={!updateContent.trim() || isPosting}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isPosting ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Update
                </button>
              </div>
            </div>

            {/* Updates List */}
            <div className="space-y-6">
              {updates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-indigo-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No updates yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Share progress, mention a teammate, or upload a file to get things moving</p>
                </div>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {update.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{update.authorName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {update.createdAt?.toDate?.() ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(update.createdAt.toDate()) : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {update.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Tab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-1 py-3 text-sm font-medium transition-all border-b-2",
        active ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function EditorButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors">
      {icon}
    </button>
  );
}
