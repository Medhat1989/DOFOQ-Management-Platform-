import React from 'react';
import { auth } from './firebase';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { SplashScreen } from './components/SplashScreen';
import { Sidebar } from './components/Sidebar';
import { BoardView } from './components/BoardView';
import { boardService } from './services/boardService';
import { Workspace, Space, Board, Group, Item, UserProfile } from './types';
import { 
  LayoutGrid, 
  Loader2, 
  Sparkles, 
  Bell, 
  Inbox as InboxIcon, 
  UserPlus, 
  Puzzle, 
  Search as SearchIcon, 
  HelpCircle, 
  Heart, 
  Grid,
  User,
  LogOut
} from 'lucide-react';
import { AISidekick } from './components/AISidekick';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = React.useState(auth.currentUser);
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [isBootstrapping, setIsBootstrapping] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = React.useState<Workspace | null>(null);
  const [spaces, setSpaces] = React.useState<Space[]>([]);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = React.useState<Board | null>(null);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsAuthReady(true);
      if (!u) {
        setUserProfile(null);
        setIsLoadingProfile(false);
      }
    });
  }, []);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsLoadingProfile(true);
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  React.useEffect(() => {
    if (!user) return;

    const unsub = boardService.getWorkspaces((ws) => {
      setWorkspaces(ws);
      if (ws.length > 0 && !activeWorkspace) {
        setActiveWorkspace(ws[0]);
      }
    });
    return () => unsub?.();
  }, [user]);

  React.useEffect(() => {
    if (!activeWorkspace) return;

    const unsubSpaces = boardService.getSpaces(activeWorkspace.id, setSpaces);
    const unsubBoards = boardService.getBoards(activeWorkspace.id, setBoards);
    
    return () => {
      unsubSpaces?.();
      unsubBoards?.();
    };
  }, [activeWorkspace]);

  React.useEffect(() => {
    if (!activeBoard || !activeWorkspace) return;

    const unsubGroups = boardService.getGroups(activeWorkspace.id, activeBoard.id, setGroups);
    const unsubItems = boardService.getItems(activeWorkspace.id, activeBoard.id, setItems);

    return () => {
      unsubGroups?.();
      unsubItems?.();
    };
  }, [activeBoard, activeWorkspace]);

  const handleSelectBoard = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (board) setActiveBoard(board);
  };

  const bootstrapDemo = async () => {
    if (!user) return;
    setIsBootstrapping(true);
    try {
      // 1. Create Workspace
      const wsRef = await addDoc(collection(db, 'workspaces'), {
        name: 'My Workspace',
        ownerId: user.uid,
        members: [user.uid]
      });

      // 2. Create Space
      const spaceRef = await addDoc(collection(db, `workspaces/${wsRef.id}/spaces`), {
        workspaceId: wsRef.id,
        name: 'Marketing',
        icon: '🚀',
        color: '#3D5AFE'
      });

      // 3. Create Board
      const boardRef = await addDoc(collection(db, `workspaces/${wsRef.id}/boards`), {
        spaceId: spaceRef.id,
        name: 'Campaign Launch',
        type: 'task',
        columns: [
          { id: 'status', title: 'Status', type: 'status' },
          { id: 'priority', title: 'Priority', type: 'status' },
          { id: 'date', title: 'Due Date', type: 'date' }
        ]
      });

      // 4. Create Groups
      const planningGroupRef = await addDoc(collection(db, `workspaces/${wsRef.id}/boards/${boardRef.id}/groups`), {
        boardId: boardRef.id,
        name: 'Planning',
        color: '#3D5AFE',
        order: 0
      });

      const completedGroupRef = await addDoc(collection(db, `workspaces/${wsRef.id}/boards/${boardRef.id}/groups`), {
        boardId: boardRef.id,
        name: 'Completed',
        color: '#00C875',
        order: 1
      });

      // 5. Create Items
      await addDoc(collection(db, `workspaces/${wsRef.id}/boards/${boardRef.id}/items`), {
        boardId: boardRef.id,
        groupId: planningGroupRef.id,
        name: 'Task 1',
        order: 0,
        values: {
          status: { label: 'Working on it', color: '#FDAB3D' },
          date: 'Mar 30'
        }
      });

      await addDoc(collection(db, `workspaces/${wsRef.id}/boards/${boardRef.id}/items`), {
        boardId: boardRef.id,
        groupId: planningGroupRef.id,
        name: 'Task 2',
        order: 1,
        values: {
          status: { label: 'Done', color: '#00C875' },
          date: 'Mar 31'
        }
      });

      await addDoc(collection(db, `workspaces/${wsRef.id}/boards/${boardRef.id}/items`), {
        boardId: boardRef.id,
        groupId: planningGroupRef.id,
        name: 'Task 3',
        order: 2,
        values: {
          status: { label: 'Stuck', color: '#E2445C' },
          date: 'Apr 1'
        }
      });

      setActiveWorkspace({ id: wsRef.id, name: 'My Workspace', ownerId: user.uid, members: [user.uid] });
    } catch (error) {
      console.error('Bootstrap failed', error);
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!userProfile?.onboardingCompleted) {
    return <Onboarding onComplete={(companyName) => setUserProfile(prev => prev ? { ...prev, companyName, onboardingCompleted: true } : { uid: user.uid, email: user.email || '', companyName, industry: '', companySize: '', sectionsToManage: [], onboardingCompleted: true, createdAt: null } as UserProfile)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        spaces={spaces} 
        boards={boards} 
        activeBoardId={activeBoard?.id}
        onSelectBoard={handleSelectBoard}
        companyName={userProfile.companyName}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Top Bar */}
        <header className="h-12 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 text-xs font-bold text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> See plans
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><Bell className="w-5 h-5" /></button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 relative">
              <InboxIcon className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">1</span>
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><UserPlus className="w-5 h-5" /></button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><Puzzle className="w-5 h-5" /></button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><SearchIcon className="w-5 h-5" /></button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><HelpCircle className="w-5 h-5" /></button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><Heart className="w-5 h-5" /></button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><Grid className="w-5 h-5" /></button>
            <button 
              onClick={handleLogout}
              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white ml-2 cursor-pointer border-2 border-white shadow-sm">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeBoard ? (
            <BoardView 
              board={activeBoard} 
              groups={groups} 
              items={items} 
              workspaceId={activeWorkspace?.id || ''}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <h2 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Welcome to {userProfile.companyName}</h2>
              <p className="text-slate-500 max-w-md mb-8">Select a board from the sidebar to start tracking your work, or create a new one to get organized.</p>
              
              {workspaces.length === 0 && (
                <button
                  onClick={bootstrapDemo}
                  disabled={isBootstrapping}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {isBootstrapping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Create Demo Workspace
                </button>
              )}
            </div>
          )}
        </main>
      </div>
      <AISidekick boardContext={{ board: activeBoard, items }} />
    </div>
  );
}

