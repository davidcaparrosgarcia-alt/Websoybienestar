import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function AiDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  if (!user || user.email !== "davidcaparrosgarcia@gmail.com") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-surface-container-high rounded-2xl p-8 max-w-sm w-full text-center">
          <h2 className="text-xl font-bold font-headline text-error mb-2">No autorizado</h2>
          <p className="text-on-surface-variant mb-6">No tienes permisos para ver esta página.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-container hover:text-primary transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setErrorMsg('');
    
    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/api/ai-smoke-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline font-bold text-3xl text-primary mb-2">Diagnóstico IA</h1>
          <p className="text-on-surface-variant text-lg">
            Esta página solo comprueba si Gemini responde desde producción.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 mb-8">
        <button
          onClick={handleTest}
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-container hover:text-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Probando conexión...
            </>
          ) : (
            'Probar conexión IA'
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-error/10 border border-error/30 text-error p-6 rounded-2xl mb-8">
          <h3 className="font-bold mb-2">Error de red</h3>
          <p>{errorMsg}</p>
        </div>
      )}

      {result && (
        <div className={`p-6 rounded-2xl mb-8 border ${result.success ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30' : 'bg-error/5 border-error/20'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-error'}`}></div>
            <h3 className="text-xl font-bold font-headline">
              {result.success ? 'Conexión Exitosa' : 'Fallo de Conexión'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-outline-variant/20">
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Modelo Configurado</span>
              <span className="font-mono text-sm">{result.configuredModel || '-'}</span>
            </div>
            
            {result.success && result.workingModel && (
              <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-outline-variant/20">
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Modelo Funcional (Working)</span>
                <span className="font-mono text-sm font-bold text-green-600 dark:text-green-400">{result.workingModel}</span>
              </div>
            )}
          </div>
          
          <h4 className="font-bold text-sm text-on-surface-variant mb-2">Respuesta JSON Completa</h4>
          <div className="bg-black/90 text-green-400 p-6 rounded-xl overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
