
import React, { useState, useCallback, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import ExplanationPanel from './components/ExplanationPanel';
import { analyzeCode } from './services/geminiService';
import type { CodeReviewResult } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import { BrainCircuitIcon, LoadingSpinner } from './components/icons';
import ThemeToggle from './components/ThemeToggle';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [code, setCode] = useState<string>('function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// This is inefficient for large n\nconsole.log(fibonacci(10));');
    const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].id);
    const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isReviewed, setIsReviewed] = useState<boolean>(false);
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };


    const handleReviewCode = useCallback(async () => {
        if (!code.trim()) {
            setError("Please enter some code to review.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setReviewResult(null);
        try {
            const result = await analyzeCode(code, language);
            setReviewResult(result);
            setIsReviewed(true);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
            setIsReviewed(false);
        } finally {
            setIsLoading(false);
        }
    }, [code, language]);

    const handleFixCode = (lineNumber: number, fix: string) => {
        const lines = code.split('\n');
        lines[lineNumber - 1] = fix;
        setCode(lines.join('\n'));

        if (reviewResult) {
            const updatedErrors = reviewResult.errors.map(err => 
                err.lineNumber === lineNumber ? { ...err, isFixed: true } : err
            );
            setReviewResult({ ...reviewResult, errors: updatedErrors });
        }
    };

    const handleApplySuggestion = (lineNumber: number, suggestion: string) => {
        const lines = code.split('\n');
        lines[lineNumber - 1] = suggestion;
        setCode(lines.join('\n'));

        if (reviewResult) {
            const updatedSuggestions = reviewResult.suggestions.map(sugg => 
                sugg.lineNumber === lineNumber ? { ...sugg, isApplied: true } : sugg
            );
            setReviewResult({ ...reviewResult, suggestions: updatedSuggestions });
        }
    };

    const handleReset = () => {
        setIsReviewed(false);
        setReviewResult(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br from-slate-900 to-slate-950 text-slate-800 dark:text-slate-300 flex flex-col p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <header className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                 <div className="flex items-center">
                    <BrainCircuitIcon />
                    <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-400">
                        AI Code Reviewer
                    </h1>
                 </div>
                 <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </header>
            
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="flex flex-col min-h-[400px] lg:min-h-0">
                    <CodeEditor
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        errors={reviewResult?.errors || []}
                        suggestions={reviewResult?.suggestions || []}
                        isReviewed={isReviewed}
                    />
                </div>
                <div className="flex flex-col min-h-[400px] lg:min-h-0">
                    <ExplanationPanel
                        reviewResult={reviewResult}
                        isLoading={isLoading}
                        error={error}
                        code={code}
                        onFix={handleFixCode}
                        onApplySuggestion={handleApplySuggestion}
                    />
                </div>
            </main>

            <footer className="mt-6 pt-6 flex justify-center items-center">
                {isReviewed ? (
                     <button
                        onClick={handleReset}
                        className="px-8 py-3 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                        Review New Code
                    </button>
                ) : (
                    <button
                        onClick={handleReviewCode}
                        disabled={isLoading}
                        className="flex items-center justify-center px-8 py-3 w-56 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Review Code'}
                    </button>
                )}
            </footer>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #94a3b8; /* slate-400 */
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155; /* slate-700 */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b; /* slate-500 */
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569; /* slate-600 */
                }
            `}</style>
        </div>
    );
};

export default App;
