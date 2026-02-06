"use client"

import { LayoutApp } from "@/app/components/layout/layout-app"
import { MODELS } from "@/lib/models"
import { motion, useScroll, useTransform } from "framer-motion"
import { 
  Cpu, 
  FileCode, 
  Info, 
  Rocket, 
  ShieldCheck, 
  Code2, 
  Heart, 
  Zap, 
  Globe, 
  Shield, 
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Search,
  Terminal,
  Brain
} from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRef } from "react"

const AILogo = () => (
  <div className="relative w-24 h-24 flex items-center justify-center">
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary via-purple-500 to-blue-500 opacity-20 blur-xl"
    />
    <div className="relative bg-background border-2 border-primary/20 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
      <Brain size={40} className="text-primary" strokeWidth={1.5} />
    </div>
  </div>
)

export default function AboutPage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const stats = [
    { label: "AI Models", value: "50+", icon: Cpu },
    { label: "Response Time", value: "< 2s", icon: Zap },
    { label: "Data Security", value: "100%", icon: ShieldCheck },
    { label: "Open Source", value: "AOSP", icon: Code2 },
  ]

  return (
    <LayoutApp>
      <div ref={containerRef} className="relative min-h-screen bg-background overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 pb-32">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-32"
          >
            {/* Hero Section */}
            <motion.section variants={item} className="text-center space-y-10">
              <div className="flex justify-center mb-8">
                <AILogo />
              </div>
              <div className="space-y-6">
                <Badge variant="outline" className="px-4 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase border-primary/20 bg-primary/5 text-primary">
                  The Future of Intelligence
                </Badge>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
                  Visora <br /> <span className="text-primary">Professional</span> AI.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                  Definisi baru interaksi kecerdasan buatan. Satu platform, puluhan model, privasi mutlak, dan kecepatan tanpa kompromi.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold group">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold border-border/50 backdrop-blur-sm">
                  Dokumentasi
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-border/50">
                {stats.map((stat, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <stat.icon size={16} />
                      <span className="text-sm font-medium uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="text-4xl font-black text-foreground">{stat.value}</div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Vision & Mission */}
            <motion.section variants={item} className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs">
                    <Sparkles size={16} />
                    <span>Visi & Filosofi</span>
                  </div>
                  <h2 className="text-5xl font-bold leading-tight tracking-tight">Evolusi Kecerdasan Digital.</h2>
                </div>
                
                <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Visora lahir dari sebuah pertanyaan sederhana: <span className="text-foreground font-semibold italic">"Bagaimana jika AI tidak lagi terfragmentasi?"</span> Kami percaya bahwa setiap pengguna berhak mendapatkan model terbaik untuk setiap tugas tanpa hambatan antarmuka yang membingungkan.
                  </p>
                  <p>
                    Filosofi kami adalah <span className="text-foreground font-medium underline decoration-primary/30 decoration-4 underline-offset-8">Minimalisme Fungsional</span>. Setiap baris kode dalam Visora dioptimalkan untuk memberikan respons instan, memastikan produktivitas Anda tidak pernah terhenti oleh latensi.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-6 pt-6">
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                      <Zap className="text-yellow-500" size={24} />
                        <h4 className="font-bold text-foreground">Ultra-Fast</h4>
                        <p className="text-sm">Infrastruktur Visora Cloud memastikan respons di bawah 2 detik untuk setiap query.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                      <Globe className="text-blue-500" size={24} />
                      <h4 className="font-bold text-foreground">Deep Context</h4>
                      <p className="text-sm">Integrasi pencarian web real-time yang memberikan akurasi data terbaru.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group perspective-1000">
                <motion.div 
                  whileHover={{ rotateY: 5, rotateX: -5 }}
                  className="relative bg-gradient-to-b from-card to-card/80 border border-border/50 rounded-[2.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 p-6 bg-background/50 border border-border/50 rounded-2xl shadow-sm backdrop-blur-md">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Layers size={24} />
                      </div>
                      <div>
                        <div className="font-bold">Multi-Model Agility</div>
                        <div className="text-xs text-muted-foreground">GPT-4, Claude, DeepSeek, Llama.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-background/50 border border-border/50 rounded-2xl shadow-sm backdrop-blur-md translate-x-8">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <Search size={24} />
                      </div>
                      <div>
                        <div className="font-bold">Real-time Synthesis</div>
                        <div className="text-xs text-muted-foreground">Data web terkini dalam satu klik.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-background/50 border border-border/50 rounded-2xl shadow-sm backdrop-blur-md">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Terminal size={24} />
                      </div>
                      <div>
                        <div className="font-bold">Developer Centric</div>
                        <div className="text-xs text-muted-foreground">Advanced Neural Processing.</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* Security Section */}
            <motion.section variants={item} className="space-y-16">
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs px-4 py-1 bg-primary/5 rounded-full border border-primary/10">
                  <Shield size={16} />
                  <span>Privacy & Security</span>
                </div>
                <h2 className="text-5xl font-bold tracking-tight">Keamanan Tanpa Kompromi.</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Data Anda adalah privasi Anda. Visora dibangun dengan fondasi keamanan yang ketat menggunakan standar industri tertinggi.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "End-to-End Encryption",
                    desc: "Setiap percakapan dienkripsi menggunakan protokol TLS terbaru sebelum disimpan di basis data.",
                    icon: Lock,
                    color: "text-blue-500"
                  },
                  {
                    title: "Supabase Infrastructure",
                    desc: "Infrastruktur cloud terdistribusi dengan kepatuhan SOC2 untuk manajemen identitas.",
                    icon: Database,
                    color: "text-emerald-500"
                  },
                    {
                      title: "Isolated Logic",
                      desc: "Eksekusi logika dilakukan dalam lingkungan terisolasi untuk mencegah intrusi sistem.",
                      icon: ShieldCheck,
                      color: "text-purple-500"
                    }
                ].map((feature, idx) => (
                  <div key={idx} className="p-10 rounded-[2rem] border bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all group">
                    <feature.icon className={`${feature.color} mb-6 group-hover:scale-110 transition-transform`} size={32} />
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Intelligence Section */}
            <motion.section variants={item} className="space-y-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs">
                    <Cpu size={16} />
                    <span>Artificial Intelligence</span>
                  </div>
                  <h2 className="text-5xl font-bold tracking-tight">Ekosistem Model Global.</h2>
                </div>
                <p className="text-muted-foreground max-w-md">
                  Pilih dari puluhan model bahasa tercanggih dunia. Klik pada kartu untuk melihat spesifikasi teknis mendalam.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {MODELS.map((model) => (
                  <HoverCard key={model.id}>
                    <HoverCardTrigger asChild>
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="p-6 rounded-2xl border bg-card/30 backdrop-blur-md flex flex-col items-center text-center space-y-4 hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center font-black text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {model.providerId.substring(0, 2)}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-sm truncate w-full px-1">{model.name}</div>
                          <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter opacity-70">
                            {model.providerId}
                          </Badge>
                        </div>
                      </motion.div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 p-0 overflow-hidden rounded-2xl border-primary/20 shadow-2xl backdrop-blur-2xl">
                      <div className="bg-primary/10 p-5 border-b border-border/50">
                        <div className="flex justify-between items-center mb-3">
                          <Badge className="text-[10px] uppercase font-bold bg-primary text-white">
                            {model.providerId}
                          </Badge>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            VER: 2026.01
                          </div>
                        </div>
                        <h4 className="text-xl font-bold tracking-tight">{model.name}</h4>
                      </div>
                      <div className="p-5 space-y-5">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Dikonfigurasi khusus untuk kecepatan maksimal melalui infrastruktur High-speed LPU™ dengan akurasi yang tetap terjaga.
                          </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Context</div>
                            <div className="text-sm font-black">128K</div>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Latency</div>
                            <div className="text-sm font-black">~0.4s</div>
                          </div>
                        </div>
                        <Button className="w-full rounded-xl text-xs h-9" variant="outline">
                          Pelajari Lebih Lanjut
                        </Button>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </motion.section>

            {/* Architecture Section */}
            <motion.section variants={item} className="space-y-16">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs">
                  <FileCode size={16} />
                  <span>Modern Stack</span>
                </div>
                <h2 className="text-5xl font-bold tracking-tight">Arsitektur Next-Gen.</h2>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-8">
                {[
                  { name: "src/app", desc: "Sistem rute Next.js 15 dengan optimasi rendering sisi server.", icon: Rocket },
                  { name: "src/lib/server", desc: "Integrasi API terenkripsi untuk Serper, Visora Cloud, dan Neural Services.", icon: Database },
                  { name: "src/components", desc: "Library komponen atomik yang dianimasikan dengan Framer Motion.", icon: Code2 },
                ].map((dir, idx) => (
                  <div key={idx} className="relative p-10 rounded-[2.5rem] border bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm hover:border-primary/30 transition-all group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <dir.icon size={120} />
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/10 w-fit mb-8 text-primary">
                      <dir.icon size={28} />
                    </div>
                    <code className="text-primary font-mono text-base block mb-4 font-bold tracking-tight">{dir.name}</code>
                    <p className="text-muted-foreground leading-relaxed text-lg">{dir.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Footer About */}
            <motion.section variants={item} className="text-center space-y-12 border-t border-border/50 pt-20">
              <div className="space-y-6">
                <h3 className="text-4xl font-bold">Siap Menjelajahi Masa Depan?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                  Visora adalah proyek yang terus berkembang. Dikembangkan dengan ❤️ oleh <span className="text-foreground font-bold">Nauval Akbar</span> untuk mendukung ekosistem AI yang lebih terbuka dan dapat diakses semua orang.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="px-6 py-2 rounded-full flex gap-2 items-center bg-green-500/5 text-green-600 border-green-500/20">
                  <Heart size={16} fill="currentColor" />
                  Made with Love
                </Badge>
                <Badge variant="outline" className="px-6 py-2 rounded-full flex gap-2 items-center bg-primary/5 text-primary border-primary/20">
                  <Code2 size={16} />
                  Version 4.5.0
                </Badge>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </LayoutApp>
  )
}
