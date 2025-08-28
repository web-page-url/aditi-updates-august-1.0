import { useEffect, useState } from 'react';
import { useAuth } from '../lib/authContext';

interface AuthDebuggerProps {
  showDebugger?: boolean;
}

export default function AuthDebugger({ showDebugger = false }: AuthDebuggerProps) {
  const { user, isLoading } = useAuth();
  const [authStates, setAuthStates] = useState<Array<{ time: string; isLoading: boolean; hasUser: boolean; userEmail?: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const newState = {
      time: new Date().toLocaleTimeString(),
      isLoading,
      hasUser: !!user,
      userEmail: user?.email
    };
    
    setAuthStates(prev => {
      const updated = [newState, ...prev.slice(0, 9)]; // Keep last 10 states
      return updated;
    });
    setLastUpdate(new Date());
  }, [user, isLoading]);

  if (!showDebugger) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm text-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-yellow-400">Auth State Debug</h3>
        <span className="text-gray-400">{lastUpdate.toLocaleTimeString()}</span>
      </div>
      
      <div className="mb-2">
        <div className={`inline-block px-2 py-1 rounded text-xs ${
          isLoading ? 'bg-yellow-600' : 'bg-green-600'
        }`}>
          {isLoading ? 'LOADING' : 'READY'}
        </div>
        
        <div className={`inline-block px-2 py-1 rounded text-xs ml-2 ${
          user ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {user ? `USER: ${user.email}` : 'NO USER'}
        </div>
      </div>

      <div className="space-y-1 max-h-32 overflow-y-auto">
        <div className="text-gray-400 text-xs mb-1">Recent States:</div>
        {authStates.map((state, index) => (
          <div key={index} className="text-xs opacity-80">
            <span className="text-gray-400">{state.time}</span>
            <span className={`ml-2 ${state.isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
              {state.isLoading ? 'Loading' : 'Ready'}
            </span>
            <span className={`ml-2 ${state.hasUser ? 'text-green-400' : 'text-red-400'}`}>
              {state.hasUser ? `✓ ${state.userEmail}` : '✗ No user'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
        Tab switch to see state changes
      </div>
    </div>
  );
}