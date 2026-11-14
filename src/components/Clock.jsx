import { useEffect, useState } from 'react'
import { localTime } from '../config/site'

// The time in Moradabad. Written in the browser only, so the built page never carries a stale hour.
export default function Clock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const up = () => setT(localTime())
    up()
    const i = setInterval(up, 15000)
    return () => clearInterval(i)
  }, [])
  return <span className="clock">{t || '--:--'}</span>
}
