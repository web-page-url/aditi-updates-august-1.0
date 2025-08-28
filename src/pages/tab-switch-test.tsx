import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TabSwitchTest() {
  const [switchCount, setSwitchCount] = useState(0);
  const [lastSwitchTime, setLastSwitchTime] = useState<Date | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [renderTime] = useState(new Date());

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!isVisible) {
          // Tab became visible
          setSwitchCount(prev => prev + 1);
          setLastSwitchTime(new Date());
          setIsVisible(true);
          console.log('✅ Tab became visible - NO REFRESH triggered!');
        }
      } else {
        // Tab became hidden
        setIsVisible(false);
        console.log('👁️ Tab became hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isVisible]);

  return (
    <>
      <Head>
        <title>Tab Switch Test - Aditi Daily Updates</title>
      </Head>
      
      <div className="min-h-screen bg-[#1a1f2e] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1e2538] rounded-lg p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Tab Switch Test
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#262d40] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Test Status</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Page Render Time:</span>
                    <span className="text-green-400">{renderTime.toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Tab Switches:</span>
                    <span className="text-yellow-400 font-bold">{switchCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Last Switch:</span>
                    <span className="text-blue-400">
                      {lastSwitchTime ? lastSwitchTime.toLocaleTimeString() : 'None'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Currently Visible:</span>
                    <span className={isVisible ? 'text-green-400' : 'text-red-400'}>
                      {isVisible ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#262d40] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Test Instructions</h2>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-[#1a1f2e] rounded border-l-4 border-yellow-500">
                    <p className="font-semibold text-yellow-400">How to Test:</p>
                    <ol className="mt-2 space-y-1 list-decimal list-inside">
                      <li>Note the render time above</li>
                      <li>Switch to another browser tab</li>
                      <li>Switch back to this tab</li>
                      <li>Check if the render time changed</li>
                    </ol>
                  </div>
                  
                  <div className="p-3 bg-[#1a1f2e] rounded border-l-4 border-green-500">
                    <p className="font-semibold text-green-400">Expected Result:</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Render time should NOT change</li>
                      <li>Tab switch counter should increase</li>
                      <li>No page refresh should occur</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-[#1a1f2e] rounded border-l-4 border-red-500">
                    <p className="font-semibold text-red-400">If Page Refreshes:</p>
                    <p className="mt-2">The fix didn't work completely. Check browser console for errors.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="p-4 bg-[#262d40] rounded-lg border border-purple-500">
                <p className="text-lg">
                  {switchCount === 0 ? (
                    <span className="text-yellow-400">🔄 Waiting for first tab switch...</span>
                  ) : (
                    <span className="text-green-400">
                      ✅ {switchCount} tab switch{switchCount > 1 ? 'es' : ''} detected - No refreshes!
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setSwitchCount(0);
                  setLastSwitchTime(null);
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reset Counter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}