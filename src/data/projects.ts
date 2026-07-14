export type Project = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  tags: string[];
  featured?: boolean;
  accent: string;
};

export const projects: Project[] = [
  {
    slug: "whatsapp-ia-bot",
    title: "Bot de WhatsApp con IA",
    summary:
      "Automatización completa de leads, tareas e interacciones con Kommo CRM y WhatsApp Cloud API. Ahorro estimado de ~40 horas mensuales.",
    role: "Arquitectura & desarrollo",
    tags: ["IA", "WhatsApp API", "Kommo", "n8n"],
    featured: true,
    accent: "#1B6B63",
  },
  {
    slug: "control-patrimonial",
    title: "Sistema de Control Patrimonial",
    summary:
      "Product Owner en una solución que combina análisis geológico, inteligencia artificial y automatización de procesos para el corporativo.",
    role: "Product Owner",
    tags: ["IA", "Product", "Automatización"],
    featured: true,
    accent: "#2F4A3C",
  },
  {
    slug: "ecosistema-kommo",
    title: "Ecosistema Kommo + Automatizaciones",
    summary:
      "Implementación y administración de Kommo CRM para equipos comerciales, con bots de IA y flujos n8n/Make integrados al día a día.",
    role: "Implementación & automatización",
    tags: ["Kommo", "CRM", "Make", "n8n"],
    featured: true,
    accent: "#0E4D5C",
  },
  {
    slug: "idea2form",
    title: "Plataformas web internacionales",
    summary:
      "Desarrollo full stack de soluciones escalables para clientes en EE.UU.: Angular, Rails, WordPress, PHP y despliegues en AWS.",
    role: "Full Stack Developer",
    tags: ["Angular", "Rails", "AWS", "PHP"],
    featured: true,
    accent: "#3D4F3F",
  },
  {
    slug: "qa-unadm",
    title: "QA Frontend — UNADM",
    summary:
      "Pruebas manuales y automatizadas con Playwright, validación de UI/UX y documentación funcional para un producto digital educativo.",
    role: "QA Analyst",
    tags: ["Playwright", "QA", "UI/UX"],
    featured: false,
    accent: "#4A5A4E",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
