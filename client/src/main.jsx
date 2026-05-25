import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/certnova-prose.css';
import App from './App.jsx';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Unknown runtime error',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed at startup:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
          <h2>CertNova failed to render</h2>
          <p>{this.state.message}</p>
          <p>Open browser console for stack trace details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
