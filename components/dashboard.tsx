"use client"

import React, { useState } from "react"
import {
  Send, TrendingUp, TrendingDown, Minus,
  ChevronRight, LayoutDashboard, Bell, Zap,
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
  { name: "Website principal",   url: "https://getmonitor.io",           status: "up",      latency: "72ms",  uptime: "99.9%", sparkline: [100,100,100,100,100,99,100,100,100,100,100,100,100,100] },
  { name: "API v2",              url: "https://api.getmonitor.io/v2",    status: "up",      latency: "145ms", uptime: "99.7%", sparkline: [100,100,99,100,100,98,100,100,100,99,100,100,100,100] },
  { name: "App mobile (backend)",url: "https://app-api.getmonitor.io",   status: "up",      latency: "89ms",  uptime: "100%",  sparkline: [100,100,100,100,100,100,100,100,100,100,100,100,100,100] },
  { name: "Checkout",            url: "https://checkout.getmonitor.io",  status: "warning", latency: "1.2s",  uptime: "98.2%", sparkline: [100,100,100,98,95,100,100,96,100,100,100,98,100,85] },
  { name: "Dashboard admin",     url: "https://app.getmonitor.io",       status: "up",      latency: "54ms",  uptime: "100%",  sparkline: [100,100,100,100,100,100,100,100,100,100,100,100,100,100] },
  { name: "Status page pública", url: "https://status.getmonitor.io",    status: "up",      latency: "91ms",  uptime: "99.8%", sparkline: [100,100,100,100,99,100,100,100,100,100,99,100,100,100] },
]

const HISTORY: HistoryEvent[] = [
  { id: "1", monitor: "Checkout",             type: "degraded",  summary: "Latência elevada — acima de 1s",              duration: "Em aberto", ago: "agora",       code: "200 SLOW" },
  { id: "2", monitor: "API v2",               type: "recovery",  summary: "Timeout em /auth/refresh — resolvido",         duration: "8 min",     ago: "há 8 dias",   code: "504" },
  { id: "3", monitor: "Website principal",    type: "incident",  summary: "Site indisponível — DNS propagation",          duration: "4 min",     ago: "há 15 dias",  code: "TIMEOUT" },
  { id: "4", monitor: "App mobile (backend)", type: "recovery",  summary: "Falha no endpoint /users — resolvida",         duration: "11 min",    ago: "há 22 dias",  code: "500" },
  { id: "5", monitor: "Checkout",             type: "incident",  summary: "Serviço indisponível durante deploy",          duration: "3 min",     ago: "há 29 dias",  code: "503" },
]

const SETUP_STEPS = [
  { title: "Criar primeiro monitor",  desc: "Website principal" },
  { title: "Configurar alertas",      desc: "WhatsApp e email ativos" },
  { title: "Testar primeiro alerta",  desc: "Teste enviado com sucesso" },
  { title: "Convidar sua equipe",     desc: "3 membros ativos" },
  { title: "Criar mais monitores",    desc: "6 monitores configurados" },
  { title: "Configurar status page",  desc: "status.getmonitor.io" },
]

const CHANNELS = [
  { Icon: Phone,          name: "WhatsApp", value: "+55 11 99999-9999", count: "3 alertas hoje" },
  { Icon: Mail,           name: "Email",    value: "equipe@getmonitor.io", count: "5 alertas hoje" },
  { Icon: MessageSquare,  name: "Slack",    value: "#incidents",          count: "8 alertas hoje" },
]

const TEMPLATES = [
  { Icon: Timer,        name: "MTTR Trend",    desc: "Evolução do tempo médio" },
  { Icon: LineChart,    name: "Uptime Comp.",  desc: "Comparar com período" },
  { Icon: AlertOctagon, name: "Incidentes",    desc: "Histórico e distribuição" },
  { Icon: Megaphone,    name: "Alertas",       desc: "Volume por canal" },
]

// ── Sidebar nav ────────────────────────────────────────────────────────────

const MONITOR_NAV  = [
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

function Sparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const w = 72, h = 20
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ")
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatusDot({ status }: { status: MonitorStatus }) {
  const cls = status === "warning" ? "bg-amber-400 animate-pulse" : status === "down" ? "bg-destructive" : "bg-emerald-500"
  return <div className={`h-2 w-2 rounded-full flex-shrink-0 ${cls}`} />
}

function HistoryTypeIcon({ type }: { type: HistoryEvent["type"] }) {
  if (type === "recovery") return <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
  if (type === "degraded") return <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
  return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Olá! Vejo que o Checkout está com latência elevada. Quer que eu analise os últimos 7 dias?", sender: "assistant" },
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
        : "Checkout tem picos de latência toda sexta às 18h — provável aumento de volume no fim do expediente."
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm flex-shrink-0">G</div>
                <div className="flex flex-col leading-none">
                  <span className="font-semibold text-sm text-sidebar-accent-foreground">Get Monitor</span>
                  <span className="text-xs text-sidebar-foreground">Plano Pro</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <Collapsible defaultOpen className="group/monitor">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground">
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
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground">
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
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground">
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
                  <AvatarFallback className="rounded-lg bg-zinc-700 text-zinc-200 font-semibold text-sm">A</AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-none text-left">
                  <span className="font-semibold text-sm text-sidebar-accent-foreground">Alessandro</span>
                  <span className="text-xs text-sidebar-foreground">Founder</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <SidebarInset className="min-w-0 bg-zinc-50/50">

        {/* Topbar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 h-8 w-8" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-semibold">Visão geral</span>
            <span className="text-xs text-muted-foreground hidden sm:block">— atualizado agora mesmo</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <BarChart2 className="h-3.5 w-3.5" /> Relatório
            </Button>
            <Button size="sm" className="h-8 text-xs">
              <Plus className="h-3.5 w-3.5" /> Monitor
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white border-0">
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-96 p-0 flex flex-col">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" /> Assistente Get Monitor
                  </SheetTitle>
                  <SheetDescription className="sr-only">Chat com o assistente IA</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-muted text-foreground"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3 flex gap-2">
                  <Input placeholder="Faça uma pergunta..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} className="flex-1 h-9 text-sm" />
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

          {/* Alert banner */}
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold text-amber-800">Checkout com latência elevada</span>
            <span className="text-amber-700">— respondendo em 1.2s (limite: 800ms)</span>
            <Button variant="outline" size="sm" className="ml-auto h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">Ver detalhes</Button>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground">Status geral</span>
                </div>
                <p className="text-xl font-bold">5 de 6 online</p>
                <p className="text-xs text-muted-foreground mt-0.5">1 alerta ativo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Uptime (30d)</p>
                <p className="text-2xl font-bold text-emerald-600">99.8%</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                  <TrendingUp className="h-3 w-3" /> +0.2% vs anterior
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Incidentes (30d)</p>
                <p className="text-2xl font-bold">3</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                  <TrendingDown className="h-3 w-3" /> −40% vs anterior
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">MTTR médio (30d)</p>
                <p className="text-2xl font-bold">6min</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Minus className="h-3 w-3" /> estável
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI banner */}
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">O que você quer ver hoje?</span>
              </div>
              <div className="flex gap-2 mb-3">
                <Input placeholder="Ex: 'Por que o checkout está lento?' ou 'Comparar MTTR'" className="flex-1 h-9 text-sm bg-white" />
                <Button className="h-9 text-xs">Usar IA</Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["Comparar MTTR", "Tendência de uptime", "Alertas mais acionados", "Incidentes por horário"].map(s => (
                  <button key={s} className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors text-left truncate">{s}</button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monitors table */}
          <Card>
            <CardHeader className="px-4 py-3 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Monitores ativos</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 hover:text-emerald-700 px-2">Ver todos →</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4 text-xs">Monitor</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Latência</TableHead>
                    <TableHead className="text-right text-xs">Uptime (30d)</TableHead>
                    <TableHead className="text-right pr-4 text-xs">Últimas 14</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MONITORS.map(m => (
                    <TableRow key={m.name} className="cursor-pointer">
                      <TableCell className="pl-4 py-2.5">
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{m.url}</p>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={m.status} />
                          <span className={`text-xs font-medium ${m.status === "warning" ? "text-amber-600" : m.status === "down" ? "text-red-600" : "text-emerald-600"}`}>
                            {m.status === "up" ? "Online" : m.status === "warning" ? "Lento" : "Offline"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-2.5">
                        <span className={`text-sm ${m.status === "warning" ? "text-amber-600 font-semibold" : ""}`}>{m.latency}</span>
                      </TableCell>
                      <TableCell className="text-right py-2.5">
                        <span className={`text-sm font-medium ${m.status === "warning" ? "text-amber-600" : m.uptime === "100%" ? "text-emerald-600" : ""}`}>{m.uptime}</span>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2.5">
                        <div className="flex justify-end">
                          <Sparkline data={m.sparkline} color={m.status === "warning" ? "#d97706" : "#10b981"} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t px-4 py-2.5">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" /> Adicionar monitor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Histórico + Setup */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader className="px-4 py-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Histórico de incidentes</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 px-2">Ver completo →</Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-3 space-y-2">
                {HISTORY.map(ev => (
                  <div key={ev.id} className="flex items-start gap-2.5 rounded-lg border bg-muted/20 px-3 py-2.5 hover:bg-muted/40 cursor-pointer transition-colors">
                    <HistoryTypeIcon type={ev.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{ev.monitor}</span>
                        {ev.code && (
                          <Badge variant={ev.type === "recovery" ? "secondary" : "destructive"} className="text-xs px-1.5 py-0 h-4 font-mono rounded">
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
                  <CardTitle className="text-sm">Setup completo</CardTitle>
                  <span className="text-xs text-emerald-600 font-semibold">6/6</span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-3 space-y-1.5">
                {SETUP_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md bg-muted/20 px-2.5 py-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium line-through text-muted-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground/60">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Canais + Templates */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader className="px-4 py-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Canais de alerta</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 px-2">Gerenciar →</Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-3 space-y-2">
                {CHANNELS.map(({ Icon, name, value, count }) => (
                  <div key={name} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 flex-shrink-0">
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{value}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1.5 justify-end">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-emerald-600">Ativo</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{count}</p>
                    </div>
                  </div>
                ))}
                <Separator className="my-1" />
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                  <Zap className="h-3.5 w-3.5" /> Testar alertas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 py-3 pb-0">
                <CardTitle className="text-sm">Templates</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-3 grid grid-cols-2 gap-2">
                {TEMPLATES.map(({ Icon, name, desc }) => (
                  <button key={name} className="rounded-lg border bg-muted/20 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group">
                    <Icon className="h-5 w-5 text-muted-foreground mb-2 group-hover:text-emerald-600 transition-colors" />
                    <p className="text-xs font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</p>
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
