'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Building2, Clock, Eye, MessageSquare } from 'lucide-react'

type ViewStat = {
  name: string
  slug: string
  count: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSchools: 0,
    pendingRequests: 0,
    totalViews: 0,
    totalAnnouncements: 0,
  })
  const [topSchools, setTopSchools] = useState<ViewStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)

      // Нийт байгууллага
      const { count: schoolCount } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })

      // Хүлээгдэж байгаа хүсэлт
      const { count: pendingCount } = await supabase
        .from('registration_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Нийт үзэлт
      const { count: viewCount } = await supabase
        .from('school_views')
        .select('*', { count: 'exact', head: true })

      // Нийт мэдэгдэл
      const { count: annCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalSchools: schoolCount || 0,
        pendingRequests: pendingCount || 0,
        totalViews: viewCount || 0,
        totalAnnouncements: annCount || 0,
      })

      // Их үзэлттэй байгууллагууд
      const { data: schools } = await supabase
        .from('schools')
        .select('id, name, slug')

      if (schools) {
        const viewCounts = await Promise.all(
          schools.map(async (school) => {
            const { count } = await supabase
              .from('school_views')
              .select('*', { count: 'exact', head: true })
              .eq('school_id', school.id)
            return { name: school.name, slug: school.slug, count: count || 0 }
          })
        )
        const sorted = viewCounts.sort((a, b) => b.count - a.count).slice(0, 5)
        setTopSchools(sorted)
      }

      setLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Нийт байгууллага',
      value: stats.totalSchools,
      icon: Building2,
      color: 'bg-blue-50 text-blue-600',
      href: '/admin/schools',
    },
    {
      label: 'Хүлээгдэж байгаа хүсэлт',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      href: '/admin/requests',
    },
    {
      label: 'Нийт үзэлт',
      value: stats.totalViews,
      icon: Eye,
      color: 'bg-green-50 text-green-600',
      href: '#',
    },
    {
      label: 'Нийт мэдэгдэл',
      value: stats.totalAnnouncements,
      icon: MessageSquare,
      color: 'bg-purple-50 text-purple-600',
      href: '/admin/announcements',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a5c]" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Хяналтын самбар</h1>
        <p className="text-gray-500 mt-1">EduFind.mn-ийн ерөнхий статистик</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Их үзэлттэй байгууллагууд */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🔥 Их үзэлттэй байгууллагууд</h2>
        {topSchools.length === 0 ? (
          <p className="text-gray-400 text-sm">Үзэлт байхгүй байна</p>
        ) : (
          <div className="space-y-3">
            {topSchools.map((school, i) => (
              <div key={school.slug} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <a
                    href={`/school/${school.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-[#1a3a5c]"
                  >
                    {school.name}
                  </a>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{school.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
