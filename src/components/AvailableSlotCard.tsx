import React from 'react';
import { Button } from './Button';
import { Plus } from 'lucide-react';
import { Page } from '../types';
import { motion } from 'motion/react';

interface AvailableSlotCardProps {
  setCurrentPage?: (p: Page) => void;
  index?: number;
}

export function AvailableSlotCard({ setCurrentPage, index = 0 }: AvailableSlotCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index, 8) * 0.05 
      }}
      className="border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-none bg-zinc-50/40 dark:bg-zinc-900/10 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/10 p-3 sm:p-4 flex flex-col justify-between aspect-[3/4] w-full text-center hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 relative z-10"
    >
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-2 sm:mb-3 shadow-inner">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-pulse" />
        </div>
        <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold mb-1">
          Available Slot
        </div>
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 max-w-[140px] sm:max-w-[180px] leading-relaxed">
          This slot is open for a new curated project.
        </p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setCurrentPage && setCurrentPage('CREATOR_PORTAL')}
        className="w-full flex items-center justify-center gap-1.5 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 font-bold py-1.5 text-[10px] sm:text-xs rounded-lg"
      >
        <Plus className="w-3.5 h-3.5" />
        Submit Token
      </Button>
    </motion.div>
  );
}
