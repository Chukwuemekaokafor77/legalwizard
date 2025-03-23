import React, { Component } from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
    // Log to error monitoring service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <AlertCircle size={48} />
          <h2>Application Error</h2>
          <p>We've encountered an unexpected error. Our team has been notified.</p>
          <button onClick={this.handleReset}>
            Restart Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}