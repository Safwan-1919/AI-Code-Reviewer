
export interface CodeError {
  lineNumber: number;
  errorDescription: string;
  suggestedFix: string;
  fixExplanation: string;
  isFixed?: boolean;
}

export interface CodeSuggestion {
  lineNumber: number;
  suggestion: string;
  explanation: string;
  isApplied?: boolean;
}

export interface LineExplanation {
  lineNumber: number;
  explanation: string;
}

export interface CodeReviewResult {
  overallExplanation: string;
  errors: CodeError[];
  suggestions: CodeSuggestion[];
  lineExplanations: LineExplanation[];
  output: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface ProgrammingLanguage {
  id: string;
  name: string;
}
