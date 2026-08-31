import { useState, useCallback } from 'react';
import type { ConnectionTestResult } from '~/components/@settings/shared/service-integration';

interface UseConnectionTestOptions {
  testEndpoint: string;
  serviceName: string;
  getUserIdentifier?: (data: any) => string;
}

export function useConnectionTest({ testEndpoint, serviceName, getUserIdentifier }: UseConnectionTestOptions) {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  const testConnection = useCallback(async () => {
    setTestResult({
      status: 'testing',
      message: 'Testando conexão…',
    });

    try {
      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userIdentifier = getUserIdentifier ? getUserIdentifier(data) : 'usuário';

        setTestResult({
          status: 'success',
          message: `Conectado ao ${serviceName} como ${userIdentifier}`,
          timestamp: Date.now(),
        });
      } else {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        setTestResult({
          status: 'error',
          message: `Não foi possível conectar: ${errorData.error || `${response.status} ${response.statusText}`}`,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: `Não foi possível conectar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      });
    }
  }, [testEndpoint, serviceName, getUserIdentifier]);

  const clearTestResult = useCallback(() => {
    setTestResult(null);
  }, []);

  return {
    testResult,
    testConnection,
    clearTestResult,
    isTestingConnection: testResult?.status === 'testing',
  };
}
