import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'motion/react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AnalysisLog } from '../types';

export default function HistoryPanel() {
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, 'analysisLogs'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const newLogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as AnalysisLog[];
          setLogs(newLogs);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching history:", error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setLogs([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return null;
  if (logs.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto mt-12"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <Clock size={20} />
        Recent Analyses
      </h3>
      
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {logs.map((log) => (
          <motion.div 
            key={log.id} 
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-panel p-4 rounded-2xl flex flex-col justify-between cursor-default"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
              "{log.inputText}"
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1">
                {log.label === 'FAKE' ? (
                  <AlertTriangle size={16} className="text-red-500" />
                ) : (
                  <CheckCircle size={16} className="text-emerald-500" />
                )}
                <span className={`font-bold text-sm ${log.label === 'FAKE' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {log.label} ({log.confidence}%)
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(log.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
