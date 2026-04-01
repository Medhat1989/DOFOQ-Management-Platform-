import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, LogOut } from 'lucide-react';

export function Auth() {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Welcome</h1>
          <p className="text-slate-600 text-center text-xl">All-In-One Work Platform — Track & Plan with Ease</p>
        </div>
        
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#3D5AFE] hover:bg-[#304FFE] text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
        
        <p className="mt-6 text-xs text-center text-slate-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
