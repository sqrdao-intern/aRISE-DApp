import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonTransactionCard() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-700 animate-pulse">
      <div className="w-8 h-8 bg-gray-600 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-600 rounded w-1/2" />
        <div className="h-3 bg-gray-600 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
} 