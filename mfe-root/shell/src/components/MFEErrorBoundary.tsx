import React from "react";

type Props = {
  name: string;
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

class MFEErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[MFE ERROR] ${this.props.name}`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-red-300 rounded bg-red-50 text-center">
          <h2 className="text-lg font-semibold text-red-700">
            {this.props.name} failed to load
          </h2>

          <p className="text-sm text-red-600 mt-2">
            Something went wrong while loading this section.
          </p>

          <button
            onClick={this.handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MFEErrorBoundary;
