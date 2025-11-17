"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  GraduationCap,
  Calendar,
  FileText,
  Users,
  Settings,
  Moon,
  Sun,
  MessageCircle,
  Clock,
  BookOpen,
  CreditCard,
  X,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"
// Base para las imágenes de horarios (puedes cambiarla con NEXT_PUBLIC_HORARIO_BASE_URL)
const HORARIO_BASE_URL =
  process.env.NEXT_PUBLIC_HORARIO_BASE_URL ?? `${API_BASE_URL}/static/Horarios`

interface HorarioData {
  tiene_horario: boolean
  carnet: string
  nombre: string
  grupo?: string | null
  periodo?: string | null
  titulo?: string | null
  horario_id?: number | null
  archivo?: string | null
  grupos?: {
    grupo: string
    horarios: {
      pk: number
      group_code: string
      titulo: string
      periodo: string
      activo: boolean
      original_filename: string
    }[]
  }[]
}

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  type?:
    | "text"
    | "scholarship-options"
    | "scholarship-requirements"
    | "services-options"
    | "scholarship-status"
    | "scholarship-detail"
    | "ask-carnet"
    | "schedule"
    | "tramite"
  scholarshipType?: string
  serviceType?: string
  options?: string[]
  requirements?: string[]

  carnet?: string
  nombre?: string
  periodo?: string | null
  estado?: string | null
  activo?: boolean
  beca?: string | null
  porcentaje?: number | null

  horario?: HorarioData
  tramiteTipo?: string
  tramiteTitulo?: string
  tramiteDescripcion?: string
  tramiteRequisitos?: string[]
}

const quickActions = [
  { icon: Calendar, label: "Horarios", description: "Consultar horarios de clases" },
  { icon: CreditCard, label: "Matrícula", description: "Información de matrícula" },
  { icon: FileText, label: "Requisitos", description: "Requisitos académicos" },
  { icon: Users, label: "Servicios", description: "Servicios estudiantiles" },
]

export function StudentAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu Asistente Estudiantil. Estoy aquí para ayudarte con información sobre horarios, matrículas, requisitos académicos y servicios universitarios. ¿En qué puedo ayudarte hoy?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isDark, setIsDark] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Autoscroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    const userInput = inputValue
    setInputValue("")

    setTimeout(async () => {
      try {
        const nlpRes = await fetch(`${API_BASE_URL}/api/nlp/intent/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: userInput }),
        })

        if (!nlpRes.ok) {
          const errText = await nlpRes.text().catch(() => "")
          throw new Error(`HTTP ${nlpRes.status} ${errText}`)
        }

        const nlpData = await nlpRes.json()
        const intent: string | undefined = nlpData.intent
        const confidence: number = nlpData.confidence ?? 0
        const answer = nlpData.answer ?? {}

        // Petición de carnet
        if (typeof answer.mensaje === "string" && /carnet/i.test(answer.mensaje)) {
          const ask: Message = {
            id: (Date.now() + 1).toString(),
            content: answer.mensaje,
            sender: "assistant",
            timestamp: new Date(),
            type: "ask-carnet",
          }
          setMessages((prev) => [...prev, ask])
          return
        }

        // ======================
        // BECAS
        // ======================

        // Aplicar beca
        if (intent === "aplicar_beca") {
          if (answer?.becas?.length) {
            const beca = answer.becas[0]
            const msg: Message = {
              id: (Date.now() + 1).toString(),
              content: `Requisitos para ${beca.tipo}:`,
              sender: "assistant",
              timestamp: new Date(),
              type: "scholarship-requirements",
              scholarshipType: beca.tipo,
              requirements: beca.requisitos,
            }
            setMessages((prev) => [...prev, msg])
            return
          }

          if (answer?.tipos_becas?.length) {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                content: answer.mensaje ?? "Elige una beca para ver cómo aplicar:",
                sender: "assistant",
                timestamp: new Date(),
                type: "text",
              },
              {
                id: (Date.now() + 2).toString(),
                content: "Becas disponibles:",
                sender: "assistant",
                timestamp: new Date(),
                type: "scholarship-options",
                options: answer.tipos_becas,
              },
            ])
            return
          }
        }

        // Tipos de becas
        if (intent === "tipos_becas" && answer?.tipos_becas?.length) {
          const tipos: string[] = answer.tipos_becas
          const response: Message = {
            id: (Date.now() + 1).toString(),
            content: "Aquí tienes las becas disponibles:",
            sender: "assistant",
            timestamp: new Date(),
            type: "scholarship-options",
            options: tipos,
          }
          setMessages((prev) => [...prev, response])
          return
        }

        // Requisitos de becas
        if (intent === "requisitos_becas") {
          if (answer?.becas?.length) {
            const beca = answer.becas[0]
            const response: Message = {
              id: (Date.now() + 1).toString(),
              content: `Requisitos para ${beca.tipo}:`,
              sender: "assistant",
              timestamp: new Date(),
              type: "scholarship-requirements",
              scholarshipType: beca.tipo,
              requirements: beca.requisitos,
            }
            setMessages((prev) => [...prev, response])
            return
          }

          if (answer?.requisitos_por_beca) {
            const tipos = Object.keys(answer.requisitos_por_beca)
            const response: Message = {
              id: (Date.now() + 1).toString(),
              content: "Selecciona una beca para ver sus requisitos:",
              sender: "assistant",
              timestamp: new Date(),
              type: "scholarship-options",
              options: tipos,
            }
            setMessages((prev) => [...prev, response])
            return
          }
        }

        // Dónde recibo la beca
        if (intent === "donde_recibo_beca" && typeof answer.mensaje === "string") {
          const msg: Message = {
            id: (Date.now() + 1).toString(),
            content: answer.mensaje,
            sender: "assistant",
            timestamp: new Date(),
            type: "text",
          }
          setMessages((prev) => [...prev, msg])
          return
        }

        // ¿Tengo beca?
        if (intent === "estado_beca" && answer?.estado_beca) {
          const a = answer.estado_beca as {
            tiene_beca: boolean
            carnet?: string
            nombre?: string
            periodo?: string | null
            estado?: string | null
            activo?: boolean
          }
          const msg: Message = {
            id: (Date.now() + 1).toString(),
            content: a.tiene_beca ? "Sí, tienes beca activa:" : "No tienes una beca asignada.",
            sender: "assistant",
            timestamp: new Date(),
            type: "scholarship-status",
            carnet: a.carnet,
            nombre: a.nombre,
            periodo: a.periodo ?? null,
            estado: a.estado ?? null,
            activo: !!a.activo,
          }
          setMessages((prev) => [...prev, msg])
          return
        }

        // ¿Cuál beca tengo?
        if (intent === "detalle_beca" && answer?.detalle_beca) {
          const d = answer.detalle_beca as {
            tiene_beca: boolean
            carnet?: string
            nombre?: string
            beca?: string | null
            porcentaje?: number | null
            periodo?: string | null
            estado?: string | null
            activo?: boolean
          }
          const msg: Message = {
            id: (Date.now() + 1).toString(),
            content: d.tiene_beca ? "Detalle de tu beca:" : "No tienes una beca asignada.",
            sender: "assistant",
            timestamp: new Date(),
            type: "scholarship-detail",
            carnet: d.carnet,
            nombre: d.nombre,
            beca: d.beca ?? null,
            porcentaje: d.porcentaje ?? null,
            periodo: d.periodo ?? null,
            estado: d.estado ?? null,
            activo: !!d.activo,
          }
          setMessages((prev) => [...prev, msg])
          return
        }

        // ======================
        // HORARIO ESTUDIANTE → aquí pintamos las imágenes
        // ======================
        if (intent === "horario_estudiante" && answer?.horario) {
          const h = answer.horario as HorarioData
          const msg: Message = {
            id: (Date.now() + 1).toString(),
            content:
              typeof answer.mensaje === "string"
                ? answer.mensaje
                : "Estos son tus grupos y horarios:",
            sender: "assistant",
            timestamp: new Date(),
            type: "schedule",
            horario: h,
          }
          setMessages((prev) => [...prev, msg])
          return
        }

                // ======================
        // TRÁMITES → mostrar requisitos
        // ======================

        // Trámite de título universitario
        if (intent === "tramite_titulo" && answer?.tramite === "titulo_universitario") {
          const msg: Message = {
            id: (Date.now() + 1).toString(),
            content:
              typeof answer.mensaje === "string"
                ? answer.mensaje
                : "Estos son los requisitos para el trámite de título universitario:",
            sender: "assistant",
            timestamp: new Date(),
            type: "tramite",
            tramiteTipo: answer.tramite,
            tramiteTitulo: answer.titulo,
            tramiteDescripcion: answer.descripcion,
            tramiteRequisitos: answer.requisitos ?? [],
          }
          setMessages((prev) => [...prev, msg])
          return
        }

        // Trámite de baja de la universidad
        if (intent === "tramite_baja" && answer?.tramite === "baja_universidad") {
          const msg: Message = {
            id: (Date.now() + 1).toString(),
            content:
              typeof answer.mensaje === "string"
                ? answer.mensaje
                : "Estos son los requisitos para el trámite de baja de la universidad:",
            sender: "assistant",
            timestamp: new Date(),
            type: "tramite",
            tramiteTipo: answer.tramite,
            tramiteTitulo: answer.titulo,
            tramiteDescripcion: answer.descripcion,
            tramiteRequisitos: answer.requisitos ?? [],
          }
          setMessages((prev) => [...prev, msg])
          return
        }

        // Trámites de monografía (puede venir varios)
        if (intent === "tramite_monografia" && Array.isArray(answer?.tramites)) {
          // Primer mensaje con el texto general
          const intro: Message = {
            id: (Date.now() + 1).toString(),
            content:
              typeof answer.mensaje === "string"
                ? answer.mensaje
                : "Aquí tienes los trámites y requisitos relacionados con la monografía:",
            sender: "assistant",
            timestamp: new Date(),
            type: "text",
          }

          const cards: Message[] = answer.tramites.map((t: any, idx: number) => ({
            id: (Date.now() + 2 + idx).toString(),
            content: t.titulo || "Trámite de monografía",
            sender: "assistant",
            timestamp: new Date(),
            type: "tramite",
            tramiteTipo: answer.tramite,
            tramiteTitulo: t.titulo,
            tramiteDescripcion: t.descripcion,
            tramiteRequisitos: t.requisitos ?? [],
          }))

          setMessages((prev) => [...prev, intro, ...cards])
          return
        }



        // ======================
        // RESPUESTAS GENÉRICAS DEL BACKEND
        // (horarios, matrícula, trámites, etc.)
        // ======================
        if (typeof answer.mensaje === "string") {
          const assistantResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: answer.mensaje,
            sender: "assistant",
            timestamp: new Date(),
            type: "text",
          }
          setMessages((prev) => [...prev, assistantResponse])
          return
        }

        // ======================
        // INTENCIÓN POCO CONFIABLE O DESCONOCIDA
        // ======================
        if (!intent || confidence < 0.55) {
          const assistantResponse: Message = {
            id: (Date.now() + 1).toString(),
            content:
              "No estoy seguro. ¿Te interesan los tipos de beca, los requisitos de una beca específica o información sobre horarios/matrícula?",
            sender: "assistant",
            timestamp: new Date(),
            type: "text",
          }
          setMessages((prev) => [...prev, assistantResponse])
          return
        }

        // ======================
        // FALLBACK FINAL
        // ======================
        const fallback: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "Gracias por tu consulta. ¿Podrías precisar si deseas tipos de becas, requisitos, o información sobre horarios/matrícula?",
          sender: "assistant",
          timestamp: new Date(),
          type: "text",
        }
        setMessages((prev) => [...prev, fallback])
      } catch (error: any) {
        console.error("Error al conectar con la API:", error)
        const errorMessage: Message = {
          id: (Date.now() + 3).toString(),
          content: `❌ Ocurrió un error al conectar con la API del servidor Django: ${
            error?.message ?? String(error)
          }`,
          sender: "assistant",
          timestamp: new Date(),
          type: "text",
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    }, 600)
  }

  const AskCarnetCard = ({
    onSubmit,
  }: {
    onSubmit: (carnet: string, mode: "estado" | "detalle") => void
  }) => {
    const [carnet, setCarnet] = useState("")

    return (
      <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
        <div className="mb-2">
          Necesito tu carnet (formato <code>2021-0001I</code>)
        </div>
        <div className="flex gap-2">
          <Input
            value={carnet}
            onChange={(e) => setCarnet(e.target.value)}
            placeholder="2021-0001I"
            className="max-w-[180px]"
            onKeyDown={(e) => e.key === "Enter" && carnet && onSubmit(carnet, "estado")}
          />
          <Button disabled={!carnet} onClick={() => onSubmit(carnet, "estado")}>
            Ver si tengo beca
          </Button>
          <Button variant="outline" disabled={!carnet} onClick={() => onSubmit(carnet, "detalle")}>
            Ver cuál beca tengo
          </Button>
        </div>
      </div>
    )
  }

  const handleQuickAction = (action: string) => {
    setInputValue(`Necesito información sobre ${action.toLowerCase()}`)
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleScholarshipSelection = async (scholarshipType: string) => {
    try {
      const q = `¿Cuáles son los requisitos de la ${scholarshipType}?`
      const res = await fetch(`${API_BASE_URL}/api/nlp/intent/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()

      if (data.intent === "requisitos_becas" && data.answer?.becas?.length) {
        const beca = data.answer.becas[0]
        const msg: Message = {
          id: (Date.now() + 1).toString(),
          content: `Requisitos para ${beca.tipo}:`,
          sender: "assistant",
          timestamp: new Date(),
          type: "scholarship-requirements",
          scholarshipType: beca.tipo,
          requirements: beca.requisitos,
        }
        setMessages((prev) => [...prev, msg])
        return
      }

      const msg: Message = {
        id: (Date.now() + 1).toString(),
        content: `No pude encontrar requisitos específicos para "${scholarshipType}". ¿Puedes reformular?`,
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      }

      setMessages((prev) => [...prev, msg])
    } catch (e) {
      console.error(e)
      const msg: Message = {
        id: (Date.now() + 1).toString(),
        content: "❌ Error al obtener los requisitos.",
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, msg])
    }
  }

  const ScholarshipOptions = ({ options }: { options: string[] }) => (
    <div className="space-y-3 mt-3">
      {options.map((opt) => (
        <Button
          key={opt}
          variant="outline"
          className="w-full justify-start text-left h-auto p-3 shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10 transition-shadow bg-transparent"
          onClick={() => handleScholarshipSelection(opt)}
        >
          <div>
            <div className="font-medium">{opt}</div>
            <div className="text-sm text-muted-foreground">Ver requisitos</div>
          </div>
        </Button>
      ))}
    </div>
  )

  const submitCarnetFollowup = async (carnet: string, mode: "estado" | "detalle") => {
    const pregunta = mode === "estado" ? `¿Tengo beca? ${carnet}` : `¿Cuál beca tengo? ${carnet}`

    try {
      const res = await fetch(`${API_BASE_URL}/api/nlp/intent/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: pregunta }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        throw new Error(`HTTP ${res.status} ${errText}`)
      }

      const ct = res.headers.get("content-type") || ""
      if (!ct.includes("application/json")) {
        throw new Error("La API no devolvió JSON.")
      }

      const nlpData = await res.json()
      const intent: string | undefined = nlpData.intent
      const confidence: number = nlpData.confidence ?? 0

      if (intent === "estado_beca" && nlpData.answer?.estado_beca) {
        const a = nlpData.answer.estado_beca
        const msg: Message = {
          id: (Date.now() + 1).toString(),
          content: a.tiene_beca ? "Sí, tienes beca activa:" : "No tienes una beca asignada.",
          sender: "assistant",
          timestamp: new Date(),
          type: "scholarship-status",
          carnet: a.carnet,
          nombre: a.nombre,
          periodo: a.periodo ?? null,
          estado: a.estado ?? null,
          activo: !!a.activo,
        }
        setMessages((prev) => [...prev, msg])
        return
      }

      if (intent === "detalle_beca" && nlpData.answer?.detalle_beca) {
        const d = nlpData.answer.detalle_beca
        const msg: Message = {
          id: (Date.now() + 1).toString(),
          content: d.tiene_beca ? "Detalle de tu beca:" : "No tienes una beca asignada.",
          sender: "assistant",
          timestamp: new Date(),
          type: "scholarship-detail",
          carnet: d.carnet,
          nombre: d.nombre,
          beca: d.beca ?? null,
          porcentaje: d.porcentaje ?? null,
          periodo: d.periodo ?? null,
          estado: d.estado ?? null,
          activo: !!d.activo,
        }
        setMessages((prev) => [...prev, msg])
        return
      }

      if (!intent || confidence < 0.55) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: "No pude resolver la consulta con ese carnet. Verifica el formato (ej: 2021-0001I).",
            sender: "assistant",
            timestamp: new Date(),
            type: "text",
          },
        ])
        return
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "No pude resolver la consulta con ese carnet. Verifica el formato (ej: 2021-0001I).",
          sender: "assistant",
          timestamp: new Date(),
          type: "text",
        },
      ])
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: `❌ Error API: ${e?.message ?? String(e)}`,
          sender: "assistant",
          timestamp: new Date(),
          type: "text",
        },
      ])
    }
  }

  const ScholarshipStatusCard = ({
    nombre,
    carnet,
    periodo,
    estado,
    activo,
  }: {
    nombre?: string
    carnet?: string
    periodo?: string | null
    estado?: string | null
    activo?: boolean
  }) => (
    <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
      <div className="font-medium">
        {nombre} ({carnet})
      </div>
      <div className="mt-1">
        Estado: <span className="font-medium">{estado ?? "—"}</span> {activo ? "✅" : "⛔"}
      </div>
      {periodo && (
        <div>
          Periodo: <span className="font-medium">{periodo}</span>
        </div>
      )}
    </div>
  )

  const ScholarshipDetailCard = ({
    nombre,
    carnet,
    beca,
    porcentaje,
    periodo,
    estado,
    activo,
  }: {
    nombre?: string
    carnet?: string
    beca?: string | null
    porcentaje?: number | null
    periodo?: string | null
    estado?: string | null
    activo?: boolean
  }) => (
    <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
      <div className="font-medium">
        {nombre} ({carnet})
      </div>
      <div className="mt-1">
        Beca: <span className="font-medium">{beca ?? "—"}</span>
      </div>
      {porcentaje != null && (
        <div>
          Cobertura: <span className="font-medium">{porcentaje}%</span>
        </div>
      )}
      {periodo && (
        <div>
          Periodo: <span className="font-medium">{periodo}</span>
        </div>
      )}
      <div>
        Estado: <span className="font-medium">{estado ?? "—"}</span> {activo ? "✅" : "⛔"}
      </div>
    </div>
  )
// Tarjeta para mostrar horarios e imágenes con zoom
const ScheduleCard = ({ horario }: { horario: HorarioData }) => {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)

  if (!horario.tiene_horario) {
    return (
      <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
        <div className="font-medium">
          {horario.nombre} ({horario.carnet})
        </div>
        <div className="mt-1">
          No se encontraron horarios registrados para tus grupos.
        </div>
      </div>
    )
  }

  const mainFile = horario.archivo
  // recolectar otros archivos de otros grupos
  const extraFiles = new Set<string>()
  horario.grupos?.forEach((g) => {
    g.horarios.forEach((h) => {
      if (h.original_filename && h.original_filename !== mainFile) {
        extraFiles.add(h.original_filename)
      }
    })
  })

  const openZoom = (file: string) => {
    setZoomSrc(`${HORARIO_BASE_URL}/${file}`)
  }

  const closeZoom = () => setZoomSrc(null)

  return (
    <>
      <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
        <div className="font-medium">
          {horario.nombre} ({horario.carnet})
        </div>
        {horario.grupo && (
          <div className="mt-1">
            Grupo principal: <span className="font-medium">{horario.grupo}</span>
          </div>
        )}
        {horario.periodo && (
          <div>
            Periodo: <span className="font-medium">{horario.periodo}</span>
          </div>
        )}
        {horario.titulo && (
          <div>
            Título: <span className="font-medium">{horario.titulo}</span>
          </div>
        )}

        {mainFile && (
          <div className="mt-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
              <span>Horario del grupo principal</span>
              <span className="text-[11px]">Toca la imagen para ampliarla</span>
            </div>
            <img
              src={`${HORARIO_BASE_URL}/${mainFile}`}
              alt={horario.titulo ?? `Horario ${horario.grupo}`}
              className="w-full max-h-[320px] object-contain rounded-lg border border-border/50 bg-background cursor-zoom-in"
              onClick={() => openZoom(mainFile)}
            />
          </div>
        )}

        {extraFiles.size > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">
              Otros horarios asociados a tus grupos:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...extraFiles].map((file) => (
                <button
                  key={file}
                  type="button"
                  className="border border-border/40 rounded-lg p-2 bg-background/80 cursor-zoom-in text-left"
                  onClick={() => openZoom(file)}
                >
                  <img
                    src={`${HORARIO_BASE_URL}/${file}`}
                    alt={file}
                    className="w-full max-h-[220px] object-contain rounded"
                  />
                  <div className="text-[11px] text-muted-foreground mt-1 break-all">
                    {file}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de zoom */}
      {zoomSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={closeZoom}
        >
          <div
            className="relative max-w-5xl max-h-[95vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeZoom}
              className="absolute -top-3 -right-3 md:top-0 md:right-0 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={zoomSrc}
              alt="Horario ampliado"
              className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl bg-background"
            />
          </div>
        </div>
      )}
    </>
  )
}

const TramiteCard = ({
  tipo,
  titulo,
  descripcion,
  requisitos,
}: {
  tipo?: string
  titulo?: string
  descripcion?: string
  requisitos?: string[]
}) => {
  return (
    <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
      {titulo && <div className="font-medium mb-1">{titulo}</div>}
      {tipo && (
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Trámite: {tipo.replace("_", " ")}
        </div>
      )}
      {descripcion && <p className="mb-3">{descripcion}</p>}
      {requisitos && requisitos.length > 0 && (
        <>
          <div className="font-medium mb-2">Requisitos:</div>
          <ul className="space-y-2">
            {requisitos.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

  const ServicesOptions = () => {
    const generateSpecificServiceResponse = (serviceType: string): Message => {
      if (serviceType === "cursos") {
        return {
          id: (Date.now() + 1).toString(),
          content:
            "Por el momento no contamos con la información relacionada a cursos de posgrado. Puedes visitar el sitio web: https://posgrado.uni.edu.ni/ para más detalles.",
          sender: "assistant",
          timestamp: new Date(),
          type: "text",
        }
      } else if (serviceType === "maestrias" || serviceType === "doctorados") {
        return {
          id: (Date.now() + 1).toString(),
          content: `Por el momento no tenemos información de ${serviceType}. Puedes visitar el sitio web: https://posgrado.uni.edu.ni/ para más detalles.`,
          sender: "assistant",
          timestamp: new Date(),
          type: "text",
        }
      }
      return {
        id: (Date.now() + 1).toString(),
        content: "Información no disponible en este momento.",
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      }
    }

    return (
      <div className="space-y-3 mt-3">
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto p-3 shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10 transition-shadow bg-transparent"
          onClick={() => {
            const response = generateSpecificServiceResponse("cursos")
            setMessages((prev) => [...prev, response])
          }}
        >
          <div>
            <div className="font-medium">Cursos</div>
            <div className="text-sm text-muted-foreground">Cursos de posgrado</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto p-3 shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10 transition-shadow bg-transparent"
          onClick={() => {
            const response = generateSpecificServiceResponse("maestrias")
            setMessages((prev) => [...prev, response])
          }}
        >
          <div>
            <div className="font-medium">Maestrías</div>
            <div className="text-sm text-muted-foreground">Programas de maestría</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto p-3 shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10 transition-shadow bg-transparent"
          onClick={() => {
            const response = generateSpecificServiceResponse("doctorados")
            setMessages((prev) => [...prev, response])
          }}
        >
          <div>
            <div className="font-medium">Doctorados</div>
            <div className="text-sm text-muted-foreground">Programas de doctorado</div>
          </div>
        </Button>
      </div>
    )
  }

  const renderMessageContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = content.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300`}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm dark:shadow-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md dark:shadow-white/10">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Asistente Estudiantil</h1>
              <p className="text-sm text-muted-foreground">Universidad Virtual</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              En línea
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10 transition-shadow"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Consultas frecuentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Card
                key={action.label}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-all duration-200 border-border/50 hover:border-primary/20 shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10"
                onClick={() => handleQuickAction(action.label)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm text-foreground">{action.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <Card className="mb-6 border-border/50 shadow-sm dark:shadow-white/5">
          <div className="p-6">
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0 shadow-sm dark:shadow-white/10">
                    <AvatarFallback
                      className={
                        message.sender === "assistant"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }
                    >
                      {message.sender === "assistant" ? (
                        <GraduationCap className="w-4 h-4" />
                      ) : (
                        "U"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[80%] ${message.sender === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-3 rounded-2xl text-sm leading-relaxed shadow-sm dark:shadow-white/5 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-line">
                        {renderMessageContent(message.content)}
                      </div>

                      {message.type === "scholarship-options" && (
                        <ScholarshipOptions options={message.options ?? []} />
                      )}

                      {message.type === "scholarship-requirements" && message.requirements && (
                        <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50">
                          <ul className="space-y-2 text-sm">
                            {message.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.type === "ask-carnet" && (
                        <AskCarnetCard onSubmit={submitCarnetFollowup} />
                      )}

                      {message.type === "services-options" && <ServicesOptions />}

                      {message.type === "scholarship-status" && (
                        <ScholarshipStatusCard
                          nombre={message.nombre}
                          carnet={message.carnet}
                          periodo={message.periodo}
                          estado={message.estado}
                          activo={message.activo}
                        />
                      )}

                      {message.type === "scholarship-detail" && (
                        <ScholarshipDetailCard
                          nombre={message.nombre}
                          carnet={message.carnet}
                          beca={message.beca}
                          porcentaje={message.porcentaje}
                          periodo={message.periodo}
                          estado={message.estado}
                          activo={message.activo}
                        />
                      )}

                      {message.type === "schedule" && message.horario && (
                        <ScheduleCard horario={message.horario} />
                      )}
                      {message.type === "tramite" && (
                    <TramiteCard
                      tipo={message.tramiteTipo}
                      titulo={message.tramiteTitulo}
                      descripcion={message.tramiteDescripcion}
                      requisitos={message.tramiteRequisitos}
                    />
                  )}

                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {message.timestamp.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </Card>
        
        {/* Input Area */}
        <Card className="border-border/50 shadow-sm dark:shadow-white/5">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu consulta sobre horarios, matrícula, requisitos o servicios..."
                  className="border-border/50 focus:border-primary/50 bg-background shadow-inner dark:shadow-black/20 focus:shadow-sm dark:focus:shadow-white/5 transition-shadow"
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-4 shadow-sm dark:shadow-white/10 hover:shadow-md dark:hover:shadow-white/15 transition-shadow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Información académica actualizada
                </span>
                <span className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Respuestas personalizadas
                </span>
              </div>
              <span>Presiona Enter para enviar</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

//posole