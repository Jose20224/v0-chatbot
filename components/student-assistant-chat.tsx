"use client"

import { useState } from "react"
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
} from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  type?: "text" | "scholarship-options" | "scholarship-requirements" | "services-options"
  scholarshipType?: string
  serviceType?: string
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

  const detectScholarshipQuery = (message: string): boolean => {
    const scholarshipKeywords = ["beca", "becas", "ayuda económica", "financiamiento", "apoyo económico"]
    return scholarshipKeywords.some((keyword) => message.toLowerCase().includes(keyword))
  }

  const detectSpecificScholarshipQuery = (message: string): string | null => {
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes("beca monetaria") || lowerMessage.includes("monetaria")) {
      return "monetaria"
    }
    if (lowerMessage.includes("beca vivienda") || lowerMessage.includes("vivienda")) {
      return "vivienda"
    }
    if (lowerMessage.includes("beca transporte") || lowerMessage.includes("transporte")) {
      return "transporte"
    }
    return null
  }

  const detectScheduleQuery = (message: string): boolean => {
    const scheduleKeywords = ["horario", "horarios", "clases", "calendario", "cronograma"]
    return scheduleKeywords.some((keyword) => message.toLowerCase().includes(keyword))
  }

  const detectServicesQuery = (message: string): boolean => {
    const servicesKeywords = ["servicios", "cursos", "maestria", "maestrias", "doctorado", "doctorados", "posgrado"]
    return servicesKeywords.some((keyword) => message.toLowerCase().includes(keyword))
  }

  const detectSpecificServiceQuery = (message: string): string | null => {
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes("cursos") || lowerMessage.includes("curso")) {
      return "cursos"
    }
    if (lowerMessage.includes("maestria") || lowerMessage.includes("maestrias")) {
      return "maestrias"
    }
    if (lowerMessage.includes("doctorado") || lowerMessage.includes("doctorados")) {
      return "doctorados"
    }
    return null
  }

  const generateScholarshipResponse = (): Message => {
    return {
      id: (Date.now() + 1).toString(),
      content: "Claro, aquí tienes las becas disponibles:",
      sender: "assistant",
      timestamp: new Date(),
      type: "scholarship-options",
    }
  }

  const generateScholarshipRequirements = (scholarshipType: string): Message => {
    if (scholarshipType === "monetaria") {
      return {
        id: (Date.now() + 1).toString(),
        content: "Requisitos para Beca Monetaria:",
        sender: "assistant",
        timestamp: new Date(),
        type: "scholarship-requirements",
        scholarshipType: "monetaria",
      }
    } else {
      return {
        id: (Date.now() + 1).toString(),
        content: `Por el momento no contamos con la información relacionada a esta beca "${scholarshipType}".`,
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      }
    }
  }

  const generateScheduleResponse = (): Message => {
    return {
      id: (Date.now() + 1).toString(),
      content:
        "Puedes consultar los horarios de tus clases en el portal del estudiante, sección 'Horarios'. Si necesitas ayuda adicional, por favor especifica tu consulta.",
      sender: "assistant",
      timestamp: new Date(),
      type: "text",
    }
  }

  const generateServicesResponse = (): Message => {
    return {
      id: (Date.now() + 1).toString(),
      content: "Contamos con cursos, maestrías y doctorados:",
      sender: "assistant",
      timestamp: new Date(),
      type: "services-options",
    }
  }

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

    setTimeout(() => {
      const specificScholarship = detectSpecificScholarshipQuery(userInput)
      const specificService = detectSpecificServiceQuery(userInput)

      if (specificScholarship) {
        const scholarshipResponse = generateScholarshipRequirements(specificScholarship)
        setMessages((prev) => [...prev, scholarshipResponse])
      } else if (detectScholarshipQuery(userInput)) {
        const scholarshipResponse = generateScholarshipResponse()
        setMessages((prev) => [...prev, scholarshipResponse])
      } else if (detectScheduleQuery(userInput)) {
        const scheduleResponse = generateScheduleResponse()
        setMessages((prev) => [...prev, scheduleResponse])
      } else if (specificService) {
        const serviceResponse = generateSpecificServiceResponse(specificService)
        setMessages((prev) => [...prev, serviceResponse])
      } else if (detectServicesQuery(userInput)) {
        const servicesResponse = generateServicesResponse()
        setMessages((prev) => [...prev, servicesResponse])
      } else {
        const assistantResponse: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "Gracias por tu consulta. Te ayudo con esa información. ¿Podrías ser más específico sobre qué aspecto necesitas conocer?",
          sender: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantResponse])
      }
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    setInputValue(`Necesito información sobre ${action.toLowerCase()}`)
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleScholarshipSelection = (scholarshipType: string) => {
    const requirementsResponse = generateScholarshipRequirements(scholarshipType)
    setMessages((prev) => [...prev, requirementsResponse])
  }

  const ScholarshipOptions = () => (
    <div className="space-y-3 mt-3">
      <Button
        variant="outline"
        className="w-full justify-start text-left h-auto p-3 shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10 transition-shadow bg-transparent"
        onClick={() => handleScholarshipSelection("monetaria")}
      >
        <div>
          <div className="font-medium">Beca Monetaria</div>
          <div className="text-sm text-muted-foreground">Apoyo económico directo</div>
        </div>
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start text-left h-auto p-3 shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10 transition-shadow bg-transparent"
        onClick={() => handleScholarshipSelection("vivienda")}
      >
        <div>
          <div className="font-medium">Beca Vivienda</div>
          <div className="text-sm text-muted-foreground">Apoyo para alojamiento</div>
        </div>
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start text-left h-auto p-3 shadow-sm dark:shadow-white/5 hover:shadow-md dark:hover:shadow-white/10 transition-shadow bg-transparent"
        onClick={() => handleScholarshipSelection("transporte")}
      >
        <div>
          <div className="font-medium">Beca Transporte</div>
          <div className="text-sm text-muted-foreground">Apoyo para movilización</div>
        </div>
      </Button>
    </div>
  )

  const ScholarshipRequirements = () => (
    <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50">
      <ul className="space-y-2 text-sm">
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
          <span>Carta dirigida al Copresidente Daniel Ortega y la Copresidenta Rosario Murillo</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
          <span>Notas del semestre pasado</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
          <span>Notas de 5to año de secundaria</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
          <span>Hoja de matrícula</span>
        </li>
      </ul>
    </div>
  )

  const ServicesOptions = () => (
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
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.description}</p>
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
                      className={message.sender === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary"}
                    >
                      {message.sender === "assistant" ? <GraduationCap className="w-4 h-4" /> : "U"}
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
                      <div className="whitespace-pre-line">{renderMessageContent(message.content)}</div>
                      {message.type === "scholarship-options" && <ScholarshipOptions />}
                      {message.type === "scholarship-requirements" && message.scholarshipType === "monetaria" && (
                        <ScholarshipRequirements />
                      )}
                      {message.type === "services-options" && <ServicesOptions />}
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
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
