import { useState } from 'react';
import { motion } from 'motion/react';
import { Info, Copy, Check } from 'lucide-react';
import type { AnalysisResult } from '../types';

interface ExplanationPanelProps {
  result: AnalysisResult;
  originalText: string;
}

export default function ExplanationPanel({ result, originalText }: ExplanationPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Highlight suspicious words in the text
  const highlightText = () => {
    if (!originalText || !result.suspiciousWords || result.suspiciousWords.length === 0) {
      return <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{originalText || "No text provided."}</p>;
    }

    // Create a regex to match any of the suspicious words (case insensitive)
    // Escape special characters in words
    const escapedWords = result.suspiciousWords.map(w => w.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&'));
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    
    const parts = originalText.split(regex);
    
    return (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        {parts.map((part, i) => {
          const isSuspicious = result.suspiciousWords.some(
            word => word.toLowerCase() === part.toLowerCase()
          );
          
          if (isSuspicious) {
            return (
              <span key={i} className="bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200 px-1 rounded font-medium border-b border-red-400">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-5xl mx-auto mt-6 space-y-6"
    >
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        {result.summary && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="text-indigo-500" />
              Article Summary
            </h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 md:p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
              <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Info className="text-blue-500" />
            Why is this {result.label.toLowerCase()}?
          </h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Copy explanation to clipboard"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 mb-6">
          <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed">
            {result.explanation}
          </p>
        </div>

        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Text Analysis (Suspicious keywords highlighted)
        </h4>
        <div className="bg-white/50 dark:bg-black/20 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
          {highlightText()}
        </div>
      </div>
    </motion.div>
  );
}
