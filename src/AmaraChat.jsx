import { useEffect, useMemo, useRef, useState } from 'react'

const WHATSAPP_NUMBER = '525510308232'

const copy = {
  es: {
    title: 'Amara',
    role: 'Asistente virtual de AG117',
    open: 'Habla con Amara',
    close: 'Cerrar asistente',
    online: 'En línea',
    typing: 'Amara está escribiendo',
    placeholder: 'Escribe tu pregunta...',
    send: 'Enviar',
    greeting: 'Hola, soy Amara. ¿Te ayudo a conocer AG117?',
    welcome: '¡Hola! Soy Amara, tu anfitriona virtual de AG117. Estoy aquí para acompañarte y resolver tus primeras dudas con calma. Podemos comenzar por el proyecto, las residencias, precios o la entrega. ¿Qué te gustaría descubrir?',
    fallback: 'Todavía no cuento con información confirmada sobre eso. Para darte una respuesta precisa, puedo comunicarte con Ivonne Hernández Monroy, asesora inmobiliaria de AG117.',
    privacy: 'Amara brinda orientación general con información publicada. No solicita ni muestra documentos confidenciales.',
    advisor: 'Hablar con Ivonne',
    topics: 'Temas',
    hideTopics: 'Ocultar temas',
    quick: ['¿Qué es AG117?', 'Precios disponibles', 'Fecha de entrega', 'Documentos y permisos'],
  },
  en: {
    title: 'Amara',
    role: 'AG117 virtual assistant',
    open: 'Talk to Amara',
    close: 'Close assistant',
    online: 'Online',
    typing: 'Amara is typing',
    placeholder: 'Type your question...',
    send: 'Send',
    greeting: 'Hi, I am Amara. May I help you discover AG117?',
    welcome: 'Hello! I am Amara, your virtual host at AG117. I am here to guide you and answer your first questions at your own pace. We can begin with the project, residences, prices or delivery. What would you like to discover?',
    fallback: 'I do not have confirmed information about that yet. To give you an accurate answer, I can connect you with Ivonne Hernández Monroy, AG117 real estate advisor.',
    privacy: 'Amara provides general guidance using published information. It does not request or display confidential documents.',
    advisor: 'Talk to Ivonne',
    topics: 'Topics',
    hideTopics: 'Hide topics',
    quick: ['What is AG117?', 'Available prices', 'Delivery date', 'Documents and permits'],
  },
}

const normalize = (value) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const hasAny = (text, terms) => terms.some((term) => text.includes(term))

function getReply(message, language) {
  const text = normalize(message)
  const isEnglish = language === 'en'

  if (hasAny(text, ['hola', 'buenas', 'hey', 'hello', 'hi', 'good morning', 'good afternoon'])) {
    return isEnglish
      ? 'Hello! It is lovely to meet you. I am here to help you discover AG117. You can ask me about residences, current prices, delivery or contact with Ivonne.'
      : '¡Hola! Qué gusto recibirte. Estoy aquí para ayudarte a conocer AG117. Puedes preguntarme por residencias, precios actuales, entrega o atención con Ivonne.'
  }

  if (hasAny(text, ['que es', 'proyecto', 'ag 117', 'ag117', 'what is', 'development'])) {
    return isEnglish
      ? 'AG117 is a residential development in Colonia Juárez, Mexico City, conceived around contemporary architecture, interior gardens, natural light and warm materials. It includes several residence layouts, balconies, terraces and roof garden options.'
      : 'AG117 es un desarrollo residencial en la Colonia Juárez de la Ciudad de México, concebido alrededor de arquitectura contemporánea, jardines interiores, luz natural y materiales cálidos. Cuenta con distintas tipologías de residencia, balcones, terrazas y opciones con roof garden.'
  }

  if (hasAny(text, ['precio', 'cuanto', 'cuesta', 'costo', 'price', 'cost', 'presio', 'prezio'])) {
    return isEnglish
      ? 'The published availability currently ranges approximately from MXN $5,100,000 to $9,800,000. Prices and availability are referenced as of June 2, 2026 and may change without notice. Ivonne can confirm the unit you are interested in.'
      : 'La disponibilidad publicada actualmente va aproximadamente de $5,100,000 a $9,800,000 MXN. Los precios y la disponibilidad tienen fecha de referencia del 2 de junio de 2026 y pueden cambiar sin previo aviso. Ivonne puede confirmar la residencia que te interese.'
  }

  if (hasAny(text, ['entrega', 'termina', 'cuando', 'fecha', 'delivery', 'ready', 'finish', '2028'])) {
    return isEnglish
      ? 'The project’s estimated delivery is scheduled for late 2028. For contractual milestones or a more precise schedule, Ivonne can review the current information with you.'
      : 'La entrega estimada del proyecto está prevista para finales de 2028. Para conocer hitos contractuales o un calendario más preciso, Ivonne puede revisar contigo la información vigente.'
  }

  if (hasAny(text, ['permiso', 'documento', 'legal', 'licencia', 'confidencial', 'escritura', 'permit', 'document', 'confidential', 'legal'])) {
    return isEnglish
      ? 'The development has confidential documentation that may be reviewed through the appropriate process together with our trusted advisor, Ivonne Hernández Monroy. Amara does not display or request sensitive documents in this chat.'
      : 'El desarrollo cuenta con documentación de carácter confidencial que puede revisarse mediante el proceso correspondiente junto con nuestra asesora predilecta, Ivonne Hernández Monroy. Amara no muestra ni solicita documentos sensibles dentro de este chat.'
  }

  if (hasAny(text, ['tipologia', 'departamento', 'recamara', 'habitacion', 'residencia', 'metros', 'layout', 'apartment', 'bedroom', 'residence', 'area'])) {
    return isEnglish
      ? 'AG117 offers A, B, C, C1 and CE layouts, with options from one to three bedrooms. Published units range from approximately 63 to 183 m², including some lock-off, pentgarden and roof garden configurations.'
      : 'AG117 ofrece tipologías A, B, C, C1 y CE, con opciones de una a tres recámaras. Las unidades publicadas van aproximadamente de 63 a 183 m² e incluyen algunas configuraciones lock-off, pentgarden y roof garden.'
  }

  if (hasAny(text, ['ubicacion', 'donde', 'direccion', 'colonia', 'location', 'where', 'address'])) {
    return isEnglish
      ? 'AG117 is located on Abraham González Street in Colonia Juárez, Mexico City. Ivonne can share the exact visit details and help schedule an appointment.'
      : 'AG117 se encuentra sobre la calle Abraham González, en la Colonia Juárez de la Ciudad de México. Ivonne puede compartirte los detalles exactos para una visita y ayudarte a programar una cita.'
  }

  if (hasAny(text, ['amenidad', 'servicio', 'roof', 'jardin', 'elevador', 'lobby', 'cowork', 'bici', 'amenity', 'garden', 'bicycle'])) {
    return isEnglish
      ? 'Published project materials mention interior gardens, roof gardens, a bicycle area, lobby, coworking, video surveillance, a gym, multipurpose room and elevator service. Availability and final specifications should be confirmed with Ivonne.'
      : 'Los materiales publicados del proyecto mencionan jardines interiores, roof gardens, área para bicicletas, lobby, coworking, videovigilancia, gimnasio, salón de usos múltiples y elevador. La disponibilidad y especificaciones finales deben confirmarse con Ivonne.'
  }

  if (hasAny(text, ['ivonne', 'asesor', 'whatsapp', 'telefono', 'contacto', 'cita', 'visita', 'advisor', 'contact', 'appointment', 'visit'])) {
    return isEnglish
      ? 'Ivonne Hernández Monroy is AG117’s real estate advisor. You can reach her on WhatsApp at +52 55 1030 8232 for availability, purchase plans, documentation or a personal appointment.'
      : 'Ivonne Hernández Monroy es asesora inmobiliaria de AG117. Puedes escribirle por WhatsApp al 55 1030 8232 para revisar disponibilidad, planes de compra, documentación o programar una atención personal.'
  }

  if (hasAny(text, ['gracias', 'adios', 'bye', 'thank'])) {
    return isEnglish
      ? 'It was a pleasure helping you. I will be here whenever you want to continue exploring AG117.'
      : 'Fue un gusto ayudarte. Aquí estaré cuando quieras seguir descubriendo AG117.'
  }

  return copy[language].fallback
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2.2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 11 17-8-7 18-2.5-7.5Z" />
      <path d="m10.5 13.5 4-4" />
    </svg>
  )
}

const messageTime = () => new Intl.DateTimeFormat([], {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date())

export default function AmaraChat({ language }) {
  const ui = copy[language]
  const avatar = `${import.meta.env.BASE_URL}ag117/amara-profile.svg`
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const [showTopics, setShowTopics] = useState(true)
  const [messages, setMessages] = useState([
    { id: 0, role: 'amara', text: ui.welcome, time: messageTime() },
  ])
  const listRef = useRef(null)
  const replyTimer = useRef(null)
  const greetingTimer = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, typing])

  useEffect(() => {
    greetingTimer.current = window.setTimeout(() => setShowGreeting(true), 1200)
    return () => {
      window.clearTimeout(greetingTimer.current)
      window.clearTimeout(replyTimer.current)
    }
  }, [])

  const lastQuestion = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'user')?.text || '',
    [messages],
  )

  const sendMessage = (value) => {
    const question = value.trim()
    if (!question || typing) return
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text: question, time: messageTime() },
    ])
    setInput('')
    setShowTopics(false)
    setTyping(true)
    replyTimer.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'amara',
          text: getReply(question, language),
          time: messageTime(),
        },
      ])
      setTyping(false)
    }, 700)
  }

  const openChat = () => {
    setOpen(true)
    setShowGreeting(false)
  }

  const whatsappText = language === 'en'
    ? `Hello Ivonne, I was speaking with Amara about AG117. I would like more information${lastQuestion ? ` about: ${lastQuestion}` : '.'}`
    : `Hola Ivonne, estaba conversando con Amara sobre AG117. Me gustaría recibir más información${lastQuestion ? ` sobre: ${lastQuestion}` : '.'}`

  return (
    <aside className={open ? 'amara-chat is-open' : 'amara-chat'} aria-label={ui.role}>
      {!open && showGreeting && (
        <button className="amara-greeting" type="button" onClick={openChat}>
          <span className="amara-greeting-close" onClick={(event) => {
            event.stopPropagation()
            setShowGreeting(false)
          }}>×</span>
          <span className="amara-greeting-avatar">
            <img src={avatar} alt="" />
            <i />
          </span>
          <span>
            <strong>Amara</strong>
            <small>{ui.greeting}</small>
          </span>
        </button>
      )}

      {open && (
        <div className="amara-window">
          <header className="amara-header">
            <div className="amara-avatar" aria-hidden="true">
              <img src={avatar} alt="" />
              <i />
            </div>
            <div>
              <strong>{ui.title}</strong>
              <span>{typing ? ui.typing : `${ui.online} · ${ui.role}`}</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={ui.close}>×</button>
          </header>

          <div className="amara-messages" ref={listRef} aria-live="polite">
            <div className="amara-day">{language === 'en' ? 'Today' : 'Hoy'}</div>
            {messages.map((message) => (
              <div key={message.id} className={`amara-message ${message.role}`}>
                <span>{message.text}</span>
                <small>{message.time}{message.role === 'user' ? ' ✓✓' : ''}</small>
              </div>
            ))}
            {typing && (
              <div className="amara-typing" aria-label={ui.typing}>
                <i /><i /><i />
              </div>
            )}
            {showTopics && (
              <div className="amara-quick">
                <span>{language === 'en' ? 'Choose a question' : 'Elige una pregunta'}</span>
                {ui.quick.map((question) => (
                  <button key={question} type="button" onClick={() => sendMessage(question)}>
                    {question}<b>›</b>
                  </button>
                ))}
              </div>
            )}
            <button
              className="amara-topics-toggle"
              type="button"
              onClick={() => setShowTopics((current) => !current)}
              aria-expanded={showTopics}
            >
              <span>•••</span>
              {showTopics ? ui.hideTopics : ui.topics}
            </button>
          </div>

          <a
            className="amara-advisor"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="amara-advisor-icon">IV</span>
            <span><small>{language === 'en' ? 'Personal assistance' : 'Atención personal'}</small>{ui.advisor}</span>
            <b>↗</b>
          </a>
          <p className="amara-privacy">{ui.privacy}</p>

          <form
            className="amara-form"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage(input)
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={ui.placeholder}
              aria-label={ui.placeholder}
            />
            <button type="submit" aria-label={ui.send} disabled={!input.trim() || typing}>
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        className="amara-launcher"
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-label={open ? ui.close : ui.open}
        aria-expanded={open}
      >
        <span className="amara-launcher-avatar">
          {open ? <ChatIcon /> : <img src={avatar} alt="" />}
        </span>
        <strong>{open ? ui.close : ui.open}</strong>
        {!open && <i className="amara-notification">1</i>}
      </button>
    </aside>
  )
}
