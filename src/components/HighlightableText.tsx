'use client';
import React from 'react';

interface HighlightableTextProps {
  text: string;
  unknownWords: string[];
  onWordClick: (word: string) => void;
  className?: string;
}

export function HighlightableText({ text, unknownWords, onWordClick, className = '' }: HighlightableTextProps) {
  if (!text) return null;
  
  if (!unknownWords || unknownWords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  let parts: string[] = [text];
  let hasRegexError = false;

  try {
    const escapedWords = unknownWords
      .map(w => w.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
      .filter(w => w.length > 0);
      
    if (escapedWords.length > 0) {
      const regexPattern = `(?<=^|[^А-Яа-яA-Za-z0-9_])(${escapedWords.join('|')})(?=$|[^А-Яа-яA-Za-z0-9_])`;
      const regex = new RegExp(regexPattern, 'gi');
      parts = text.split(regex);
    }
  } catch (e) {
    console.error("Regex error in HighlightableText:", e);
    hasRegexError = true;
  }

  if (hasRegexError) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isUnknown = unknownWords.some(w => w.toLowerCase() === part.toLowerCase());
        
        if (isUnknown) {
          return (
            <span 
              key={index} 
              className="bg-amber-200 text-amber-900 cursor-pointer rounded px-1 transition-colors hover:bg-amber-300 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onWordClick(part);
              }}
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
