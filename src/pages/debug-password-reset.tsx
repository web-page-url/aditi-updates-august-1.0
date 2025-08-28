import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import Head from 'next/head';

export default function DebugPasswordReset() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [environmentInfo, setEnvironmentInfo] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);

  useEffect(() => {
    // Gather environment information
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY_SET: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_KEY_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10),
      CURRENT_DOMAIN: typeof window !== 'undefined' ? window.location.origin : 'SSR',
      USER_AGENT: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      TIMESTAMP: new Date().toISOString()
    };
    setEnvironmentInfo(envInfo);

    // Test Supabase connection
    const testSupabase = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setSupabaseStatus({
          connected: !error,
          session: !!data.session,
          error: error?.message,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        setSupabaseStatus({
          connected: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    };

    testSupabase();
  }, []);

  const testPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setDebugInfo(null);

    try {
      console.log('🔍 STARTING PASSWORD RESET DEBUG TEST');
      console.log('📧 Email:', email);
      
      // Test all URL generation methods
      const urlTests = {
        env_url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password` : null,
        window_url: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : null,
        fallback_url: 'https://aditi-daily-updates.vercel.app/reset-password'
      };

      console.log('🔗 URL Generation Tests:', urlTests);

      // Use the same logic as the real password reset function
      const getRedirectUrl = () => {
        if (process.env.NEXT_PUBLIC_SITE_URL) {
          return `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`;
        }
        if (typeof window !== 'undefined') {
          return `${window.location.origin}/reset-password`;
        }
        return 'https://aditi-daily-updates.vercel.app/reset-password';
      };

      const finalRedirectUrl = getRedirectUrl();
      console.log('🎯 Final redirect URL:', finalRedirectUrl);

      // Attempt password reset
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: finalRedirectUrl
      });

      const debugResult = {
        success: !error,
        email: email,
        redirectUrl: finalRedirectUrl,
        urlTests: urlTests,
        supabaseResponse: {
          data: data,
          error: error?.message,
          errorCode: error?.code,
          errorDetails: error
        },
        environment: environmentInfo,
        supabaseConnection: supabaseStatus,
        timestamp: new Date().toISOString()
      };

      console.log('📊 DEBUG RESULT:', debugResult);
      setDebugInfo(debugResult);

      if (error) {
        console.error('❌ Password reset failed:', error);
        toast.error(`Password reset failed: ${error.message}`);
      } else {
        console.log('✅ Password reset request sent successfully');
        toast.success('Password reset email sent! Check the debug information below.');
      }

    } catch (error: any) {
      console.error('❌ Unexpected error:', error);
      const errorResult = {
        success: false,
        email: email,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(errorResult);
      toast.error('Unexpected error occurred. Check debug info below.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white p-4">
      <Head>
        <title>Password Reset Debug Tool | Aditi Daily Updates</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-purple-400">🔧 Password Reset Debug Tool</h1>
          <p className="text-gray-300">Comprehensive testing and debugging for Vercel password reset issues</p>
        </div>

        {/* Test Form */}
        <div className="bg-[#1e2538] p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-400">📧 Test Password Reset</h2>
          <form onSubmit={testPasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address to Test
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-[#262d40] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              {isLoading ? '🔄 Testing...' : '🚀 Test Password Reset'}
            </button>
          </form>
        </div>

        {/* Environment Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#1e2538] p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400">🌍 Environment Information</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(environmentInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-[#1e2538] p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-400">⚡ Supabase Connection Status</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(supabaseStatus, null, 2)}
            </pre>
          </div>
        </div>

        {/* Debug Results */}
        {debugInfo && (
          <div className="bg-[#1e2538] p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-red-400">🔍 Debug Results</h2>
            
            {/* Success/Failure Indicator */}
            <div className={`p-4 rounded-md mb-4 ${debugInfo.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
              <div className="flex items-center">
                <span className="text-2xl mr-2">{debugInfo.success ? '✅' : '❌'}</span>
                <span className="font-bold">
                  {debugInfo.success ? 'Password Reset Request Successful' : 'Password Reset Request Failed'}
                </span>
              </div>
            </div>

            {/* Detailed Results */}
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Quick Fix Guide */}
        <div className="bg-yellow-900/30 border border-yellow-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-yellow-300">🛠️ Common Issues & Quick Fixes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-yellow-200 mb-2">❌ If NEXT_PUBLIC_SITE_URL is null:</h3>
              <ul className="text-sm space-y-1 text-yellow-100">
                <li>• Go to Vercel Dashboard → Environment Variables</li>
                <li>• Add: NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app</li>
                <li>• Redeploy your application</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-yellow-200 mb-2">❌ If Supabase connection fails:</h3>
              <ul className="text-sm space-y-1 text-yellow-100">
                <li>• Check NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• Check NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>• Verify Supabase project is active</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-yellow-200 mb-2">❌ If password reset fails:</h3>
              <ul className="text-sm space-y-1 text-yellow-100">
                <li>• Check Supabase Auth → URL Configuration</li>
                <li>• Add your Vercel domain to redirect URLs</li>
                <li>• Verify email template settings</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-yellow-200 mb-2">❌ If rate limited:</h3>
              <ul className="text-sm space-y-1 text-yellow-100">
                <li>• Wait 5+ minutes between attempts</li>
                <li>• Try a different email address</li>
                <li>• Check Supabase rate limits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 