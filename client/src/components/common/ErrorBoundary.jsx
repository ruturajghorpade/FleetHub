// FleetHub – Error Boundary Component
import { Component } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineArrowPath } from 'react-icons/hi2';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-950 p-6">
          <div className="text-center max-w-md">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6">
              <HiOutlineExclamationTriangle className="w-8 h-8 text-red-500" />
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {/* Error details (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <pre className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/5 text-left text-xs text-red-700 dark:text-red-400 overflow-auto max-h-40 border border-red-100 dark:border-red-500/10">
                {this.state.error.toString()}
              </pre>
            )}

            {/* Action */}
            <button onClick={this.handleReload} className="btn-primary">
              <HiOutlineArrowPath className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
