import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import './App.css'
import { translateDocument } from './pageTranslations.js'
import AmaraChat from './AmaraChat.jsx'

const Project3D = lazy(() => import('./Project3D.jsx'))

const publicAsset = (path) => `${import.meta.env.BASE_URL}${path}`

const gallery = [
  {
    src: publicAsset('ag117/interior-02.jpg'),
    label: 'Interior',
    title: 'Espacios que respiran',
  },
  {
    src: publicAsset('ag117/patio-1.jpg'),
    label: 'Paisaje',
    title: 'Un jardín en el corazón',
  },
  {
    src: publicAsset('ag117/interior-08.jpg'),
    label: 'Residencias',
    title: 'Calma, luz y materia',
  },
  {
    src: publicAsset('ag117/interior-04.jpg'),
    label: 'Amenidades',
    title: 'Bienestar todos los días',
  },
]

const residences = [
  {
    id: 'A',
    image: publicAsset('ag117/plan-a.png'),
    eyebrow: 'Tipología A',
    title: 'Esencial y luminosa',
    copy: 'Una distribución inteligente que conecta las áreas sociales con la vegetación exterior.',
    features: ['Terraza privada', 'Cocina abierta', 'Flujo natural'],
  },
  {
    id: 'B',
    image: publicAsset('ag117/plan-b.png'),
    eyebrow: 'Tipología B',
    title: 'Más espacio para vivir',
    copy: 'Ambientes amplios, cálidos y flexibles para una vida cotidiana sin prisa.',
    features: ['Área social amplia', 'Vistas al jardín', 'Opción roof garden'],
  },
  {
    id: 'C',
    image: publicAsset('ag117/plan-c.png'),
    eyebrow: 'Tipología C',
    title: 'Versatilidad total',
    copy: 'Una residencia diseñada para evolucionar contigo y maximizar cada espacio.',
    features: ['Opción lock-off', 'Alta privacidad', 'Distribución flexible'],
  },
  {
    id: 'C1',
    image: publicAsset('ag117/plan-c1.png'),
    eyebrow: 'Tipología C1',
    title: 'El jardín es tuyo',
    copy: 'La experiencia más cercana al paisaje, con espacios que se abren al exterior.',
    features: ['Pentgarden', 'Acceso a patio', 'Vida interior-exterior'],
  },
]

const priceUnits = [
  { tower: 'A', level: 'PB', type: 'C1', unit: 'A-01', view: 'Jardín', area: 99.17, beds: 3, baths: 2.5, study: false, price: 6950000 },
  { tower: 'A', level: '1', type: 'B Lock off', unit: 'A-103', view: 'Calle', area: 113.73, beds: 2, baths: 2.5, study: true, price: 8800000 },
  { tower: 'A', level: '1', type: 'C', unit: 'A-105', view: 'Calle', area: 73.53, beds: 2, baths: 2, study: false, price: 5950000 },
  { tower: 'A', level: '2', type: 'B Lock off', unit: 'A-203', view: 'Calle', area: 113.73, beds: 2, baths: 2.5, study: true, price: 8800000 },
  { tower: 'A', level: '3 PH', type: 'B Roof Garden', unit: 'A-301', view: 'Calle', area: 172.54, beds: 2, baths: 2.5, study: true, price: 9800000 },
  { tower: 'A', level: '3 PH', type: 'C Roof Garden', unit: 'A-302', view: 'Jardín', area: 152.09, beds: 2, baths: 2.5, study: false, price: 8000000 },
  { tower: 'A', level: '3 PH', type: 'B Roof Garden', unit: 'A-303', view: 'Calle', area: 175.95, beds: 2, baths: 2.5, study: false, price: 9700000 },
  { tower: 'A', level: '3 PH', type: 'C Roof Garden', unit: 'A-304', view: 'Calle', area: 153.99, beds: 2, baths: 2.5, study: false, price: 8660000 },
  { tower: 'B', level: '2', type: 'A Lock off', unit: 'B-202', view: 'Jardín', area: 82.17, beds: 2, baths: 2, study: true, price: 5700000 },
  { tower: 'B', level: '3 PH', type: 'B Roof Garden', unit: 'B-301', view: 'Calle', area: 169.97, beds: 2, baths: 2.5, study: false, price: 9600000 },
  { tower: 'B', level: '3 PH', type: 'C Roof Garden', unit: 'B-302', view: 'Jardín', area: 153.18, beds: 2, baths: 2.5, study: false, price: 8030000 },
  { tower: 'B', level: '3 PH', type: 'C Roof Garden', unit: 'B-304', view: 'Calle', area: 154.72, beds: 2, baths: 2.5, study: false, price: 9000000 },
  { tower: 'C', level: 'PB', type: 'C1', unit: 'C-01', view: 'Jardín', area: 92.38, beds: 3, baths: 2.5, study: false, price: 6750000 },
  { tower: 'C', level: 'PB', type: 'C1', unit: 'C-02', view: 'Jardín', area: 91.48, beds: 3, baths: 2.5, study: false, price: 6700000 },
  { tower: 'C', level: 'PB', type: 'C1 Pentgarden', unit: 'C-03', view: 'Colindancia', area: 83.2, beds: 2, baths: 2, study: false, price: 6100000 },
  { tower: 'C', level: 'PB', type: 'C1 Pentgarden', unit: 'C-05', view: 'Colindancia', area: 82.62, beds: 2, baths: 2, study: false, price: 6000000 },
  { tower: 'C', level: '1', type: 'B Lock off', unit: 'C-103', view: 'Jardín', area: 103.35, beds: 2, baths: 2.5, study: true, price: 7600200 },
  { tower: 'C', level: '1', type: 'C', unit: 'C-105', view: 'Colindancia', area: 75.3, beds: 2, baths: 2, study: false, price: 5500000 },
  { tower: 'C', level: '2', type: 'B Lock off', unit: 'C-203', view: 'Jardín', area: 103.35, beds: 2, baths: 2.5, study: true, price: 7650000 },
  { tower: 'C', level: '2', type: 'C', unit: 'C-205', view: 'Colindancia', area: 75.3, beds: 2, baths: 2, study: false, price: 5500000 },
  { tower: 'C', level: '3 PH', type: 'B Roof Garden', unit: 'C-301', view: 'Jardín', area: 171.01, beds: 2, baths: 2.5, study: false, price: 9500000 },
  { tower: 'C', level: '3 PH', type: 'C Roof Garden', unit: 'C-302', view: 'Jardín', area: 153.37, beds: 2, baths: 2.5, study: false, price: 8100000 },
  { tower: 'C', level: '3 PH', type: 'B Roof Garden', unit: 'C-303', view: 'Jardín', area: 183, beds: 2, baths: 2.5, study: true, price: 9760000 },
  { tower: 'C', level: '3 PH', type: 'C Roof Garden', unit: 'C-304', view: 'Colindancia', area: 161.85, beds: 2, baths: 2.5, study: false, price: 8750000 },
  { tower: 'D', level: 'PB', type: 'C1', unit: 'D-01', view: 'Jardín', area: 102.83, beds: 3, baths: 2, study: false, price: 7250000 },
  { tower: 'D', level: 'PB', type: 'C1 Pentgarden', unit: 'D-05', view: 'Colindancia', area: 81.99, beds: 2, baths: 2, study: false, price: 5950000 },
  { tower: 'D', level: '1', type: 'C1', unit: 'D-102', view: 'Jardín', area: 96.91, beds: 3, baths: 2, study: false, price: 7150000 },
  { tower: 'D', level: '1', type: 'A', unit: 'D-104', view: 'Colindancia', area: 63.09, beds: 1, baths: 1, study: false, price: 5100000 },
  { tower: 'D', level: '2', type: 'C1', unit: 'D-202', view: 'Jardín', area: 96.91, beds: 3, baths: 2, study: false, price: 7150000 },
  { tower: 'D', level: '3 PH', type: 'A Roof Garden', unit: 'D-301', view: 'Jardín', area: 131.87, beds: 1, baths: 1, study: false, price: 6800000 },
  { tower: 'D', level: '3 PH', type: 'C Roof Garden', unit: 'D-304', view: 'Colindancia', area: 174.41, beds: 2, baths: 2.5, study: false, price: 9200000 },
  { tower: 'E', level: '1', type: 'CE', unit: 'E-101', view: 'Calle', area: 95.45, beds: 2, baths: 2.5, study: false, price: 7600000 },
  { tower: 'E', level: '1', type: 'CE', unit: 'E-102', view: 'Jardín', area: 85.97, beds: 2, baths: 2, study: false, price: 6350000 },
  { tower: 'E', level: '2', type: 'CE', unit: 'E-201', view: 'Calle', area: 95.45, beds: 2, baths: 2.5, study: false, price: 7500000 },
]

const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

function Arrow({ diagonal = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={diagonal ? 'M7 17 17 7M8 7h9v9' : 'M5 12h14m-5-5 5 5-5 5'} />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.2a8.5 8.5 0 1 1 15.6-4.7Z" />
      <path d="M8.3 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.5l.7 1.7c.1.3 0 .5-.2.7l-.6.7c-.2.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.3.3.2.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.8.9c.3.1.4.3.4.5 0 .3-.2 1.4-1 2-.7.6-1.6.8-2.7.4-1-.3-2.3-1-3.8-2.3-1.3-1.2-2.2-2.6-2.5-3.6-.3-1-.1-1.9.3-2.4Z" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5h3l1.2-2h7.6l1.2 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function App() {
  const [language, setLanguage] = useState(() => (
    localStorage.getItem('ag117-language') === 'en' ? 'en' : 'es'
  ))
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeResidence, setActiveResidence] = useState(0)
  const [activeGallery, setActiveGallery] = useState(0)
  const [priceTower, setPriceTower] = useState('Todas')
  const [sent, setSent] = useState(false)
  const heroCard = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.12 },
    )

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.title = language === 'en'
      ? 'AG117 | Architecture for a more natural life'
      : 'AG117 | Arquitectura para una vida más natural'
    localStorage.setItem('ag117-language', language)
    localStorage.setItem('ag117-ar-language', language)

    let frame = 0
    const translatePage = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => translateDocument(document.body, language))
    }

    translatePage()
    const observer = new MutationObserver(translatePage)
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [language])

  const tiltHero = (event) => {
    if (!heroCard.current || window.matchMedia('(pointer: coarse)').matches) return
    const bounds = heroCard.current.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    heroCard.current.style.setProperty('--rotate-y', `${x * 8}deg`)
    heroCard.current.style.setProperty('--rotate-x', `${y * -7}deg`)
    heroCard.current.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`)
    heroCard.current.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`)
  }

  const resetHero = () => {
    heroCard.current?.style.setProperty('--rotate-y', '0deg')
    heroCard.current?.style.setProperty('--rotate-x', '0deg')
  }

  const residence = residences[activeResidence]
  const visiblePrices = priceTower === 'Todas'
    ? priceUnits
    : priceUnits.filter((unit) => unit.tower === priceTower)

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="AG117, inicio">
          <span className="brand-mark">AG</span>
          <span className="brand-number">117</span>
        </a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}>
          <a href="#concepto" onClick={() => setMenuOpen(false)}>Concepto</a>
          <a href="#maqueta" onClick={() => setMenuOpen(false)}>Maqueta 3D</a>
          <a href="#realidad-aumentada" onClick={() => setMenuOpen(false)}>Realidad AR</a>
          <a href="#espacios" onClick={() => setMenuOpen(false)}>Espacios</a>
          <a href="#residencias" onClick={() => setMenuOpen(false)}>Residencias</a>
          <a href="#precios" onClick={() => setMenuOpen(false)}>Precios</a>
          <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
        </nav>
        <a className="header-cta" href="#contacto">
          Conocer el proyecto <Arrow />
        </a>
        <button
          className="site-language-toggle"
          type="button"
          aria-label="Cambiar idioma"
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
        >
          {language === 'es' ? 'EN' : 'ES'}
        </button>
        <button
          className="menu-button"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>
      </header>

      <section className="hero-section" id="inicio">
        <div className="hero-grain" />
        <div className="hero-copy">
          <p className="eyebrow light">Arquitectura tropical contemporánea</p>
          <h1>
            <span className="hero-line">Diseñado para</span>
            <span className="hero-line hero-line-focus">bajar el ritmo</span>
            <span className="hero-line hero-line-accent">y elevar tus sentidos.</span>
          </h1>
          <p className="hero-intro">
            Un refugio urbano donde arquitectura, vegetación y luz conviven
            en perfecto equilibrio.
          </p>
          <a className="circle-link" href="#concepto" aria-label="Descubrir AG117">
            <Arrow />
          </a>
        </div>

        <div
          className="hero-visual"
          ref={heroCard}
          onMouseMove={tiltHero}
          onMouseLeave={resetHero}
        >
          <div className="architecture-card">
            <img src={publicAsset('ag117/exterior.jpg')} alt="Fachada contemporánea de AG117" />
            <div className="card-shine" />
          </div>
          <div className="floating-tag tag-one">Residencias</div>
          <div className="floating-tag tag-two">Entrega estimada · 2028</div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
        </div>

        <div className="hero-index">
          <span>01</span>
          <span className="index-line" />
          <span>05</span>
        </div>
        <p className="hero-side-note">Desliza para explorar</p>
      </section>

      <section className="manifesto section-pad" id="concepto">
        <div className="manifesto-lead" data-reveal>
          <p className="eyebrow">El nuevo lujo es sentir</p>
          <h2>AG117 reinterpreta la vida contemporánea.</h2>
        </div>
        <div className="manifesto-copy" data-reveal>
          <div className="concept-points">
            <article>
              <span>01</span>
              <strong>Materiales honestos</strong>
              <p>Texturas cálidas y naturales que se sienten bien.</p>
            </article>
            <article>
              <span>02</span>
              <strong>Jardines interiores</strong>
              <p>Vegetación presente en cada recorrido y cada mirada.</p>
            </article>
            <article>
              <span>03</span>
              <strong>El exterior entra</strong>
              <p>Luz, aire y paisaje integrados a la vida diaria.</p>
            </article>
          </div>
          <a className="text-link" href="#espacios">
            Explorar la experiencia <Arrow diagonal />
          </a>
        </div>
        <div className="material-swatch swatch-green" aria-hidden="true" />
        <div className="material-swatch swatch-coral" aria-hidden="true" />
      </section>

      <section className="immersive-image" aria-label="Jardín interior de AG117">
        <img src={publicAsset('ag117/patio-2.jpg')} alt="Corredor ajardinado entre las residencias" />
        <div className="image-caption">
          <span>El corazón verde</span>
          <p>Un paisaje vivo que acompaña cada recorrido.</p>
        </div>
        <span className="image-number">02</span>
      </section>

      <Suspense fallback={<div className="model-loading">Preparando maqueta 3D...</div>}>
        <Project3D />
      </Suspense>

      <section className="ar-section section-pad" id="realidad-aumentada">
        <div className="ar-copy" data-reveal>
          <p className="eyebrow light">AG117 cobra vida</p>
          <h2>Apunta. Descubre. Recorre.</h2>
          <p>
            Usa la cámara de tu celular o computadora. La maqueta aparecerá
            únicamente al reconocer la propaganda con el sello de Ivonne.
          </p>
          <div className="ar-steps">
            <span><strong>01</strong> Abre la cámara</span>
            <span><strong>02</strong> Apunta al sello de Ivonne</span>
            <span><strong>03</strong> Explora AG117</span>
          </div>
          <a
            className="ar-launch"
            href={publicAsset('ar/')}
          >
            <span className="ar-launch-icon"><CameraIcon /></span>
            <span>
              <small>Experiencia inmersiva</small>
              <strong>Activar realidad aumentada</strong>
            </span>
            <Arrow diagonal />
          </a>
          <p className="ar-compatibility">
            Requiere permiso de cámara y conexión HTTPS. Para mejores resultados,
            evita reflejos y mantén visible el sello completo.
          </p>
        </div>
        <div className="ar-target-preview" data-reveal>
          <img
            src={publicAsset('ar/ag117-sello.jpeg')}
            alt="Sello de Ivonne y AG117 utilizado para activar la realidad aumentada"
          />
          <div className="ar-scan-corners" aria-hidden="true" />
          <span className="ar-preview-label">Sello de reconocimiento</span>
          <span className="ar-live-badge"><i /> Cámara AR</span>
        </div>
      </section>

      <section className="spaces section-pad" id="espacios">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Espacios con intención</p>
          <h2>Una forma más natural de habitar.</h2>
          <p className="section-summary">
            Interiores serenos, texturas cálidas y vegetación en cada mirada.
          </p>
        </div>

        <div className="gallery-stage" data-reveal>
          <div className="gallery-image">
            {gallery.map((item, index) => (
              <img
                key={item.src}
                className={index === activeGallery ? 'is-active' : ''}
                src={item.src}
                alt={item.title}
              />
            ))}
            <div className="gallery-title">
              <span>{gallery[activeGallery].label}</span>
              <strong>{gallery[activeGallery].title}</strong>
            </div>
          </div>
          <div className="gallery-list">
            {gallery.map((item, index) => (
              <button
                key={item.title}
                className={index === activeGallery ? 'is-active' : ''}
                type="button"
                onClick={() => setActiveGallery(index)}
              >
                <span>0{index + 1}</span>
                <strong>{item.title}</strong>
                <Arrow />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="residences section-pad" id="residencias">
        <div className="residences-head" data-reveal>
          <div>
            <p className="eyebrow light">Encuentra tu espacio</p>
            <h2>Residencias que se adaptan a ti.</h2>
          </div>
          <p>
            Cuatro tipologías, múltiples formas de vivir. Elige la que se
            parezca a tu siguiente capítulo.
          </p>
        </div>

        <div className="residence-selector" data-reveal>
          <div className="plan-stage">
            <span className="plan-grid" />
            <img src={residence.image} alt={`Plano de ${residence.eyebrow}`} />
            <span className="plan-scale">Planta arquitectónica</span>
          </div>
          <div className="residence-details">
            <div className="type-tabs" role="tablist" aria-label="Tipologías">
              {residences.map((item, index) => (
                <button
                  key={item.id}
                  className={index === activeResidence ? 'is-active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={index === activeResidence}
                  onClick={() => setActiveResidence(index)}
                >
                  {item.id}
                </button>
              ))}
            </div>
            <p className="eyebrow light">{residence.eyebrow}</p>
            <h3>{residence.title}</h3>
            <p className="residence-copy">{residence.copy}</p>
            <ul>
              {residence.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <a className="button-lime" href="#contacto">
              Recibir disponibilidad <Arrow />
            </a>
          </div>
        </div>
      </section>

      <section className="prices section-pad" id="precios">
        <div className="prices-head" data-reveal>
          <div>
            <p className="eyebrow">Disponibilidad actual</p>
            <h2>Encuentra tu lugar en AG117.</h2>
          </div>
          <div className="delivery-card">
            <span>Entrega estimada</span>
            <strong>2028</strong>
            <p>Planea hoy el espacio que vas a disfrutar mañana.</p>
          </div>
        </div>

        <div className="price-toolbar" data-reveal>
          <p><strong>{visiblePrices.length}</strong> residencias disponibles</p>
          <div className="tower-filters" aria-label="Filtrar precios por torre">
            {['Todas', 'A', 'B', 'C', 'D', 'E'].map((tower) => (
              <button
                key={tower}
                className={priceTower === tower ? 'is-active' : ''}
                type="button"
                onClick={() => setPriceTower(tower)}
              >
                {tower === 'Todas' ? tower : `Torre ${tower}`}
              </button>
            ))}
          </div>
        </div>

        <div className="price-table-wrap" data-reveal>
          <table className="price-table">
            <thead>
              <tr>
                <th>Residencia</th>
                <th>Tipología</th>
                <th>Vista</th>
                <th>Superficie</th>
                <th>Distribución</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {visiblePrices.map((unit) => (
                <tr key={unit.unit}>
                  <td data-label="Residencia">
                    <strong>{unit.unit}</strong>
                    <span>Torre {unit.tower} · Nivel {unit.level}</span>
                  </td>
                  <td data-label="Tipología">{unit.type}</td>
                  <td data-label="Vista">{unit.view}</td>
                  <td data-label="Superficie">{unit.area.toFixed(2)} m²</td>
                  <td data-label="Distribución">
                    {unit.beds} rec. · {unit.baths} baños{unit.study ? ' · estudio' : ''}
                  </td>
                  <td data-label="Precio"><strong>{currency.format(unit.price)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="price-note">
          Precios y disponibilidad con fecha de referencia al 2 de junio de 2026.
          Sujetos a cambio sin previo aviso. Confirma la información con tu asesora.
        </p>
      </section>

      <section className="closing-scene">
        <img src={publicAsset('ag117/living-dining.jpg')} alt="Sala y comedor con vista a la vegetación" />
        <div className="closing-copy" data-reveal>
          <p className="eyebrow light">Tu vida, en equilibrio</p>
          <h2>Adentro se siente diferente.</h2>
        </div>
      </section>

      <section className="advisor section-pad" id="contacto">
        <div className="advisor-photo" data-reveal>
          <img
            src={publicAsset('ag117/ivonne-hernandez.jpg')}
            alt="Ivonne Hernández Monroy, asesora inmobiliaria de AG117"
          />
          <span className="advisor-photo-label">Tu asesora AG117</span>
        </div>
        <div className="advisor-copy" data-reveal>
          <p className="eyebrow light">Atención personal</p>
          <h2>Conoce AG117 de la mano de Ivonne.</h2>
          <p className="advisor-name">Ivonne Hernández Monroy</p>
          <p className="advisor-role">Asesora inmobiliaria AG117</p>
          <p className="advisor-description">
            Resuelve tus dudas sobre disponibilidad, tipologías, planes de compra
            y encuentra la residencia que mejor acompaña tu proyecto de vida.
          </p>
          <a
            className="whatsapp-button"
            href="https://wa.me/525510308232?text=Hola%20Ivonne%2C%20me%20interesa%20recibir%20informaci%C3%B3n%20sobre%20AG117."
            target="_blank"
            rel="noreferrer"
          >
            <span className="whatsapp-icon"><WhatsAppIcon /></span>
            <span>
              <small>Escríbele por WhatsApp</small>
              <strong>55 1030 8232</strong>
            </span>
            <Arrow diagonal />
          </a>
          <p className="delivery-reminder">
            Entrega estimada del proyecto: <strong>2028</strong>
          </p>
        </div>
      </section>

      <section className="contact section-pad" id="registro">
        <div className="contact-intro" data-reveal>
          <p className="eyebrow">Comienza tu historia</p>
          <h2>Recibe todos los detalles.</h2>
          <p>
            Déjanos tus datos para conversar sobre tipologías, disponibilidad,
            precios y la entrega estimada para 2028.
          </p>
        </div>
        <form
          className="contact-form"
          data-reveal
          onSubmit={(event) => {
            event.preventDefault()
            setSent(true)
          }}
        >
          {sent ? (
            <div className="form-success">
              <span>Gracias</span>
              <h3>Tu mensaje está listo.</h3>
              <p>Un asesor podrá continuar la conversación contigo.</p>
            </div>
          ) : (
            <>
              <label>
                <span>Nombre completo</span>
                <input type="text" name="name" placeholder="Escribe tu nombre" required />
              </label>
              <label>
                <span>Correo electrónico</span>
                <input type="email" name="email" placeholder="nombre@correo.com" required />
              </label>
              <label>
                <span>Teléfono</span>
                <input type="tel" name="phone" placeholder="+52 000 000 0000" />
              </label>
              <button className="submit-button" type="submit">
                Solicitar información <Arrow />
              </button>
            </>
          )}
        </form>
      </section>

      <footer>
        <a className="brand footer-brand" href="#inicio">
          <span className="brand-mark">AG</span>
          <span className="brand-number">117</span>
        </a>
        <p>Arquitectura para una vida más natural.</p>
        <div className="footer-links">
          <a href="#concepto">Concepto</a>
          <a href="#realidad-aumentada">Realidad AR</a>
          <a href="#residencias">Residencias</a>
          <a href="#precios">Precios</a>
          <a href="#contacto">Contacto</a>
        </div>
        <span className="copyright">
          © 2026 Ivonne Hernández Monroy. Desarrollo de la página y derechos reservados.
        </span>
      </footer>
      <AmaraChat key={language} language={language} />
    </main>
  )
}

export default App
