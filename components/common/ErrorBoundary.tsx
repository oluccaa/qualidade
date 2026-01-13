
import React from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Componente de fronteira de erro para capturar exceções no ciclo de vida do React.
 */
// Use React.Component explicitly to ensure TypeScript correctly identifies inherited members like setState and props
export class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Explicitly initializing state to ensure instance properties are correctly recognized by the TypeScript compiler via inheritance.
  public state: State = {
    hasError: false
  };

  /**
   * Método estático para atualizar o estado quando ocorre um erro.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    // Access state directly as it's now properly inherited and typed
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h1>
            <p className="text-slate-500 mb-8 text-sm">
              Ocorreu um erro inesperado. Isso geralmente acontece por um conflito de conexão ou atualização do sistema.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Standard setState call now correctly identified by the compiler
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                <RefreshCw size={18} /> Recarregar Portal
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center gap-2 bg-white text-slate-600 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <Home size={18} /> Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Access props directly as it's now properly inherited and typed from React.Component
    return this.props.children;
  }
}
