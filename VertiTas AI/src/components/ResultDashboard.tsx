import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck, ShieldQuestion, ExternalLink } from 'lucide-react';
import type { AnalysisResult } from '../types';

interface ResultDashboardProps {
  result: AnalysisResult;
}

export default function ResultDashboard({ result }: ResultDashboardProps) {
  const isFake = result.label === 'FAKE';
  
  // Determine color based on label and confidence
  const colorClass = isFake ? 'text-red-500' : 'text-emerald-500';
  const bgClass = isFake ? 'bg-red-500/10' : 'bg-emerald-500/10';
  const borderClass = isFake ? 'border-red-500/20' : 'border-emerald-500/20';
  const gradientClass = isFake ? 'from-red-500 to-orange-500' : 'from-emerald-500 to-teal-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto mt-8">
      {/* Main Verdict Panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 ${borderClass} ${bgClass}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="mb-4"
        >
          {isFake ? (
            <AlertTriangle size={80} className="text-red-500" />
          ) : (
            <CheckCircle size={80} className="text-emerald-500" />
          )}
        </motion.div>
        
        <h2 className="text-2xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
          Verdict
        </h2>
        <div className={`text-6xl font-black mb-6 bg-gradient-to-r ${gradientClass} text-transparent bg-clip-text`}>
          {result.label}
        </div>

        {/* Confidence Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-slate-600 dark:text-slate-300">Confidence</span>
            <span className={colorClass}>{result.confidence}%</span>
          </div>
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              className={`h-full bg-gradient-to-r ${gradientClass}`}
            />
          </div>
        </div>
      </motion.div>

      {/* Credibility & Fact Check Panel */}
      <div className="space-y-6">
        {/* Source Credibility */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-3xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            {result.sourceCredibility === 'Trusted' && <ShieldCheck className="text-emerald-500" />}
            {result.sourceCredibility === 'Suspicious' && <ShieldAlert className="text-red-500" />}
            {result.sourceCredibility === 'Unknown' && <ShieldQuestion className="text-amber-500" />}
            Source Credibility
          </h3>
          
          <div className="flex items-end gap-4">
            <div className="text-3xl font-bold">
              {result.sourceCredibility}
            </div>
            <div className="text-slate-500 dark:text-slate-400 mb-1 font-medium">
              Score: {result.sourceScore}/100
            </div>
          </div>
          
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${result.sourceScore}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className={`h-full ${
                result.sourceScore > 70 ? 'bg-emerald-500' : 
                result.sourceScore > 40 ? 'bg-amber-500' : 'bg-red-500'
              }`}
            />
          </div>
        </motion.div>

        {/* Fact Checks */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-3xl p-6 flex-1"
        >
          <h3 className="text-lg font-bold mb-4">Related Fact Checks</h3>
          {result.factChecks && result.factChecks.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-4 max-h-[200px] overflow-y-auto pr-2"
            >
              {result.factChecks.map((fc, idx) => (
                <motion.div 
                  key={idx} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <p className="font-medium text-sm mb-1">"{fc.claim}"</p>
                  <div className="flex justify-between items-center text-xs mt-2">
                    <span className="text-slate-500">{fc.publisher}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        fc.verdict.toLowerCase().includes('false') || fc.verdict.toLowerCase().includes('fake') 
                          ? 'text-red-500' 
                          : fc.verdict.toLowerCase().includes('true') ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {fc.verdict}
                      </span>
                      {fc.url && (
                        <a href={fc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-slate-500 dark:text-slate-400 text-sm italic">
              <p>No related fact checks found for this specific claim.</p>
              {result.factCheckApiEnabled === false && (
                <p className="mt-2 text-xs text-amber-500 not-italic">
                  ⚠️ Google Fact Check API key is missing. Please add GOOGLE_API_KEY to your environment variables.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
