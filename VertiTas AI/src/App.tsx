import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Moon, Sun, LogIn, LogOut } from 'lucide-react';
import InputPanel from './components/InputPanel';
import ResultDashboard from './components/ResultDashboard';
import ExplanationPanel from './components/ExplanationPanel';
import HistoryPanel from './components/HistoryPanel';
import type { AnalysisResult } from './types';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("Login popup closed by user.");
      } else {
        console.error("Login error", error);
        setError("Failed to log in. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleAnalyze = async (input: string, isUrl: boolean) => {
    setIsLoading(true);
    setError('');
    setResult(null);
    setOriginalText(isUrl ? 'Scraping URL...' : input);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, isUrl })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze');
      }

      setResult(data.result);
      if (isUrl && data.scrapedText) {
        setOriginalText(data.scrapedText);
      } else {
        setOriginalText(input);
      }

      // Save to history if logged in
      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'analysisLogs'), {
            userId: auth.currentUser.uid,
            inputText: input.substring(0, 500), // Save a snippet
            label: data.result.label,
            confidence: data.result.confidence,
            createdAt: new Date().toISOString()
          });
        } catch (dbError) {
          console.error("Failed to save history:", dbError);
        }
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 dark:bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
            Veritas AI
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
              <button onClick={handleLogout} className="text-sm font-medium hover:text-blue-600 transition-colors hidden sm:block">
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col items-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Detect Fake News with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              AI Precision
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Paste an article or URL to instantly verify its credibility, analyze sources, and uncover misleading information.
          </p>
        </motion.div>

        <InputPanel onAnalyze={handleAnalyze} isLoading={isLoading} />

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 max-w-3xl w-full text-center"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {result && !isLoading && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="w-full"
            >
              <ResultDashboard result={result} />
              <ExplanationPanel result={result} originalText={originalText} />
            </motion.div>
          )}
        </AnimatePresence>

        {user && <HistoryPanel />}
      </main>
    </div>
  );
}
