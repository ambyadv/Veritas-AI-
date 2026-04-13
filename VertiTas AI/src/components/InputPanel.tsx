import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Link as LinkIcon, FileText, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputPanelProps {
  onAnalyze: (input: string, isUrl: boolean) => void;
  isLoading: boolean;
}

export default function InputPanel({ onAnalyze, isLoading }: InputPanelProps) {
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onAnalyze(inputValue, inputType === 'url');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-panel rounded-2xl p-6 w-full max-w-3xl mx-auto"
    >
      <div className="flex gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInputType('text')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors",
            inputType === 'text' 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <FileText size={18} />
          Paste Text
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInputType('url')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors",
            inputType === 'url' 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <LinkIcon size={18} />
          News URL
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative overflow-hidden rounded-xl">
          <AnimatePresence mode="wait">
            {inputType === 'text' ? (
              <motion.div
                key="text-input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste the news article text here..."
                  className="w-full h-40 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-slate-400"
                />
              </motion.div>
            ) : (
              <motion.div
                key="url-input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="url"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://example.com/news-article"
                  className="w-full py-4 pl-12 pr-4 rounded-xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Analyzing...
            </>
          ) : (
            <>
              <Search size={24} />
              Detect Fake News
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
