'use client';

import { useState, useEffect, useCallback } from 'react';

export type SRSLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSItem {
  id: string;
  type: 'question' | 'word';
  level: SRSLevel;
  nextReviewDate: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: number;
}

export function useSRS() {
  const [srsData, setSrsData] = useState<Record<string, SRSItem>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bg_srs_data');
      if (stored) {
        setSrsData(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load SRS data', e);
    }
    setIsLoaded(true);
  }, []);

  const saveSrsData = useCallback((newData: Record<string, SRSItem>) => {
    setSrsData(newData);
    localStorage.setItem('bg_srs_data', JSON.stringify(newData));
  }, []);

  const getNextReviewInterval = useCallback((level: SRSLevel): number => {
    const now = Date.now();
    switch (level) {
      case 0: return now;
      case 1: return now + 1000 * 60 * 10;
      case 2: return now + 1000 * 60 * 60 * 24;
      case 3: return now + 1000 * 60 * 60 * 24 * 3;
      case 4: return now + 1000 * 60 * 60 * 24 * 7;
      case 5: return now + 1000 * 60 * 60 * 24 * 30;
      default: return now;
    }
  }, []);

  const processReview = useCallback((id: string, type: 'question' | 'word', isCorrect: boolean, forceLevel?: number) => {
    setSrsData(prev => {
      const key = `${type}_${id}`;
      const now = Date.now();
      const item = prev[key] || {
        id,
        type,
        level: 0,
        nextReviewDate: now,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: 0
      };

      let newLevel = item.level;
      
      if (forceLevel !== undefined) {
        newLevel = forceLevel as SRSLevel;
      } else {
        if (isCorrect) {
          newLevel = Math.min(5, newLevel + 1) as SRSLevel;
          item.correctCount++;
        } else {
          newLevel = Math.max(0, newLevel - 1) as SRSLevel;
          item.incorrectCount++;
        }
      }

      const updatedItem = {
        ...item,
        level: newLevel,
        lastReviewed: now,
        nextReviewDate: getNextReviewInterval(newLevel)
      };

      const newData = {
        ...prev,
        [key]: updatedItem
      };
      
      localStorage.setItem('bg_srs_data', JSON.stringify(newData));
      return newData;
    });
  }, [getNextReviewInterval]);

  const getDueItems = useCallback((type: 'question' | 'word', allIds: string[]): string[] => {
    const now = Date.now();
    
    const unseen = allIds.filter(id => !srsData[`${type}_${id}`]);
    
    const due = allIds
      .filter(id => {
        const item = srsData[`${type}_${id}`];
        return item && item.nextReviewDate <= now;
      })
      .sort((a, b) => {
        return srsData[`${type}_${a}`].nextReviewDate - srsData[`${type}_${b}`].nextReviewDate;
      });

    return [...due, ...unseen];
  }, [srsData]);

  return {
    srsData,
    isLoaded,
    processReview,
    getDueItems
  };
}
