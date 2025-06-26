'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [clicked, setClicked] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

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
        setDataLoaded(true) // 即使出错也标记为已加载
        return
      }

      if (data) {
        setClickCount(data.click_count || 0)
      }
      setDataLoaded(true)
    } catch (error) {
      console.error('Error:', error)
      setDataLoaded(true)
    }
  }

  const handleClick = async () => {
    // 如果数据还没有加载完成，不允许点击
    if (!dataLoaded) {
      console.log('数据加载中，请稍后再试')
      return
    }

    setClicked(!clicked)
    setLoading(true)

    try {
      // 使用数据库的原子操作来递增计数，而不是基于客户端状态
      const { data, error } = await supabase.rpc('increment_click_count')

      if (error) {
        console.error('Error updating click count:', error)
      } else {
        // 使用数据库返回的最新值
        setClickCount(data)
        console.log('Click recorded! Total clicks:', data)
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
        <p>总点击次数: {dataLoaded ? clickCount : '加载中...'}</p>
      </div>
      
      <div className="button-container">
        <button
          onClick={handleClick}
          disabled={loading || !dataLoaded}
          className={`button ${clicked ? 'button-clicked' : 'button-default'} ${(loading || !dataLoaded) ? 'button-loading' : ''}`}
        >
          {!dataLoaded ? '加载中...' : loading ? '记录中...' : clicked ? 'Hello!' : 'Say Hello'}
        </button>
      </div>
    </main>
  )
}