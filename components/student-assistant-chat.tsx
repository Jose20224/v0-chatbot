"use client"

import { useEffect,useState } from "react"
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
  type?: "text" | "scholarship-options" | "scholarship-requirements" | "services-options" | "scholarship-status"     // <- NUEVO
  | "scholarship-detail" | "ask-carnet" 
  scholarshipType?: string
  serviceType?: string
  options?: string[]              // <- lista de tipos (por ej. ["Beca monetaria", ...])
  requirements?: string[]         // <- requisitos cuando se consulta uno específico


  carnet?: string
  nombre?: string
  periodo?: string | null
  estado?: string | null
  activo?: boolean
  beca?: string | null
  porcentaje?: number | null
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

   
    setTimeout(async () => {
  try {
    // 1) Enviar la consulta al backend para que la neurona interprete
    const nlpRes = await fetch("http://127.0.0.1:8000/api/nlp/intent/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userInput })
    });
    const nlpData = await nlpRes.json();

    // 2) Enrutamos según la intención devuelta
    const intent = nlpData.intent;
    const confidence = nlpData.confidence ?? 0;

    // Si el backend respondió con un mensaje pidiendo carnet, mostramos la tarjeta
if (typeof nlpData?.answer?.mensaje === "string" &&
    /carnet/i.test(nlpData.answer.mensaje)) {
  const ask: Message = {
    id: (Date.now()+1).toString(),
    content: nlpData.answer.mensaje,
    sender: "assistant",
    timestamp: new Date(),
    type: "ask-carnet",
  }
  setMessages(prev => [...prev, ask])
  return
}

if (intent === "aplicar_beca") {
  if (nlpData.answer?.becas?.length) {
    // ya lo cubre tu rama de requisitos_becas (puedes reutilizar ese bloque)
  } else if (nlpData.answer?.tipos_becas?.length) {
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      content: nlpData.answer.mensaje ?? "Elige una beca para ver cómo aplicar:",
      sender: "assistant",
      timestamp: new Date(),
      type: "text",
    }]);
    setMessages(prev => [...prev, {
      id: (Date.now() + 2).toString(),
      content: "Becas disponibles:",
      sender: "assistant",
      timestamp: new Date(),
      type: "scholarship-options",
      options: nlpData.answer.tipos_becas,
    }]);
    return;
  }
}


    // A) Tipos de becas -> mostramos botones dinámicos
    if (intent === "tipos_becas" && nlpData.answer?.tipos_becas?.length) {
      const tipos: string[] = nlpData.answer.tipos_becas;
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Aquí tienes las becas disponibles:",
        sender: "assistant",
        timestamp: new Date(),
        type: "scholarship-options",
        options: tipos, // <- se los pasamos al componente
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // B) Requisitos de beca -> si backend devolvió una específica, renderizamos requisitos
    if (intent === "requisitos_becas") {
      // Caso específico (cuando el query menciona una beca y el backend la identificó)
      if (nlpData.answer?.becas?.length) {
        // Tomamos la primera (o podrías listar varias)
        const beca = nlpData.answer.becas[0];
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: `Requisitos para ${beca.tipo}:`,
          sender: "assistant",
          timestamp: new Date(),
          type: "scholarship-requirements",
          scholarshipType: beca.tipo,
          requirements: beca.requisitos,
        };
        setMessages(prev => [...prev, response]);
        return;
      }

      // Caso genérico: backend devolvió mapa de todas -> mostramos opciones y al click consultamos requisitos
      if (nlpData.answer?.requisitos_por_beca) {
        const tipos = Object.keys(nlpData.answer.requisitos_por_beca);
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: "Selecciona una beca para ver sus requisitos:",
          sender: "assistant",
          timestamp: new Date(),
          type: "scholarship-options",
          options: tipos,
        };
        setMessages(prev => [...prev, response]);
        return;
      }
    }

    // C) Intención poco confiable o desconocida
    if (!intent || confidence < 0.55) {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "No estoy seguro. ¿Te interesan los tipos de beca o los requisitos de una beca específica?",
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      };
      setMessages(prev => [...prev, assistantResponse]);
      return;
    }



   

// C1) ¿Tiene beca? -> estado_beca
if (intent === "estado_beca" && nlpData.answer?.estado_beca) {
  const a = nlpData.answer.estado_beca as {
    tiene_beca: boolean; carnet?: string; nombre?: string; periodo?: string | null; estado?: string | null; activo?: boolean
  };
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
  };
  setMessages(prev => [...prev, msg]);
  return;
}

// C2) ¿Cuál beca tengo? -> detalle_beca
if (intent === "detalle_beca" && nlpData.answer?.detalle_beca) {
  const d = nlpData.answer.detalle_beca as {
    tiene_beca: boolean; carnet?: string; nombre?: string; beca?: string | null; porcentaje?: number | null
    periodo?: string | null; estado?: string | null; activo?: boolean
  };
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
  };
  setMessages(prev => [...prev, msg]);
  return;
}

// justo antes del fallback
if (intent === "donde_recibo_beca" && nlpData.answer?.mensaje) {
  const txt = nlpData.answer.mensaje; // "La beca se recibe en Caja o puede ser depositada..."
  const msg: Message = {
    id: (Date.now() + 1).toString(),
    content: txt,
    sender: "assistant",
    timestamp: new Date(),
    type: "text",
  };
  setMessages(prev => [...prev, msg]);
  return;
}

// para 'aplicar_beca' tu UI ya cubre ambos casos:
// - si viene answer.becas -> scholarship-requirements (ya lo tienes en la rama de requisitos_becas)
// - si viene answer.tipos_becas -> scholarship-options (ya lo haces en tipos_becas)


 // D) Fallback genérico
    const fallback: Message = {
      id: (Date.now() + 1).toString(),
      content: "Gracias por tu consulta. ¿Podrías precisar si deseas tipos de becas o requisitos?",
      sender: "assistant",
      timestamp: new Date(),
      type: "text",
    };
    setMessages(prev => [...prev, fallback]);

  } catch (error) {
    console.error("Error al conectar con la API:", error);
    const errorMessage: Message = {
      id: (Date.now() + 3).toString(),
      content: "❌ Ocurrió un error al conectar con la API del servidor Django.",
      sender: "assistant",
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, errorMessage]);
  }
}, 600);
  }


const AskCarnetCard = ({
  onSubmit,
}: {
  onSubmit: (carnet: string, mode: "estado" | "detalle") => void
}) => {
  const [carnet, setCarnet] = useState("")

  return (
    <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
      <div className="mb-2">Necesito tu carnet (formato <code>2021-0001I</code>)</div>
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
    // Construimos una pregunta para la neurona
    const q = `¿Cuáles son los requisitos de la ${scholarshipType}?`;
    const res = await fetch("http://127.0.0.1:8000/api/nlp/intent/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });
    const data = await res.json();

    if (data.intent === "requisitos_becas" && data.answer?.becas?.length) {
      const beca = data.answer.becas[0];
      const msg: Message = {
        id: (Date.now() + 1).toString(),
        content: `Requisitos para ${beca.tipo}:`,
        sender: "assistant",
        timestamp: new Date(),
        type: "scholarship-requirements",
        scholarshipType: beca.tipo,
        requirements: beca.requisitos,
      };
      setMessages(prev => [...prev, msg]);
      return;
    }

    // fallback cuando no vino específica
    const msg: Message = {
      id: (Date.now() + 1).toString(),
      content: `No pude encontrar requisitos específicos para "${scholarshipType}". ¿Puedes reformular?`,
      sender: "assistant",
      timestamp: new Date(),
      type: "text",
    };
    

    setMessages(prev => [...prev, msg]);
  } catch (e) {
    console.error(e);
    const msg: Message = {
      id: (Date.now() + 1).toString(),
      content: "❌ Error al obtener los requisitos.",
      sender: "assistant",
      timestamp: new Date(),
      type: "text",
    };
    setMessages(prev => [...prev, msg]);
  }

};


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
);

const submitCarnetFollowup = async (carnet: string, mode: "estado" | "detalle") => {
  const pregunta =
    mode === "estado" ? `¿Tengo beca? ${carnet}` : `¿Cuál beca tengo? ${carnet}`;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/nlp/intent/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: pregunta }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${errText}`);
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      throw new Error("La API no devolvió JSON.");
    }

    const nlpData = await res.json();
    const intent: string | undefined = nlpData.intent;
    const confidence: number = nlpData.confidence ?? 0;

    // estado_beca
    if (intent === "estado_beca" && nlpData.answer?.estado_beca) {
      const a = nlpData.answer.estado_beca;
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
      };
      setMessages((prev) => [...prev, msg]);
      return;
    }

    // detalle_beca
    if (intent === "detalle_beca" && nlpData.answer?.detalle_beca) {
      const d = nlpData.answer.detalle_beca;
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
      };
      setMessages((prev) => [...prev, msg]);
      return;
    }

    // Confianza baja o sin datos esperados
    if (!intent || confidence < 0.55) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content:
            "No pude resolver la consulta con ese carnet. Verifica el formato (ej: 2021-0001I).",
          sender: "assistant",
          timestamp: new Date(),
          type: "text",
        },
      ]);
      return;
    }

    // Fallback
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        content:
          "No pude resolver la consulta con ese carnet. Verifica el formato (ej: 2021-0001I).",
        sender: "assistant",
        timestamp: new Date(),
        type: "text",
      },
    ]);
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
    ]);
  }
};



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

const ScholarshipStatusCard = ({
  nombre, carnet, periodo, estado, activo
}: { nombre?: string; carnet?: string; periodo?: string | null; estado?: string | null; activo?: boolean }) => (
  <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
    <div className="font-medium">{nombre} ({carnet})</div>
    <div className="mt-1">Estado: <span className="font-medium">{estado ?? "—"}</span> {activo ? "✅" : "⛔"}</div>
    {periodo && <div>Periodo: <span className="font-medium">{periodo}</span></div>}
  </div>
)

const ScholarshipDetailCard = ({
  nombre, carnet, beca, porcentaje, periodo, estado, activo
}: {
  nombre?: string; carnet?: string; beca?: string | null; porcentaje?: number | null
  periodo?: string | null; estado?: string | null; activo?: boolean
}) => (
  <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
    <div className="font-medium">{nombre} ({carnet})</div>
    <div className="mt-1">Beca: <span className="font-medium">{beca ?? "—"}</span></div>
    {porcentaje != null && <div>Cobertura: <span className="font-medium">{porcentaje}%</span></div>}
    {periodo && <div>Periodo: <span className="font-medium">{periodo}</span></div>}
    <div>Estado: <span className="font-medium">{estado ?? "—"}</span> {activo ? "✅" : "⛔"}</div>
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
                      {message.type === "scholarship-options" && <ScholarshipOptions options={message.options ?? []} />}

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
