import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Check if it's a dynamic import failure (e.g., chunk loading error due to a new deployment)
    const errorStr = error ? error.toString() : '';
    if (
      errorStr.includes("Failed to fetch dynamically imported module") ||
      errorStr.includes("Loading chunk") ||
      errorStr.includes("dynamic import") ||
      errorStr.includes("typeerror") && errorStr.includes("imported module")
    ) {
      console.warn("Dynamic import failed. Forcing a hard reload to sync with the latest build...");
      window.location.reload();
      return;
    }

    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-brand-100 max-w-2xl w-full">
            <h1 className="text-4xl font-serif font-bold text-brand-900 mb-6">Oops! Something went wrong.</h1>
            <p className="text-gray-600 mb-8 text-lg">We apologize for the inconvenience. A critical error has occurred in the application.</p>
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-left overflow-auto max-h-64 mb-8">
               <p className="font-mono text-sm text-red-800 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
               <pre className="font-mono text-xs text-red-600 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
            <button 
              onClick={() => window.location.href = '/'} 
              className="bg-brand-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
