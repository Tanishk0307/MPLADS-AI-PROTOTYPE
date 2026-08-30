import { StrictMode, Component, type ReactNode, type ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from '@/context/LanguageContext';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Application Crash Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: '600px', width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#f87171' }}>Portal Render Notice</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>{this.state.error?.message || 'An unexpected rendering error occurred.'}</p>
            <div style={{ textAlign: 'left', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0', maxHeight: '160px', overflowY: 'auto', marginBottom: '20px' }}>
              {this.state.error?.stack || String(this.state.error)}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch {}
                  window.location.reload();
                }}
                style={{ padding: '10px 20px', backgroundColor: '#e11d48', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                Clear Cache & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                Reload Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
);
