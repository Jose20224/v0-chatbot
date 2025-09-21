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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Simulate assistant response
    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Gracias por tu consulta. Te ayudo con esa información. ¿Podrías ser más específico sobre qué aspecto necesitas conocer?",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantResponse])
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    setInputValue(`Necesito información sobre ${action.toLowerCase()}`)
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300`}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
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
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
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
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-border/50 hover:border-primary/20"
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
        <Card className="mb-6 border-border/50">
          <div className="p-6">
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className={message.sender === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary"}
                    >
                      {message.sender === "assistant" ? <GraduationCap className="w-4 h-4" /> : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[80%] ${message.sender === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-3 rounded-2xl text-sm leading-relaxed ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {message.content}
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
        <Card className="border-border/50">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu consulta sobre horarios, matrícula, requisitos o servicios..."
                  className="border-border/50 focus:border-primary/50 bg-background"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
              </div>
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()} className="px-4">
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
