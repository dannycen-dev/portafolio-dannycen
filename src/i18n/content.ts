import type { Lang } from "./utils";

export const siteByLang = {
  es: {
    title: "Ingeniero en Software · Automatización con IA · RevOps",
    location: "Mérida, Yucatán, México",
    tagline:
      "Creo soluciones y optimizo procesos para que tu ERP, CRM o sistema deje de dar dolores de cabeza.",
    shortBio:
      "Ingeniero en Software en Mérida, Yucatán, México. Automatizo con inteligencia artificial, analizo datos y hago RevOps para reducir fricción entre personas y los sistemas que usan a diario.",
    availability: "Disponible para proyectos freelance, remoto o híbrido.",
  },
  en: {
    title: "Software Engineer · AI Automation · RevOps",
    location: "Mérida, Yucatán, Mexico",
    tagline:
      "I build solutions and optimize processes so your ERP, CRM, or internal tools stop being a headache.",
    shortBio:
      "Software Engineer based in Mérida, Yucatán, Mexico. I automate with AI, analyze data, and do RevOps to remove friction between people and the systems they rely on every day.",
    availability: "Available for freelance, remote, or hybrid projects.",
  },
} as const;

export const servicesByLang = {
  es: [
    {
      title: "Automatización con IA",
      description:
        "Agentes, chatbots y flujos inteligentes que conectan WhatsApp, CRM, APIs y herramientas de negocio — menos trabajo manual, más foco en vender y operar.",
    },
    {
      title: "RevOps & CRM",
      description:
        "Alineo marketing, ventas y operaciones: Kommo, Odoo e integraciones que hacen que el pipeline fluya sin pelear contra el sistema.",
    },
    {
      title: "Menos fricción en ERP y sistemas",
      description:
        "Diseño y optimizo procesos alrededor de tus sistemas existentes para que el equipo deje de sufrir con pantallas, datos duplicados y pasos innecesarios.",
    },
    {
      title: "Análisis de datos",
      description:
        "Reportes, dashboards y señales accionables para decidir con datos — no con intuición suelta ni hojas de cálculo eternas.",
    },
  ],
  en: [
    {
      title: "AI automation",
      description:
        "Agents, chatbots, and intelligent flows that connect WhatsApp, CRM, APIs, and business tools — less manual work, more focus on selling and operating.",
    },
    {
      title: "RevOps & CRM",
      description:
        "I align marketing, sales, and ops: Kommo, Odoo, and integrations that keep the pipeline moving without fighting the system.",
    },
    {
      title: "Less friction in ERP & systems",
      description:
        "I design and optimize processes around your existing tools so teams stop suffering through cluttered screens, duplicate data, and needless steps.",
    },
    {
      title: "Data analysis",
      description:
        "Reports, dashboards, and actionable signals so you decide with data — not gut feel or endless spreadsheets.",
    },
  ],
} as const;

export const experienceByLang = {
  es: [
    {
      role: "Administrador de Aplicaciones / PM",
      company: "Grupo ALI",
      period: "Jul 2023 — Actualidad",
      mode: "Presencial",
      summary:
        "Transformación digital inmobiliaria: Kommo, bots con WhatsApp Cloud API, n8n/Make, servidores y BigQuery.",
    },
    {
      role: "Desarrollador de Automatizaciones IA",
      company: "Fiborti Analytics",
      period: "Ago 2025 — Jul 2026",
      mode: "Remoto · Freelance",
      summary:
        "Ecosistemas inteligentes con automatización, IA y CRM. Chatbots, flujos y APIs para equipos comerciales.",
    },
    {
      role: "QA Frontend / QA Analyst",
      company: "31ROOMS",
      period: "Sep 2024 — Ene 2025",
      mode: "Remoto",
      summary:
        "QA en proyecto UNADM: Playwright, validación UI/UX, documentación y seguimiento de bugs.",
    },
    {
      role: "Desarrollador front-end",
      company: "Idea2Form · Idris Aguero",
      period: "Ago 2020 — Ene 2024",
      mode: "Remoto",
      summary:
        "Implementación en código de sitios mission-driven a partir de wireframes en Figma de Idris Aguero (EPACA, Self-eSTEM, Decolonizing Wealth, Equity Is Dynamic y más). Referencias: Elle / Idris Aguero.",
    },
  ],
  en: [
    {
      role: "Applications Administrator / PM",
      company: "Grupo ALI",
      period: "Jul 2023 — Present",
      mode: "On-site",
      summary:
        "Real-estate digital transformation: Kommo, WhatsApp Cloud API bots, n8n/Make, servers, and BigQuery.",
    },
    {
      role: "AI Automation Developer",
      company: "Fiborti Analytics",
      period: "Aug 2025 — Jul 2026",
      mode: "Remote · Freelance",
      summary:
        "Intelligent ecosystems with automation, AI, and CRM. Chatbots, flows, and APIs for sales teams.",
    },
    {
      role: "QA Frontend / QA Analyst",
      company: "31ROOMS",
      period: "Sep 2024 — Jan 2025",
      mode: "Remote",
      summary:
        "QA for the UNADM project: Playwright, UI/UX validation, documentation, and bug tracking.",
    },
    {
      role: "Front-end developer",
      company: "Idea2Form · Idris Aguero",
      period: "Aug 2020 — Jan 2024",
      mode: "Remote",
      summary:
        "Front-end implementation of mission-driven sites from Idris Aguero’s Figma wireframes (EPACA, Self-eSTEM, Decolonizing Wealth, Equity Is Dynamic, and more). References: Elle / Idris Aguero.",
    },
  ],
} as const;

export const skillsByLang = {
  es: {
    "Automatización & IA": [
      "Agentes de IA",
      "OpenAI / Claude / Gemini",
      "n8n / Make / Zapier",
      "WhatsApp Cloud API",
      "DeepSeek local",
    ],
    Desarrollo: [
      "JavaScript",
      "PHP",
      "Angular",
      "Ruby on Rails",
      "WordPress",
      "MySQL",
      "Docker",
    ],
    "Sistemas & CRM": [
      "Kommo CRM (Implementador Certificado)",
      "Odoo",
      "RevOps",
      "AWS",
      "Linux",
      "GCP",
    ],
    "Datos & Ops": [
      "Análisis de datos",
      "Dashboards & reportes",
      "Optimización de procesos",
      "Integraciones ERP/CRM",
    ],
    "Herramientas IA": ["Cursor", "Claude Code", "Warp AI", "Antigravity"],
  },
  en: {
    "Automation & AI": [
      "AI agents",
      "OpenAI / Claude / Gemini",
      "n8n / Make / Zapier",
      "WhatsApp Cloud API",
      "Local DeepSeek",
    ],
    Development: [
      "JavaScript",
      "PHP",
      "Angular",
      "Ruby on Rails",
      "WordPress",
      "MySQL",
      "Docker",
    ],
    "Systems & CRM": [
      "Kommo CRM (Certified Implementer)",
      "Odoo",
      "RevOps",
      "AWS",
      "Linux",
      "GCP",
    ],
    "Data & Ops": [
      "Data analysis",
      "Dashboards & reporting",
      "Process optimization",
      "ERP/CRM integrations",
    ],
    "AI tools": ["Cursor", "Claude Code", "Warp AI", "Antigravity"],
  },
} as const;

export function localizedSite(lang: Lang) {
  return siteByLang[lang];
}
