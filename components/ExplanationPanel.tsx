
import React from 'react';
import type { CodeReviewResult, CodeSuggestion } from '../types';
import { 
    LoadingSpinner, CheckCircleIcon, ExclamationCircleIcon, BrainCircuitIcon, 
    CodeBracketSquareIcon, MagicWandIcon, LightBulbIcon, TerminalIcon, ClockIcon, ServerIcon
} from './icons';

interface ExplanationPanelProps {
  reviewResult: CodeReviewResult | null;
  isLoading: boolean;
  error: string | null;
  code: string;
  onFix: (lineNumber: number, fix: string) => void;
  onApplySuggestion: (lineNumber: number, suggestion: string) => void;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ reviewResult, isLoading, error, code, onFix, onApplySuggestion }) => {
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-400 text-center p-8">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg font-medium">AI is reviewing your code...</p>
                    <p className="text-sm text-slate-500">This may take a few moments.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-rose-600 dark:text-rose-400 text-center p-8">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                        <ExclamationCircleIcon />
                    </div>
                    <p className="mt-2 text-lg font-semibold">An Error Occurred</p>
                    <p className="text-sm text-rose-500 dark:text-rose-400/80">{error}</p>
                </div>
            );
        }

        if (!reviewResult) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-8">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center mb-4">
                        <BrainCircuitIcon />
                    </div>
                    <p className="mt-2 text-lg font-medium">AI Analysis Panel</p>
                    <p className="text-sm">Your code's analysis will appear here after review.</p>
                </div>
            );
        }

        const codeLines = code.split('\n');

        return (
            <div className="p-1">
                <div className="bg-white dark:bg-slate-800/40 rounded-lg p-4 mb-6 border border-slate-200 dark:border-white/10">
                    <h3 className="text-lg font-semibold text-sky-500 dark:text-sky-400 mb-2 flex items-center"><BrainCircuitIcon/> Code Summary</h3>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{reviewResult.overallExplanation}</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-sky-500 dark:text-sky-400 mb-3 flex items-center"><CodeBracketSquareIcon />Line-by-Line Analysis</h3>
                    {reviewResult.errors.length === 0 && reviewResult.suggestions.length === 0 && (
                         <div className="flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 text-sm rounded-lg p-4 mb-4">
                           <CheckCircleIcon />
                           <span className="ml-3 font-medium">Great job! No errors or suggestions.</span>
                        </div>
                    )}
                    <div className="space-y-3">
                        {codeLines.map((line, index) => {
                            const lineNumber = index + 1;
                            const explanation = reviewResult.lineExplanations.find(e => e.lineNumber === lineNumber);
                            const error = reviewResult.errors.find(e => e.lineNumber === lineNumber);
                            const suggestion = reviewResult.suggestions.find(s => s.lineNumber === lineNumber);
                            
                            let borderClass = 'border-l-4 border-transparent';
                            if (error) {
                                borderClass = error.isFixed ? 'border-l-4 border-emerald-500' : 'border-l-4 border-rose-500';
                            } else if (suggestion) {
                                borderClass = suggestion.isApplied ? 'border-l-4 border-emerald-500' : 'border-l-4 border-amber-500';
                            }

                            return (
                                <div key={index} className={`bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden transition-all duration-300 ${borderClass}`}>
                                    <div className="p-4">
                                        <div className="flex items-start font-mono text-sm">
                                            <span className="text-right pr-4 text-slate-400 dark:text-slate-500 select-none">{lineNumber}</span>
                                            <code className="flex-grow text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{line || ' '}</code>
                                        </div>
                                        {explanation && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-8">{explanation.explanation}</p>
                                        )}
                                        {error && (
                                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 ml-8">
                                                <div className="flex items-center mb-2">
                                                    {error.isFixed ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                                                    <p className="ml-2 font-semibold text-slate-800 dark:text-slate-200">
                                                        Issue {error.isFixed ? <span className="text-emerald-500 dark:text-emerald-400">(Fixed)</span> : ''}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 ml-7">{error.errorDescription}</p>
                                                
                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 ml-7">
                                                    <h5 className="font-semibold text-xs text-sky-500 dark:text-sky-400 mb-1.5 uppercase tracking-wider">Explanation</h5>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{error.fixExplanation}</p>
                                                </div>

                                                {!error.isFixed && (
                                                    <div className="mt-4 ml-7 flex justify-end">
                                                        <button 
                                                            onClick={() => onFix(lineNumber, error.suggestedFix)}
                                                            className="flex items-center px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                        >
                                                            <MagicWandIcon />
                                                            Apply Fix
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {suggestion && !error && (
                                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 ml-8">
                                                <div className="flex items-center mb-2">
                                                    {suggestion.isApplied ? <CheckCircleIcon /> : <LightBulbIcon />}
                                                    <p className="ml-2 font-semibold text-slate-800 dark:text-slate-200">
                                                        Suggestion {suggestion.isApplied ? <span className="text-emerald-500 dark:text-emerald-400">(Applied)</span> : ''}
                                                    </p>
                                                </div>
                                                
                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 ml-7">
                                                    <h5 className="font-semibold text-xs text-amber-500 dark:text-amber-400 mb-1.5 uppercase tracking-wider">Explanation</h5>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{suggestion.explanation}</p>
                                                </div>

                                                {!suggestion.isApplied && (
                                                    <div className="mt-4 ml-7 flex justify-end">
                                                        <button 
                                                            onClick={() => onApplySuggestion(lineNumber, suggestion.suggestion)}
                                                            className="flex items-center px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        >
                                                            <MagicWandIcon />
                                                            Use Suggestion
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800/40 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-semibold text-sky-500 dark:text-sky-400 mb-3 flex items-center"><TerminalIcon/> Output</h3>
                        <pre className="text-sm bg-slate-100 dark:bg-black/30 rounded-md p-3 custom-scrollbar text-slate-700 dark:text-slate-300 whitespace-pre-wrap"><code>{reviewResult.output || 'No output captured.'}</code></pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800/40 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-semibold text-sky-500 dark:text-sky-400 mb-2 flex items-center"><ClockIcon/> Time Complexity</h3>
                            <p className="text-slate-700 dark:text-slate-300 font-mono text-center text-lg font-bold py-2">{reviewResult.timeComplexity}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800/40 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-semibold text-sky-500 dark:text-sky-400 mb-2 flex items-center"><ServerIcon/> Space Complexity</h3>
                            <p className="text-slate-700 dark:text-slate-300 font-mono text-center text-lg font-bold py-2">{reviewResult.spaceComplexity}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-100 dark:bg-black/20 rounded-xl h-full overflow-y-auto p-4 custom-scrollbar border border-slate-200 dark:border-white/10 shadow-lg transition-colors">
            {renderContent()}
        </div>
    );
};

export default ExplanationPanel;
