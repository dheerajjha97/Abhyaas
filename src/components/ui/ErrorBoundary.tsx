import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-900 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            {this.props.fallbackTitle || 'पेज लोड करने में समस्या आई'}
          </h2>

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            नेटवर्क या ब्राउज़र कैश के कारण कोई अस्थायी त्रुटि हुई है। कृपया पेज को पुनः लोड करें या होम पेज पर जाएँ।
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>पेज पुनः लोड करें</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>होम पेज</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
