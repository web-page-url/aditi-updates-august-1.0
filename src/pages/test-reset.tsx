import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';

export default function TestReset() {
  const [urlInfo, setUrlInfo] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const analyzeUrl = () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash;
      const search = window.location.search;
      const href = window.location.href;
      const pathname = window.location.pathname;
      const origin = window.location.origin;

      // Parse URL parameters manually
      const parseUrlParams = (url: string) => {
        const params: Record<string, string> = {};
        
        // Extract from hash
        if (url.includes('#')) {
          const hashPart = url.split('#')[1];
          if (hashPart) {
            hashPart.split('&').forEach(param => {
              const [key, value] = param.split('=');
              if (key && value) {
                params[key] = decodeURIComponent(value);
              }
            });
          }
        }
        
        // Extract from search params
        if (url.includes('?')) {
          const searchPart = url.split('?')[1].split('#')[0];
          if (searchPart) {
            searchPart.split('&').forEach(param => {
              const [key, value] = param.split('=');
              if (key && value) {
                params[key] = decodeURIComponent(value);
              }
            });
          }
        }
        
        return params;
      };

      const urlParams = parseUrlParams(href);

      setUrlInfo({
        hash,
        search,
        href,
        pathname,
        origin,
        urlParams,
        hasRecoveryInHash: hash?.includes('type=recovery'),
        hasAccessTokenInHash: hash?.includes('access_token='),
        hasRecoveryInSearch: search?.includes('type=recovery'),
        hasAccessTokenInSearch: search?.includes('access_token='),
        hasRecoveryType: urlParams.type === 'recovery',
        hasAccessToken: !!urlParams.access_token,
        router: router.query
      });
    };

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setSessionInfo({
          data,
          error,
          hasSession: !!data.session,
          hasUser: !!data.session?.user,
          userEmail: data.session?.user?.email,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        setSessionInfo({
          error: err,
          timestamp: new Date().toISOString()
        });
      }
    };

    analyzeUrl();
    checkSession();
  }, [router.query]);

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white p-8">
      <Head>
        <title>Password Reset Debug | Aditi Daily Updates</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Password Reset Debug Information</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#1e2538] p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-purple-400">URL Information</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(urlInfo, null, 2)}
            </pre>
          </div>
          
          <div className="bg-[#1e2538] p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Session Information</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="mt-8 bg-[#1e2538] p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400">Actions & Quick Fixes</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => router.push('/reset-password')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                🔐 Go to Reset Password
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
              >
                🏠 Go to Login
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
              <h3 className="text-blue-300 font-bold mb-2">🔧 Quick Fix for Vercel Issues:</h3>
              <ol className="text-sm space-y-1 text-blue-100">
                <li>1. If you see valid access_token and type=recovery above ✅</li>
                <li>2. Copy this URL and manually go to /reset-password</li>
                <li>3. The enhanced code should automatically detect and process it</li>
                <li>4. Check browser console for detailed debugging logs</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
          <h3 className="text-yellow-300 font-bold mb-2">📋 Vercel Password Reset Debugging Guide:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-semibold text-yellow-200 mb-2">✅ What Should Work:</h4>
              <ul className="text-sm space-y-1 text-yellow-100">
                <li>• access_token present in URL</li>
                <li>• type=recovery parameter found</li>
                <li>• refresh_token available</li>
                <li>• Valid Supabase session created</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-200 mb-2">❌ Common Vercel Issues:</h4>
              <ul className="text-sm space-y-1 text-red-100">
                <li>• Missing NEXT_PUBLIC_SITE_URL env var</li>
                <li>• Supabase auth URLs not configured</li>
                <li>• URL fragments not detected properly</li>
                <li>• Session timing issues on Vercel</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-red-900/30 border border-red-700 p-4 rounded-lg">
          <h3 className="text-red-300 font-bold mb-2">🚨 Environment Check:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SITE_URL:</span>
              <span className={process.env.NEXT_PUBLIC_SITE_URL ? 'text-green-300' : 'text-red-300'}>
                {process.env.NEXT_PUBLIC_SITE_URL || '❌ NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-300' : 'text-red-300'}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Current Domain:</span>
              <span className="text-blue-300">
                {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 