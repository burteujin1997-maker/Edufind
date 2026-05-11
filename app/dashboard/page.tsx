'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [forgotMode, setForgotMode] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Имэйл болон нууц үгээ оруулна уу!')
      return
    }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Имэйл эсвэл нууц үг буруу байна!')
      setLoading(false)
      return
    }

    const { data: schoolUser } = await supabase
      .from('school_users')
      .select('school_id, schools(slug)')
      .eq('user_id', data.user.id)
      .single()

    setLoading(false)

    if (schoolUser?.schools) {
      const school = schoolUser.schools as any
      window.location.href = `/dashboard/${school.slug}`
    } else {
      setError('Таны бүртгэлтэй холбоотой байгууллага олдсонгүй. Admin-тай холбогдоно уу.')
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Имэйл хаягаа оруулна уу!')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/reset`,
    })

    setLoading(false)
    if (error) {
      setError('Алдаа гарлаа: ' + error.message)
    } else {
      setMessage('Нууц үг сэргээх линк имэйл рүү илгээлээ. Имэйлээ шалгаарай!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a3a5c]">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1a3a5c]">EduFind</span>
            <span className="text-2xl font-bold text-[#1ea572]">.mn</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-3">
            {forgotMode ? 'Нууц үг сэргээх' : 'Байгууллагын нэвтрэх'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {forgotMode ? 'Имэйл рүү сэргээх линк илгээнэ' : 'Өөрийн байгууллагын dashboard руу нэвтрэх'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@school.mn"
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
              />
            </div>
          </div>

          {!forgotMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setForgotMode(true); setError(''); setMessage('') }}
                className="text-xs text-gray-400 hover:text-[#1a3a5c] mt-1.5 block text-right w-full transition-colors"
              >
                Нууц үг мартсан уу?
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
              {message}
            </div>
          )}

          <button
            onClick={forgotMode ? handleForgotPassword : handleLogin}
            disabled={loading}
            className="w-full bg-[#1a3a5c] hover:bg-[#16324f] disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {loading ? 'Уншиж байна...' : forgotMode ? 'Линк илгээх' : 'Нэвтрэх'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          {forgotMode ? (
            <button
              onClick={() => { setForgotMode(false); setError(''); setMessage('') }}
              className="text-sm text-[#1a3a5c] font-medium hover:underline"
            >
              ← Нэвтрэх хуудас руу буцах
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Бүртгэлгүй байна уу?{' '}
              <Link href="/register" className="text-[#1a3a5c] font-medium hover:underline">
                Энд бүртгүүлэх
              </Link>
            </p>
          )}
          <div>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
              ← Нүүр хуудас руу буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
