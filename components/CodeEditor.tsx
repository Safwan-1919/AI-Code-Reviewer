
import React from 'react';
import LanguageSelector from './LanguageSelector';
import type { CodeError, CodeSuggestion } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  errors: CodeError[];
  suggestions: CodeSuggestion[];
  isReviewed: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, language, setLanguage, errors, suggestions, isReviewed }) => {
  const codeLines = code.split('\n');

  const getLineError = (lineNumber: number) => {
    return errors.find(e => e.lineNumber === lineNumber);
  };
  
  const getLineSuggestion = (lineNumber: number) => {
    return suggestions.find(s => s.lineNumber === lineNumber);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  return (
    <div className="bg-slate-100 dark:bg-black/20 rounded-xl h-full flex flex-col border border-slate-200 dark:border-white/10 shadow-lg transition-colors">
       <div className="px-4 pt-4">
        <LanguageSelector
            languages={SUPPORTED_LANGUAGES}
            selectedLanguage={language}
            onLanguageChange={setLanguage}
        />
       </div>
      <div className="relative flex-grow font-mono text-sm group">
        {!isReviewed ? (
          <textarea
            value={code}
            onChange={handleCodeChange}
            className="absolute inset-0 w-full h-full bg-transparent text-slate-800 dark:text-slate-300 p-4 resize-none leading-relaxed custom-scrollbar focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Paste your code snippet here..."
            spellCheck="false"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full overflow-auto p-4 custom-scrollbar">
            <pre className="whitespace-pre-wrap">
              {codeLines.map((line, index) => {
                const lineNumber = index + 1;
                const error = getLineError(lineNumber);
                const suggestion = getLineSuggestion(lineNumber);
                let lineClass = 'transition-colors duration-300 rounded-md px-2 py-0.5 -mx-2';
                let lineContainerClass = 'flex items-start group relative';

                if (error) {
                    lineClass += error.isFixed 
                        ? ' bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' 
                        : ' bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300';
                } else if (suggestion) {
                    lineClass += suggestion.isApplied
                        ? ' bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : ' bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300';
                }

                return (
                  <div key={index} className={lineContainerClass}>
                    <span className="text-right pr-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 select-none flex-shrink-0 w-12 transition-colors">{lineNumber}</span>
                    <div className="flex-grow">
                      <div className={lineClass}>
                        <code className="text-slate-800 dark:text-slate-300">{line || ' '}</code>
                      </div>
                    </div>
                  </div>
                );
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
