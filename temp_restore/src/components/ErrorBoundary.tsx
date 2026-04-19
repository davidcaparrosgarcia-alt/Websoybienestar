import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-8">
          <div className="bg-error-container text-on-error-container p-8 rounded-2xl max-w-2xl w-full shadow-lg">
            <h1 className="text-2xl font-headline font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              Algo salió mal
            </h1>
            <p className="font-body mb-4">Ha ocurrido un error inesperado en la aplicación.</p>
            <pre className="bg-black/10 p-4 rounded-lg overflow-auto text-sm font-mono">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-error text-on-error px-6 py-2 rounded-full font-label font-bold hover:opacity-90 transition-opacity"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
