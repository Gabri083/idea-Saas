const es = {
  nav: {
    product: "Producto",
    howItWorks: "Cómo funciona",
    pricing: "Precios",
    login: "Iniciar sesión",
    cta: "Empezar gratis",
  },
  hero: {
    badge: "Impulsado por GPT-4o",
    titleLead: "La primera plataforma de",
    titleGradient: "reseñas imparciales",
    titleTail: "impulsada por IA",
    subtitle:
      "Protege a tu marca del sesgo de la ira. Tus clientes conservan su voz, la IA aporta la objetividad. Convierte críticas injustas en crecimiento operativo.",
    ctaPrimary: "Empezar gratis",
    ctaSecondary: "Ver Demo Interactiva",
    exampleLabel: "Reseña del cliente (texto intacto)",
    exampleQuote:
      "El producto es hermoso, pero el envío tardó 3 días de más y nadie me avisó — 1★ en caliente",
    scoreLabel: "Puntaje Objetivo IA",
    shippingPenalty: "Envío: -2 pts",
  },
  problemSolution: {
    title: "Una mala tarde no debería definir tu reputación",
    subtitle:
      "Las plataformas tradicionales premian la emoción del momento. Nosotros medimos los hechos.",
    problemLabel: "El problema",
    problemTitle: "Clientes que aman el producto, pero califican con rabia",
    problemBody:
      "Un cliente ama tu producto, pero el transportista se retrasó 3 días. Escribe una reseña detallando lo bueno y lo malo — y aun así te deja 1 estrella en caliente. Esa nota, descontextualizada, arrastra tu promedio global para siempre.",
    problemExampleQuote: "“Todo perfecto, pero llegó tarde”",
    problemExampleSub: "Calificación tradicional: ★☆☆☆☆ (1.0)",
    solutionLabel: "Nuestra solución",
    solutionTitle: "Análisis de Sentimiento Ponderado",
    solutionBody:
      "Evaluamos Producto, Atención y Tiempos de Entrega por separado y calculamos una nota objetiva — sin tocar ni una palabra del texto original del cliente.",
    solutionExampleQuote: "Mismo texto, evaluado por hechos",
    solutionExampleSub: "Puntaje Objetivo IA: ★★★★☆ (3.8)",
    weightingLabel: "Ponderación transparente",
    weightProduct: "Calidad del producto",
    weightService: "Atención recibida",
    weightFootnote:
      "El 30% restante corresponde al cumplimiento de tiempos de envío — cada componente es auditable en el desglose público de la reseña.",
  },
  howItWorks: {
    title: "Cómo funciona",
    subtitle: "De la reseña en bruto a una calificación defendible, en segundos.",
    steps: [
      {
        title: "El cliente escribe libremente",
        description:
          "Sin filtros, sin barreras, sin censura. El cliente cuenta su experiencia completa, tal como la vivió.",
      },
      {
        title: "La IA desglosa los hechos",
        description:
          "GPT-4o analiza Producto, Atención y Envíos por separado y emite un puntaje ponderado, ignorando el tono emocional.",
      },
      {
        title: "Estrellas imparciales, publicadas",
        description:
          "El resultado se publica en tu e-commerce con un widget transparente y auditable — cada punto tiene una explicación.",
      },
    ],
  },
  impactCalculator: {
    label: "Calculadora de impacto",
    title: "¿Cuánto promedio estás perdiendo por reseñas injustas?",
    body: "Ajusta cuántas reseñas de 1 estrella “injustas” recibe tu tienda al mes (buen producto, mala experiencia logística puntual) y mira cuánto promedio recuperarías con Kelsira.",
    sliderLabel: "Reseñas de 1★ injustas / mes",
    sliderAria: "Reseñas de 1 estrella injustas al mes",
    // {total} / {avg} / {n} are replaced client-side — plain functions can't
    // cross the server-to-client boundary as props (ImpactCalculator is a
    // Client Component for the interactive slider).
    assumption: "Supuesto: sobre una base de {total} reseñas/mes, el resto de tus clientes satisfechos promedia {avg}★.",
    currentAvgLabel: "Promedio actual",
    currentAvgSub: "Con calificación tradicional",
    kelsiraAvgLabel: "Promedio con Kelsira",
    kelsiraAvgSub: "Con puntaje objetivo IA",
    recoveredPrefix: "Recuperarías",
    recoveredHighlight: "+{n} estrellas",
    recoveredSuffix: "de promedio global cada mes.",
  },
  pricing: {
    title: "Planes simples y transparentes",
    subtitle: "Sin permanencia. Cancela cuando quieras.",
    mostPopular: "Más popular",
    perMonth: "/mes",
    ctaFree: "Empezar gratis",
    ctaPaid: (name: string) => `Elegir ${name}`,
    plans: {
      free: {
        name: "Gratis",
        trialNote: "Sin tarjeta de crédito.",
        description: "Para probar Kelsira en serio antes de decidir.",
        features: ["Hasta 20 reseñas/mes", "Widget estándar", "Puntaje objetivo IA"],
      },
      starter: {
        name: "Starter",
        trialNote: "14 días de prueba gratis, requiere tarjeta.",
        description: "Para marcas independientes que están empezando.",
        features: ["Hasta 200 reseñas/mes", "Widget estándar", "Puntaje objetivo IA", "Soporte por email"],
      },
      growth: {
        name: "Growth",
        trialNote: "14 días de prueba gratis, requiere tarjeta.",
        description: "Para e-commerce en crecimiento activo.",
        features: [
          "Reseñas ilimitadas",
          "Consultor de Mejora Operativa IA",
          "Apelaciones prioritarias",
          "Widget personalizable",
          "Centro de Calibración e Histórico",
        ],
      },
      enterprise: {
        name: "Enterprise",
        trialNote: "14 días de prueba gratis, requiere tarjeta.",
        description: "Para operaciones multi-tienda a gran escala.",
        features: [
          "Soporte multi-tienda",
          "API custom",
          "Gestor de cuenta dedicado",
          "SLA de apelaciones",
          "Todo lo del plan Growth",
        ],
      },
    },
  },
  footer: {
    tagline: "Reputación justa y reseñas asistidas por IA para e-commerce.",
    columns: {
      product: {
        title: "Producto",
        links: [
          { label: "Cómo funciona", href: "#como-funciona" },
          { label: "Precios", href: "#precios" },
          { label: "Programa de afiliados", href: "/afiliados" },
        ],
      },
      legal: {
        title: "Legal",
        links: [
          { label: "Términos del Servicio", href: "/legal/terminos" },
          { label: "Política de Privacidad", href: "/legal/privacidad" },
          { label: "Política de Transparencia de la IA", href: "/legal/transparencia-ia" },
        ],
      },
      contact: {
        title: "Contacto",
        links: [
          { label: "hola@kelsira.app", href: "mailto:hola@kelsira.app" },
          { label: "Soporte", href: "mailto:soporte@kelsira.app" },
        ],
      },
    },
    rights: (year: number) => `© ${year} Kelsira. Todos los derechos reservados.`,
    auditable: "Cada calificación IA es auditable y explicable.",
  },
};

const en: typeof es = {
  nav: {
    product: "Product",
    howItWorks: "How it works",
    pricing: "Pricing",
    login: "Log in",
    cta: "Start free",
  },
  hero: {
    badge: "Powered by GPT-4o",
    titleLead: "The first",
    titleGradient: "unbiased review",
    titleTail: "platform powered by AI",
    subtitle:
      "Protect your brand from anger bias. Your customers keep their voice, the AI brings the objectivity. Turn unfair criticism into operational growth.",
    ctaPrimary: "Start free",
    ctaSecondary: "See Interactive Demo",
    exampleLabel: "Customer review (text untouched)",
    exampleQuote:
      "The product is beautiful, but shipping took 3 extra days and nobody told me — 1★ in the heat of the moment",
    scoreLabel: "AI Objective Score",
    shippingPenalty: "Shipping: -2 pts",
  },
  problemSolution: {
    title: "A bad day shouldn't define your reputation",
    subtitle: "Traditional platforms reward the emotion of the moment. We measure the facts.",
    problemLabel: "The problem",
    problemTitle: "Customers who love the product, but rate out of anger",
    problemBody:
      "A customer loves your product, but the carrier was 3 days late. They write a review detailing both the good and the bad — and still leave you 1 star in the heat of the moment. That score, stripped of context, drags down your overall average forever.",
    problemExampleQuote: "“Everything perfect, but it arrived late”",
    problemExampleSub: "Traditional rating: ★☆☆☆☆ (1.0)",
    solutionLabel: "Our solution",
    solutionTitle: "Weighted Sentiment Analysis",
    solutionBody:
      "We evaluate Product, Service, and Delivery Times separately and compute an objective score — without touching a single word of the customer's original text.",
    solutionExampleQuote: "Same text, scored by facts",
    solutionExampleSub: "AI Objective Score: ★★★★☆ (3.8)",
    weightingLabel: "Transparent weighting",
    weightProduct: "Product quality",
    weightService: "Service received",
    weightFootnote:
      "The remaining 30% covers on-time delivery — every component is auditable in the review's public breakdown.",
  },
  howItWorks: {
    title: "How it works",
    subtitle: "From raw review to a defensible rating, in seconds.",
    steps: [
      {
        title: "The customer writes freely",
        description:
          "No filters, no barriers, no censorship. The customer tells their full experience, exactly as they lived it.",
      },
      {
        title: "The AI breaks down the facts",
        description:
          "GPT-4o analyzes Product, Service, and Shipping separately and issues a weighted score, ignoring emotional tone.",
      },
      {
        title: "Unbiased stars, published",
        description:
          "The result is published on your storefront with a transparent, auditable widget — every point comes with an explanation.",
      },
    ],
  },
  impactCalculator: {
    label: "Impact calculator",
    title: "How much average rating are you losing to unfair reviews?",
    body: "Adjust how many “unfair” 1-star reviews your store gets per month (great product, one-off logistics hiccup) and see how much average rating you'd recover with Kelsira.",
    sliderLabel: "Unfair 1★ reviews / month",
    sliderAria: "Unfair 1-star reviews per month",
    assumption: "Assumption: out of {total} reviews/month, the rest of your happy customers average {avg}★.",
    currentAvgLabel: "Current average",
    currentAvgSub: "With traditional rating",
    kelsiraAvgLabel: "Average with Kelsira",
    kelsiraAvgSub: "With AI objective score",
    recoveredPrefix: "You'd recover",
    recoveredHighlight: "+{n} stars",
    recoveredSuffix: "of overall average every month.",
  },
  pricing: {
    title: "Simple, transparent plans",
    subtitle: "No lock-in. Cancel anytime.",
    mostPopular: "Most popular",
    perMonth: "/mo",
    ctaFree: "Start free",
    ctaPaid: (name: string) => `Choose ${name}`,
    plans: {
      free: {
        name: "Free",
        trialNote: "No credit card.",
        description: "To seriously try Kelsira before deciding.",
        features: ["Up to 20 reviews/mo", "Standard widget", "AI objective score"],
      },
      starter: {
        name: "Starter",
        trialNote: "14-day free trial, card required.",
        description: "For independent brands just getting started.",
        features: ["Up to 200 reviews/mo", "Standard widget", "AI objective score", "Email support"],
      },
      growth: {
        name: "Growth",
        trialNote: "14-day free trial, card required.",
        description: "For actively growing e-commerce brands.",
        features: [
          "Unlimited reviews",
          "AI Operational Improvement Consultant",
          "Priority appeals",
          "Customizable widget",
          "Calibration & History Center",
        ],
      },
      enterprise: {
        name: "Enterprise",
        trialNote: "14-day free trial, card required.",
        description: "For large-scale multi-store operations.",
        features: [
          "Multi-store support",
          "Custom API",
          "Dedicated account manager",
          "Appeals SLA",
          "Everything in Growth",
        ],
      },
    },
  },
  footer: {
    tagline: "Fair reputation and AI-assisted reviews for e-commerce.",
    columns: {
      product: {
        title: "Product",
        links: [
          { label: "How it works", href: "#como-funciona" },
          { label: "Pricing", href: "#precios" },
          { label: "Affiliate program", href: "/afiliados" },
        ],
      },
      legal: {
        title: "Legal",
        links: [
          { label: "Terms of Service", href: "/legal/terminos" },
          { label: "Privacy Policy", href: "/legal/privacidad" },
          { label: "AI Transparency Policy", href: "/legal/transparencia-ia" },
        ],
      },
      contact: {
        title: "Contact",
        links: [
          { label: "hola@kelsira.app", href: "mailto:hola@kelsira.app" },
          { label: "Support", href: "mailto:soporte@kelsira.app" },
        ],
      },
    },
    rights: (year: number) => `© ${year} Kelsira. All rights reserved.`,
    auditable: "Every AI rating is auditable and explainable.",
  },
};

export const dictionaries = { en, es };
export type Dictionary = typeof es;
