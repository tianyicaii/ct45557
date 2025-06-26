'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [clicked, setClicked] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // 页面加载时获取点击次数
  useEffect(() => {
    fetchClickCount()
  }, [])

  const fetchClickCount = async () => {
    try {
      const { data, error } = await supabase
        .from('click_records')
        .select('click_count')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching click count:', error)
        return
      }

      if (data) {
        setClickCount(data.click_count || 0)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleClick = async () => {
    setClicked(!clicked)
    setLoading(true)

    try {
      const newCount = clickCount + 1
      
      // 更新或插入点击记录
      const { error } = await supabase
        .from('click_records')
        .upsert(
          { 
            id: 1, 
            click_count: newCount,
            user_ip: 'unknown' // 在实际应用中可以获取真实IP
          },
          { onConflict: 'id' }
        )

      if (error) {
        console.error('Error updating click count:', error)
      } else {
        setClickCount(newCount)
        console.log('Click recorded! Total clicks:', newCount)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      
      <div className="stats">
        <p>总点击次数: {clickCount}</p>
      </div>
      
      <div className="button-container">
        <button
          onClick={handleClick}
          disabled={loading}
          className={`button ${clicked ? 'button-clicked' : 'button-default'} ${loading ? 'button-loading' : ''}`}
        >
          {loading ? '记录中...' : clicked ? 'Hello!' : 'Say Hello'}
        </button>
      </div>
    </main>
  )
}