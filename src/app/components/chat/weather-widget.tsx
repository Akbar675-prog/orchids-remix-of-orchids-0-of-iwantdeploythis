"use client"

import { Cloud, CloudRain, Sun, Thermometer } from "@phosphor-icons/react"
import { motion } from "framer-motion"

interface WeatherData {
  location: string
  current: {
    temp: number
    condition: string
    high: number
    low: number
  }
  forecast: Array<{
    day: string
    temp: number
    condition: string
  }>
}

export function WeatherWidget({ data }: { data: WeatherData }) {
  if (!data) return null

  const getIcon = (condition: string) => {
    const c = condition.toLowerCase()
    if (c.includes("sun") || c.includes("clear")) return <Sun weight="fill" className="text-yellow-400" />
    if (c.includes("rain")) return <CloudRain weight="fill" className="text-blue-400" />
    return <Cloud weight="fill" className="text-gray-400" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-border my-4 w-full max-w-sm rounded-2xl border p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{data.location}</h3>
          <p className="text-muted-foreground text-sm capitalize">{data.current.condition}</p>
        </div>
        <div className="text-4xl">
          {getIcon(data.current.condition)}
        </div>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-bold">{data.current.temp}°</span>
        <div className="text-muted-foreground pb-1 text-sm">
          <span>H: {data.current.high}°</span>
          <span className="ml-2">L: {data.current.low}°</span>
        </div>
      </div>

      <div className="border-border mt-4 flex justify-between border-t pt-4">
        {data.forecast.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-muted-foreground text-xs">{item.day}</span>
            <div className="text-xl">
              {getIcon(item.condition)}
            </div>
            <span className="text-sm font-medium">{item.temp}°</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
