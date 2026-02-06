"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { LayoutApp } from "@/app/components/layout/layout-app"
import { 
  Cpu, 
  Database, 
  Globe, 
  ShieldCheck, 
  Network,
  Users,
  Info,
  Clock,
  ArrowUpRight,
  Server,
  Key
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

export default function ServerStatsPage() {
  const [time, setTime] = useState<string>("")
  const [metrics, setMetrics] = useState({
    cpu: "0%",
    memFree: "0 GB",
    memTotal: "256 GB",
    apiRate: "0 req/s",
    activeUsers: 0,
    totalUsers: 0,
    totalKeys: 0,
    activeRecently: false
  })

  const [chartData, setChartData] = useState<{
    labels: string[],
    usage: number[],
    memory: number[],
    users: number[]
  }>({
    labels: [],
    usage: [],
    memory: [],
    users: []
  })

  const [realtimeTraffic, setRealtimeTraffic] = useState<number[]>(Array(60).fill(0))
  const lastActiveRef = useRef<number>(Date.now())
  const currentRateRef = useRef<number>(0)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        setMetrics(data.metrics)
        setChartData(data.charts)
        
        if (data.metrics.activeRecently) {
          lastActiveRef.current = Date.now()
        }
        currentRateRef.current = parseFloat(data.metrics.apiRate)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000)
    
    // Real-time update interval (1 second)
    const realtimeInterval = setInterval(() => {
      setRealtimeTraffic(prev => {
        const newData = [...prev.slice(1)]
        let nextValue = currentRateRef.current

        // Decay logic: if no activity for 5 seconds, drop by 1.5
        const idleTime = Date.now() - lastActiveRef.current
        if (idleTime > 5000) {
          nextValue = Math.max(0, nextValue - 1.5)
          // Update the ref so the decay continues
          currentRateRef.current = nextValue
        }
        
        newData.push(Math.max(0, nextValue))
        return newData
      })
    }, 1000)

    const timeInterval = setInterval(() => {
      setTime(new Date().toLocaleString('id-ID', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(realtimeInterval)
      clearInterval(timeInterval)
    }
  }, [])

  const commonOptions = (color: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart' as const
    },
    scales: {
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 10, family: 'Montserrat' }, padding: 8 },
        suggestedMin: 0
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10, family: 'Montserrat' }, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 }
      }
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: color,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        titleFont: { weight: 'bold' as const },
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y}`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  })

  const trafficChartData = {
    labels: Array(60).fill(""),
    datasets: [{
      label: 'Real-time Key Usage',
      data: realtimeTraffic,
      borderColor: '#f59e0b',
      backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    }]
  }

  const realtimeOptions = {
    ...commonOptions('#f59e0b'),
    animation: { duration: 0 } as const, // Disable animation for per-second shift
    scales: {
      ...commonOptions('#f59e0b').scales,
      x: { display: false },
      y: { 
        ...commonOptions('#f59e0b').scales.y,
        suggestedMax: 10,
        ticks: {
          ...commonOptions('#f59e0b').scales.y.ticks,
          stepSize: 2
        }
      }
    }
  }

  const memoryChartData = {
    labels: chartData.labels,
    datasets: [{
      label: 'RAM Used (GB)',
      data: chartData.memory,
      borderColor: '#22d3ee',
      backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.3)');
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      cubicInterpolationMode: 'monotone' as const,
      pointRadius: 0, // Hide points for cleaner look
      pointBackgroundColor: '#22d3ee',
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#22d3ee',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      borderWidth: 2
    }]
  }

  const userChartData = {
    labels: chartData.labels,
    datasets: [{
      label: 'New Users',
      data: chartData.users,
      backgroundColor: '#f43f5e',
      borderRadius: 6,
      hoverBackgroundColor: '#e11d48'
    }]
  }

  return (
    <LayoutApp>
      <div className="relative min-h-screen w-full bg-[#020617] text-[#e2e8f0] font-['Montserrat'] selection:bg-cyan-500/20 pb-20 overflow-x-hidden">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
          
          .glass-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
          }
          
          .live-dot { 
            animation: pulse-dot 2s infinite; 
          }
          
          @keyframes pulse-dot { 
            0% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 
            70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 
            100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } 
          }

          .glow-text {
            text-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
          }
        `}</style>

        {/* Ambient Background Glows */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[30%] h-[30%] bg-rose-500/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-28">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  System Status: Optimal
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot"></span>
                  Live
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none mb-4">
                FUJIKU <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 glow-text">AI</span>
              </h1>
              <div className="flex items-center gap-4 text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  <span className="text-sm">Supercluster v4.5</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Global Distribution</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-end gap-2"
            >
              <div className="flex items-center gap-3 text-gray-400 font-mono text-sm bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <Clock className="w-4 h-4 text-cyan-400" />
                {time || "Loading time..."}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mr-2">
                Last cluster sync: Just now
              </div>
            </motion.div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              label="CPU Intensity" 
              value={metrics.cpu} 
              icon={<Cpu className="w-4 h-4" />}
              color="text-cyan-400" 
              delay={0}
            />
            <MetricCard 
              label="Memory Available" 
              value={metrics.memFree} 
              icon={<Database className="w-4 h-4" />}
              color="text-emerald-400" 
              delay={0.1}
            />
              <MetricCard 
                label="API Key Usage" 
                value={`${realtimeTraffic[realtimeTraffic.length - 1].toFixed(2)} tokens/s`} 
                icon={<Key className="w-4 h-4" />}
                color="text-amber-400" 
                delay={0.2}
              />
            <MetricCard 
              label="Active Sessions" 
              value={metrics.activeUsers.toLocaleString()} 
              icon={<Users className="w-4 h-4" />}
              color="text-rose-400" 
              delay={0.3}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <ChartCard 
              title="Real-time Key Usage" 
              subtitle="Live key consumption rate (1s resolution)"
              icon={<Key className="w-4 h-4" />} 
              color="#f59e0b"
              delay={0.4}
              badge="Live"
            >
              <Line data={trafficChartData} options={realtimeOptions} />
            </ChartCard>

            <ChartCard 
              title="Cluster Memory Load" 
              subtitle="Aggregated RAM usage across nodes"
              icon={<Database className="w-4 h-4" />} 
              color="#06b6d4"
              delay={0.5}
            >
              <Line data={memoryChartData} options={commonOptions('#06b6d4')} />
            </ChartCard>

            <div className="lg:col-span-2">
              <ChartCard 
                title="Growth: New User Registrations" 
                subtitle="Daily account creation metrics"
                icon={<Users className="w-4 h-4" />} 
                color="#f43f5e"
                delay={0.6}
              >
                <Bar data={userChartData} options={commonOptions('#f43f5e')} />
              </ChartCard>
            </div>
          </div>

          {/* Technical Specs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">Hardware Specifications</h2>
              <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SpecCard title="Compute" icon={<Info className="w-4 h-4 text-cyan-400" />} color="border-cyan-500/50">
                <SpecItem label="Core Architecture" value="Distributed Tensor Core" />
                <SpecItem label="Inference Engine" value="Fujiku-V4 Optimized" />
                <SpecItem label="Precision" value="FP8 / BF16 Mixed" />
              </SpecCard>

              <SpecCard title="GPU Cluster" icon={<Cpu className="w-4 h-4 text-orange-400" />} color="border-orange-500/50">
                <SpecItem label="Accelerator" value="NVIDIA H100 80GB" />
                <SpecItem label="Topology" value="8-way HGX Baseboard" />
                <SpecItem label="Total Compute" value="800+ GPU Nodes" highlight />
              </SpecCard>

              <SpecCard title="Networking" icon={<Network className="w-4 h-4 text-purple-400" />} color="border-purple-500/50">
                <SpecItem label="Interconnect" value="NVLink Switch System" />
                <SpecItem label="Backplane" value="400G InfiniBand NDR" />
                <SpecItem label="Latency" value="< 1.5 microseconds" />
              </SpecCard>

              <SpecCard title="Security" icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />} color="border-emerald-500/50">
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-3 text-xs font-medium text-emerald-400/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    L7 Shield Active
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-emerald-400/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    Dynamic Load Balancing
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-emerald-400/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    Multi-region Failover
                  </div>
                </div>
              </SpecCard>
            </div>
          </motion.div>

        </div>
      </div>
    </LayoutApp>
  )
}

function MetricCard({ label, value, icon, color, delay }: { label: string, value: string | number, icon: React.ReactNode, color: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-3xl p-6 relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        {icon}
      </div>
      <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-2">{label}</h3>
      <div className={`text-3xl font-black ${color} tabular-nums tracking-tighter`}>{value}</div>
    </motion.div>
  )
}

function ChartCard({ title, subtitle, icon, color, delay, badge, children }: { title: string, subtitle: string, icon: React.ReactNode, color: string, delay: number, badge?: string, children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-[32px] p-8 border-t border-white/5"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mb-1">
            <span style={{ color }}>{icon}</span> {title}
          </h2>
          <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {badge && (
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 live-dot"></span>
              {badge}
            </div>
          )}
          <div className="p-2 rounded-xl bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Last 20 Days
          </div>
        </div>
      </div>
      <div className="h-[250px] w-full">
        {children}
      </div>
    </motion.div>
  )
}

function SpecCard({ title, icon, color, children }: { title: string, icon: React.ReactNode, color: string, children: React.ReactNode }) {
  return (
    <div className={`glass-card rounded-3xl p-6 border-l-2 ${color}`}>
      <h3 className="font-bold mb-6 text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 text-gray-400">
        <span className="p-1.5 rounded-lg bg-white/5">{icon}</span> {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

function SpecItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-600 text-[10px] font-bold uppercase tracking-tighter mb-0.5">{label}</span>
      <span className={`text-sm font-semibold tracking-tight ${highlight ? 'text-orange-400' : 'text-gray-300'}`}>
        {value}
      </span>
    </div>
  )
}
