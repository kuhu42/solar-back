// Create this test component to verify Supabase connection
// Save as: src/components/SupabaseTest.jsx

import React, { useState } from 'react';
import { supabase, dbService } from '../lib/supabase.js';

const SupabaseTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {
      connectionTest: null,
      userTableTest: null,
      authTest: null,
      envVariables: {
        url: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
      }
    };

    try {
      // Test 1: Basic connection
      console.log('Testing basic connection...');
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        results.connectionTest = `❌ Failed: ${error.message}`;
      } else {
        results.connectionTest = '✅ Connected successfully';
      }
    } catch (error) {
      results.connectionTest = `❌ Error: ${error.message}`;
    }

    try {
      // Test 2: Check if users table exists and has data
      console.log('Testing users table...');
      const users = await dbService.getUserProfiles();
      results.userTableTest = `✅ Found ${users?.length || 0} users in database`;
      
      if (users && users.length > 0) {
        console.log('Users found:', users.map(u => ({ email: u.email, role: u.role, status: u.status })));
      }
    } catch (error) {
      results.userTableTest = `❌ Failed: ${error.message}`;
    }

    try {
      // Test 3: Auth status
      console.log('Testing auth status...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        results.authTest = `✅ Logged in as: ${session.user.email}`;
      } else {
        results.authTest = '⚠️ No active session';
      }
    } catch (error) {
      results.authTest = `❌ Auth error: ${error.message}`;
    }

    setTestResults(results);
    setLoading(false);
  };

  const createTestUser = async () => {
    setLoading(true);
    try {
      // Create a test user directly in the database
      const testUser = {
        id: crypto.randomUUID(),
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        status: 'pending',
        phone: '+1234567890',
        location: 'Test Location'
      };

      const newUser = await dbService.createUserProfile(testUser);
      alert(`Test user created: ${newUser.email}`);
      runTests(); // Refresh tests
    } catch (error) {
      alert(`Failed to create test user: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </button>

        {testResults && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results:</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">Environment Variables:</h4>
              <p>VITE_SUPABASE_URL: {testResults.envVariables.url}</p>
              <p>VITE_SUPABASE_ANON_KEY: {testResults.envVariables.key}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">Connection Test:</h4>
              <p>{testResults.connectionTest}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">Users Table Test:</h4>
              <p>{testResults.userTableTest}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">Auth Status:</h4>
              <p>{testResults.authTest}</p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-2">Quick Actions:</h3>
          <button
            onClick={createTestUser}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 mr-2"
          >
            Create Test User
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800">How to verify you're in Live Mode:</h4>
          <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
            <li>Run these tests first</li>
            <li>Check browser console for "Loading LIVE data" messages</li>
            <li>Create a new user registration - it should appear in Supabase dashboard</li>
            <li>Changes should persist after browser refresh</li>
            <li>Check your Supabase dashboard at supabase.com to see real data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;