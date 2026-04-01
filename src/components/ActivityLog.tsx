import React from 'react';
import { X, Clock, User, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Activity } from '../types';
import { cn } from '../lib/utils';

interface ActivityLogProps {
  activities: Activity[];
  onClose: () => void;
}

export function ActivityLog({ activities, onClose }: ActivityLogProps) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col"
    >
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No activity yet. Start working to see logs here!</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2 group-last:hidden" />
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">{activity.userName}</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {activity.createdAt?.toDate?.() ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(activity.createdAt.toDate()) : 'Just now'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-medium text-slate-900">{activity.action}</span>
                  {activity.details && <span className="text-slate-500">: {activity.details}</span>}
                </p>
                {activity.itemId && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded w-fit">
                    <MessageSquare className="w-3 h-3" />
                    View item
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
