'use client'

import { createSupabaseBrowserClient } from '../../utils/supabase-browser'
import { useState } from 'react'

export default function MigrationTest() {
  const [results, setResults] = useState('')
  const [loading, setLoading] = useState(false)
  
  const testEverything = async () => {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    let output = '🔍 COMPREHENSIVE DATABASE & AUTH TEST\n\n'
    
    try {
      // Test 1: Check current user
      output += '1️⃣ CURRENT USER STATUS:\n'
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!user) {
        output += '❌ No user logged in\n'
        output += '⚠️  Please login first at /auth/login\n\n'
      } else {
        output += `✅ User ID: ${user.id}\n`
        output += `✅ Email: ${user.email}\n\n`
        
        // Test 2: Check if user has profile
        output += '2️⃣ USER PROFILE CHECK:\n'
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          output += `❌ Profile query failed: ${profileError.message}\n`
          output += '🚨 User has no profile record!\n\n'
        } else {
          output += `✅ Profile found\n`
          output += `   Role: ${profile.role || 'NULL'}\n`
          output += `   Approved: ${profile.is_approved}\n`
          output += `   Name: ${profile.full_name}\n\n`
        }
        
        // Test 3: Test is_admin function
        output += '3️⃣ ADMIN FUNCTION TEST:\n'
        const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin')
        
        if (isAdminError) {
          output += `❌ is_admin() failed: ${isAdminError.message}\n\n`
        } else {
          output += `✅ is_admin() result: ${isAdminResult}\n\n`
        }
        
        // Test 4: Check expected admin user
        output += '4️⃣ EXPECTED ADMIN USER CHECK:\n'
        const expectedAdminId = '92543f53-96b2-42e2-8bbd-20ba1eb9a9f6'
        const { data: expectedAdmin, error: expectedAdminError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', expectedAdminId)
          .single()
          
        if (expectedAdminError) {
          output += `❌ Expected admin user not found: ${expectedAdminError.message}\n`
          output += `   ID: ${expectedAdminId}\n\n`
        } else {
          output += `✅ Expected admin user found\n`
          output += `   Role: ${expectedAdmin.role}\n`
          output += `   Approved: ${expectedAdmin.is_approved}\n\n`
        }
        
        // Test 5: Check all profiles
        output += '5️⃣ ALL PROFILES:\n'
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('id, full_name, role, is_approved')
          .order('created_at', { ascending: false })
          
        if (allProfilesError) {
          output += `❌ Failed to query all profiles: ${allProfilesError.message}\n\n`
        } else {
          output += `✅ Found ${allProfiles?.length || 0} total profiles:\n`
          allProfiles?.forEach((p: { id: string; full_name: string | null; role: string; is_approved: boolean }, i: number) => {
            output += `   ${i + 1}. ${p.full_name} (${p.role}) - ${p.is_approved ? 'Approved' : 'Pending'}\n`
            output += `      ID: ${p.id}\n`
          })
          output += '\n'
        }
      }
      
      // Summary & Fix
      output += '🎯 DIAGNOSIS & FIX:\n'
      if (!user) {
        output += '→ Please login first\n'
      } else if (user.id !== '92543f53-96b2-42e2-8bbd-20ba1eb9a9f6') {
        output += `→ You are logged in as: ${user.id}\n`
        output += `→ Expected admin ID: 92543f53-96b2-42e2-8bbd-20ba1eb9a9f6\n`
        output += '→ Either login with correct admin account OR update migration with your user ID\n'
      } else {
        output += '→ You are the expected admin user, checking role...\n'
      }
      
    } catch (error) {
      output += `💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}\n`
    }
    
    setResults(output)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-6">🔧 Admin Authentication Diagnostic</h1>
        
        <div className="space-y-4 mb-6">
          <button 
            onClick={testEverything}
            disabled={loading}
            className="bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Full Diagnostic'}
          </button>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🛠️ Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li><strong>Login first</strong> at <a href="/auth/login" className="underline">/auth/login</a></li>
              <li>Come back here and click "Run Full Diagnostic"</li>
              <li>Check the results below to see what's wrong</li>
            </ol>
          </div>
        </div>
        
        {results && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
            <pre>{results}</pre>
          </div>
        )}
        
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">🚨 Common Issues</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            <li><strong>Wrong user logged in:</strong> Login with the correct admin account</li>
            <li><strong>No profile record:</strong> Admin user needs to be in profiles table</li>
            <li><strong>Wrong role:</strong> Profile role must be 'admin', not 'student'</li>
            <li><strong>Not approved:</strong> Admin user must have is_approved = true</li>
          </ul>
        </div>
      </div>
    </div>
  )
}