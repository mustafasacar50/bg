import React from 'react';

interface AccentTextProps {
  text: string;
}

export function AccentText({ text }: AccentTextProps) {
  if (!text) return null;

  // Normalize string to separate base characters from their diacritic accents
  const normalized = text.normalize('NFD');
  const result = [];
  let i = 0;
  
  while (i < normalized.length) {
    const char = normalized[i];
    // \u0301 is the combining acute accent (ударение)
    // We also check for \u0300 (grave accent) just in case
    if (i + 1 < normalized.length && (normalized[i + 1] === '\u0301' || normalized[i + 1] === '\u0300')) {
      result.push(
        <span key={i} className="text-rose-600 font-extrabold bg-rose-50 px-[1px] rounded-sm shadow-sm border border-rose-100 mx-[1px]">
          {char}{normalized[i+1]}
        </span>
      );
      i += 2;
    } else {
      result.push(<React.Fragment key={i}>{char}</React.Fragment>);
      i++;
    }
  }

  return <>{result}</>;
}
