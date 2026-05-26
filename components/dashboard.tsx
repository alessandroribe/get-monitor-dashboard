"use client"

import React, { useState } from "react"
import {
  Send, TrendingUp, TrendingDown, Minus,
  ChevronRight, LayoutDashboard, Zap,
  Smartphone, FileText, Globe, Settings,
  BarChart2, AlertTriangle, Users, FileSearch,
  Timer, LineChart, AlertOctagon, Megaphone,
  Phone, Mail, MessageSquare, CheckCircle2,
  XCircle, Sparkles, Activity, Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger,
} from "@/components/ui/sidebar"

// ── Types ──────────────────────────────────────────────────────────────────

interface Message { id: string; text: string; sender: "user" | "assistant" }
type MonitorStatus = "up" | "down" | "warning"

interface Monitor {
  name: string; url: string; status: MonitorStatus
  latency: string; uptime: string; sparkline: number[]
}

interface HistoryEvent {
  id: string; monitor: string; type: "incident" | "recovery" | "degraded"
  summary: string; duration: string; ago: string; code?: string
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MONITORS: Monitor[] = [
  { name: "Website principal",    url: "https://getmonitor.io",           status: "up",      latency: "72ms",  uptime: "99.9%", sparkline: [100,100,100,100,100,99,100,100,100,100,100,100,100,100] },
  { name: "API v2",               url: "https://api.getmonitor.io/v2",    status: "up",      latency: "145ms", uptime: "99.7%", sparkline: [100,100,99,100,100,98,100,100,100,99,100,100,100,100] },
  { name: "App mobile (backend)", url: "https://app-api.getmonitor.io",   status: "up",      latency: "89ms",  uptime: "100%",  sparkline: [100,100,100,100,100,100,100,100,100,100,100,100,100,100] },
  { name: "Checkout",             url: "https://checkout.getmonitor.io",  status: "warning", latency: "1.2s",  uptime: "98.2%", sparkline: [100,100,100,98,95,100,100,96,100,100,100,98,100,85] },
  { name: "Dashboard admin",      url: "https://app.getmonitor.io",       status: "up",      latency: "54ms",  uptime: "100%",  sparkline: [100,100,100,100,100,100,100,100,100,100,100,100,100,100] },
  { name: "Status page pública",  url: "https://status.getmonitor.io",    status: "up",      latency: "91ms",  uptime: "99.8%", sparkline: [100,100,100,100,99,100,100,100,100,100,99,100,100,100] },
]

const HISTORY: HistoryEvent[] = [
  { id: "1", monitor: "Checkout",             type: "degraded",  summary: "Latência elevada — acima de 1s",          duration: "Em aberto", ago: "agora",      code: "200 SLOW" },
  { id: "2", monitor: "API v2",               type: "recovery",  summary: "Timeout em /auth/refresh — resolvido",     duration: "8 min",     ago: "há 8 dias",  code: "504" },
  { id: "3", monitor: "Website principal",    type: "incident",  summary: "Site indisponível — DNS propagation",      duration: "4 min",     ago: "há 15 dias", code: "TIMEOUT" },
  { id: "4", monitor: "App mobile (backend)", type: "recovery",  summary: "Falha no endpoint /users — resolvida",     duration: "11 min",    ago: "há 22 dias", code: "500" },
  { id: "5", monitor: "Checkout",             type: "incident",  summary: "Serviço indisponível durante deploy",      duration: "3 min",     ago: "há 29 dias", code: "503" },
]

const CHANNELS = [
  { Icon: Phone,         name: "WhatsApp", value: "+55 11 99999-9999",   count: "3 alertas hoje" },
  { Icon: Mail,          name: "Email",    value: "equipe@getmonitor.io", count: "5 alertas hoje" },
  { Icon: MessageSquare, name: "Slack",    value: "#incidents",           count: "8 alertas hoje" },
]

const TEMPLATES = [
  { Icon: Timer,         name: "MTTR Trend",   desc: "Evolução do tempo médio" },
  { Icon: LineChart,     name: "Uptime Comp.", desc: "Comparar com período" },
  { Icon: AlertOctagon,  name: "Incidentes",   desc: "Histórico e distribuição" },
  { Icon: Megaphone,     name: "Alertas",      desc: "Volume por canal" },
]

const MONITOR_NAV = [
  { Icon: LayoutDashboard, label: "Visão geral", active: true },
  { Icon: Activity,        label: "Monitores" },
  { Icon: Zap,             label: "Alertas" },
  { Icon: Smartphone,      label: "Canais" },
]
const MONITOR_NAV2 = [
  { Icon: FileText, label: "Histórico" },
  { Icon: Globe,    label: "Status Page" },
]
const ANALYTICS_NAV = [
  { Icon: BarChart2,  label: "Dashboard" },
  { Icon: TrendingUp, label: "Eventos" },
  { Icon: LineChart,  label: "Explorador" },
]
const INCIDENTS_NAV = [
  { Icon: AlertTriangle, label: "Incidentes" },
  { Icon: Users,         label: "On-call" },
  { Icon: FileSearch,    label: "Post-mortems" },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function Sparkline({ data, status }: { data: number[]; status: MonitorStatus }) {
  const w = 64, h = 18
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ")
  const color = status === "warning" ? "var(--color-chart-2, #f59e0b)" : "var(--color-chart-1, #22c55e)"
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatusDot({ status }: { status: MonitorStatus }) {
  if (status === "warning") return (
    <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-200 bg-amber-50 font-normal">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Degradado
    </Badge>
  )
  if (status === "down") return (
    <Badge variant="destructive" className="gap-1.5 font-normal">
      <span className="h-1.5 w-1.5 rounded-full bg-destructive-foreground" /> Offline
    </Badge>
  )
  return (
    <Badge variant="outline" className="gap-1.5 text-primary border-primary/20 bg-primary/5 font-normal">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Online
    </Badge>
  )
}

function HistoryIcon({ type }: { type: HistoryEvent["type"] }) {
  if (type === "recovery") return <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
  if (type === "degraded") return <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
  return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "O Checkout está com latência elevada. Quer que eu analise os últimos 7 dias?", sender: "assistant" },
  ])
  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages(p => [...p, { id: Math.random().toString(), text: input, sender: "user" }])
    setInput("")
    setTimeout(() => {
      const lower = input.toLowerCase()
      const text = lower.includes("mttr") ? "MTTR médio dos últimos 30 dias: 6min — 40% melhor que a média do setor."
        : lower.includes("uptime") ? "Uptime geral: 99.8% (30d). Checkout com 2 incidentes puxou para baixo."
        : "Checkout tem picos de latência toda sexta às 18h — provável aumento de volume."
      setMessages(p => [...p, { id: Math.random().toString(), text, sender: "assistant" }])
    }, 500)
  }

  return (
    <SidebarProvider>
      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">G</div>
                <div className="flex flex-col leading-none">
                  <span className="font-semibold text-sm">Get Monitor</span>
                  <span className="text-xs text-sidebar-foreground/70">Plano Pro</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <Collapsible defaultOpen className="group/monitor">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2 hover:text-sidebar-accent-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Get Monitor</span>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform group-data-[state=open]/monitor:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {MONITOR_NAV.map(({ Icon, label, active }) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton isActive={active} tooltip={label}>
                          <Icon className="h-4 w-4" /> <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                  <SidebarSeparator />
                  <SidebarMenu>
                    {MONITOR_NAV2.map(({ Icon, label }) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton tooltip={label}><Icon className="h-4 w-4" /> <span>{label}</span></SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                  <SidebarSeparator />
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Configurações"><Settings className="h-4 w-4" /> <span>Configurações</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          <Collapsible className="group/analytics">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2 hover:text-sidebar-accent-foreground">
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>Get Analytics</span>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform group-data-[state=open]/analytics:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {ANALYTICS_NAV.map(({ Icon, label }) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton tooltip={label}><Icon className="h-4 w-4" /> <span>{label}</span></SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          <Collapsible className="group/incidents">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2 hover:text-sidebar-accent-foreground">
                  <AlertOctagon className="h-3.5 w-3.5" />
                  <span>Get Incidents</span>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform group-data-[state=open]/incidents:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {INCIDENTS_NAV.map(({ Icon, label }) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton tooltip={label}><Icon className="h-4 w-4" /> <span>{label}</span></SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Alessandro">
                <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
                  <AvatarFallback className="rounded-lg text-sm font-semibold">A</AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-none text-left">
                  <span className="font-semibold text-sm">Alessandro</span>
                  <span className="text-xs text-sidebar-foreground/70">Founder</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <SidebarInset>
        {/* Topbar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 h-8 w-8 flex-shrink-0" />
            <Separator orientation="vertical" className="h-4 flex-shrink-0" />
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-muted-foreground hidden sm:block">Get Monitor</span>
              <span className="text-muted-foreground hidden sm:block">/</span>
              <span className="font-medium truncate">Visão geral</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" /> Relatório
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Monitor
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-96 p-0 flex flex-col">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Assistente IA
                  </SheetTitle>
                  <SheetDescription className="sr-only">Chat com o assistente</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3 flex gap-2">
                  <Input placeholder="Perguntar..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} className="flex-1 h-9 text-sm" />
                  <Button size="icon" className="h-9 w-9" onClick={sendMessage} disabled={!input.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Alert */}
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span className="font-medium text-amber-800">Checkout com latência elevada</span>
            <span className="text-amber-700 hidden sm:inline">— respondendo em 1.2s (limite: 800ms)</span>
            <Button variant="outline" size="sm" className="ml-auto h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100 flex-shrink-0">
              Ver detalhes
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 items-start">
            <Card>
              <CardContent className="px-4 pt-3 pb-3">
                <p className="text-xs text-muted-foreground font-medium">Status geral</p>
                <p className="text-2xl font-semibold tracking-tight mt-1">5 <span className="text-base font-normal text-muted-foreground">/ 6</span></p>
                <p className="text-xs text-muted-foreground mt-1">1 alerta ativo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4 pt-3 pb-3">
                <p className="text-xs text-muted-foreground font-medium">Uptime (30d)</p>
                <p className="text-2xl font-semibold tracking-tight mt-1 text-primary">99.8%</p>
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +0.2% vs anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4 pt-3 pb-3">
                <p className="text-xs text-muted-foreground font-medium">Incidentes (30d)</p>
                <p className="text-2xl font-semibold tracking-tight mt-1">3</p>
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> −40% vs anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-4 pt-3 pb-3">
                <p className="text-xs text-muted-foreground font-medium">MTTR médio (30d)</p>
                <p className="text-2xl font-semibold tracking-tight mt-1">6 <span className="text-base font-normal text-muted-foreground">min</span></p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Minus className="h-3 w-3" /> estável
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI banner */}
          <Card className="bg-muted/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">O que você quer ver hoje?</span>
              </div>
              <div className="flex gap-2 mb-3">
                <Input placeholder="Ex: 'Por que o checkout está lento?' ou 'Comparar MTTR'" className="flex-1 h-9 text-sm bg-background" />
                <Button size="sm" className="h-9 text-xs">Perguntar</Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["Comparar MTTR", "Tendência de uptime", "Alertas mais acionados", "Incidentes por horário"].map(s => (
                  <Button key={s} variant="outline" size="sm" className="h-auto py-1.5 px-2.5 text-xs text-left justify-start font-normal truncate bg-background">
                    {s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monitors table */}
          <Card>
            <CardHeader className="px-4 py-3 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Monitores ativos</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground px-2">Ver todos →</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4 text-xs h-9">Monitor</TableHead>
                    <TableHead className="text-xs h-9">Status</TableHead>
                    <TableHead className="text-right text-xs h-9">Latência</TableHead>
                    <TableHead className="text-right text-xs h-9">Uptime (30d)</TableHead>
                    <TableHead className="text-right pr-4 text-xs h-9">Últimas 14</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MONITORS.map(m => (
                    <TableRow key={m.name} className="cursor-pointer">
                      <TableCell className="pl-4 py-2.5">
                        <p className="text-sm font-medium leading-none">{m.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{m.url}</p>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <StatusDot status={m.status} />
                      </TableCell>
                      <TableCell className="text-right py-2.5 tabular-nums">
                        <span className={`text-sm ${m.status === "warning" ? "text-amber-600 font-medium" : ""}`}>{m.latency}</span>
                      </TableCell>
                      <TableCell className="text-right py-2.5 tabular-nums">
                        <span className={`text-sm font-medium ${m.status === "warning" ? "text-amber-600" : m.uptime === "100%" ? "text-primary" : ""}`}>{m.uptime}</span>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2.5">
                        <div className="flex justify-end">
                          <Sparkline data={m.sparkline} status={m.status} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t px-4 py-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" /> Adicionar monitor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History + Setup */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader className="px-4 py-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Histórico de incidentes</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground px-2">Ver completo →</Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-3 space-y-1.5">
                {HISTORY.map(ev => (
                  <div key={ev.id} className="flex items-start gap-2.5 rounded-md border bg-muted/30 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors">
                    <HistoryIcon type={ev.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{ev.monitor}</span>
                        {ev.code && (
                          <Badge variant={ev.type === "recovery" ? "secondary" : "destructive"} className="text-[10px] px-1.5 h-4 font-mono rounded">
                            {ev.code}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{ev.summary}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-medium ${ev.duration === "Em aberto" ? "text-amber-600" : ""}`}>{ev.duration}</p>
                      <p className="text-xs text-muted-foreground">{ev.ago}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 py-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Setup completo</CardTitle>
                  <Badge variant="secondary" className="text-xs">6/6</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-3 space-y-1.5">
                {[
                  "Criar primeiro monitor",
                  "Configurar alertas",
                  "Testar primeiro alerta",
                  "Convidar sua equipe",
                  "Criar mais monitores",
                  "Configurar status page",
                ].map((step) => (
                  <div key={step} className="flex items-center gap-2 rounded-md px-2.5 py-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <p className="text-xs text-muted-foreground line-through">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Channels + Templates */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader className="px-4 py-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Canais de alerta</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground px-2">Gerenciar →</Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-3 space-y-2">
                {CHANNELS.map(({ Icon, name, value, count }) => (
                  <div key={name} className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background border flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{value}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="gap-1.5 text-primary border-primary/20 bg-primary/5 font-normal text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Ativo
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">{count}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                  <Zap className="h-3.5 w-3.5" /> Testar alertas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 py-3 pb-0">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-3 grid grid-cols-2 gap-2">
                {TEMPLATES.map(({ Icon, name, desc }) => (
                  <button key={name} className="rounded-md border bg-muted/30 p-3 text-left hover:bg-muted transition-colors group">
                    <Icon className="h-4 w-4 text-muted-foreground mb-2 group-hover:text-foreground transition-colors" />
                    <p className="text-xs font-medium">{name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
