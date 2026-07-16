import type { Lang } from "./utils";

export const ui = {
  es: {
    "nav.home": "Inicio",
    "nav.about": "Sobre mí",
    "nav.portfolio": "Portafolio",
    "nav.blog": "Blog",
    "nav.contact": "Contacto",
    "nav.menu": "Menú",
    "nav.lang": "Idioma",
    "skip": "Saltar al contenido",
    "hero.h1_before": "Soy",
    "hero.h1_after": ", Ingeniero en Software.",
    "hero.about_link": "Conoce más sobre mí",
    "hero.cta_primary": "Trabajemos juntos",
    "hero.cta_secondary": "Ver portafolio",
    "home.featured_label": "Portafolio destacado",
    "home.featured_title": "Colaboraciones con impacto real",
    "home.featured_lead":
      "Sitios que codifiqué a partir de wireframes en Figma de Idea2Form / Idris Aguero, para organizaciones de comunidad, equity y climate tech.",
    "home.featured_more": "Ver índice completo del portafolio",
    "home.blog_label": "Blog",
    "home.blog_title": "Notas sobre lo que construyo",
    "home.blog_lead":
      "IA, automatización, RevOps, CRM y datos: notas prácticas para sistemas con menos fricción.",
    "home.blog_more": "Ver todos los posts",
    "home.services_label": "Servicios freelance",
    "home.services_title": "Cómo puedo ayudarte",
    "home.services_lead":
      "Automatización con IA, RevOps, análisis de datos y optimización de ERP/CRM para que tu operación deje de pelear contra el software.",
    "home.cta_label": "Disponible para colaborar",
    "home.cta_title": "¿Listo para quitar fricción a tus sistemas?",
    "home.cta_email": "Escribirme",
    "home.cta_contact": "Ver contacto",
    "carousel.prev": "Anterior",
    "carousel.next": "Siguiente",
    "portfolio.label": "Portafolio",
    "portfolio.title": "Proyectos que cuidé con oficio y pasión",
    "portfolio.lead":
      "He colaborado en proyectos muy distintos: frontend y backend, automatización con IA, RevOps, DevOps, webmaster, business intelligence, creación de dashboards y aplicaciones web. En cada uno pongo el mismo cuidado para que lo técnico se sienta claro, útil y sin fricción.",
    "portfolio.meta_description":
      "Portafolio de Danny Cen: colaboración en frontend, backend, IA, RevOps, DevOps, BI, dashboards y apps web — con oficio y pasión.",
    "portfolio.visit": "Visitar sitio",
    "portfolio.back": "Volver al índice",
    "portfolio.role": "Rol",
    "portfolio.studio": "Estudio",
    "portfolio.period": "Periodo",
    "blog.label": "Blog",
    "blog.title": "Notas y artículos",
    "blog.lead":
      "Seis temas sobre cómo trabajo: agentes de IA, automatización, WhatsApp + Kommo, UI/UX de impacto, desarrollo con IA y producto híbrido.",
    "blog.meta_description":
      "Blog de Danny Cen sobre automatización con IA, RevOps, CRM y sistemas con menos fricción.",
    "blog.back": "Volver al blog",
    "blog.empty": "Aún no hay artículos publicados.",
    "about.label": "Sobre mí",
    "about.title": "Ingeniero en Software con oficio y pasión",
    "about.p1":
      "Soy {name}, Ingeniero en Software en {location}. Trabajo en frontend y backend, automatización con IA, RevOps, DevOps, datos y aplicaciones web — y a cada proyecto le imprimo la misma calidad y cuidado con los que me gusta trabajar.",
    "about.p2":
      "Mi filosofía es simple: crear y optimizar procesos que quiten fricción. Integro flujos, agentes de IA, WhatsApp, CRM y APIs para que el software trabaje a favor del equipo — no en contra — y se sienta claro, útil y bien hecho.",
    "about.p3":
      "También hago análisis de datos y RevOps: alinear marketing, ventas y operaciones con información clara y sistemas que no se pelean entre sí. He sido Product Owner, Project Manager e implementador certificado de Kommo CRM; me importa el resultado tanto como el oficio detrás.",
    "about.exp_label": "Experiencia",
    "about.exp_title": "Trayectoria",
    "about.stack_label": "Stack",
    "about.stack_title": "Herramientas con las que trabajo",
    "contact.label": "Contacto",
    "contact.title": "Cuéntame qué quieres destrabar",
    "contact.lead":
      "Ideal si tu ERP, CRM o stack interno te está consumiendo tiempo — o si quieres automatizar con IA, RevOps y datos sin sumar más complejidad.",
    "contact.message_cta": "Enviar mensaje",
    "contact.form_title": "Deja tus datos",
    "contact.form_lead":
      "Completa el formulario y yo me pongo en contacto contigo. No hace falta que me escribas primero a mi correo.",
    "contact.form_name": "Nombre",
    "contact.form_email": "Email",
    "contact.form_phone": "Teléfono / WhatsApp",
    "contact.form_message": "Mensaje",
    "contact.form_submit": "Enviar mensaje",
    "contact.form_mail_subject": "Mensaje de {name}",
    "contact.form_success": "Mensaje enviado. Te llegará una confirmación por correo.",
    "contact.modal_close": "Cerrar",
    "contact.meta":
      "Contacta a {name} en Mérida, Yucatán, México: automatización con IA, RevOps, datos y sistemas con menos fricción.",
    "booking.label": "Agendar cita",
    "booking.title": "Consulta de automatización y sistemas",
    "booking.lead":
      "Hablemos del proceso o sistema que más fricción te genera. Revisamos ERP, CRM, datos o RevOps y armamos una ruta clara para optimizarlo.",
    "booking.duration": "{min} min",
    "booking.video": "Videollamada",
    "booking.select_date": "Selecciona fecha",
    "booking.select_time": "Horarios",
    "booking.confirm": "Confirmar selección",
    "booking.need_date": "Elige una fecha disponible",
    "booking.need_time": "Elige un horario",
    "booking.your_details": "Tus datos",
    "booking.guest_name": "Nombre",
    "booking.guest_email": "Email",
    "booking.guest_phone": "Teléfono / WhatsApp",
    "booking.mail_subject": "Cita — {name} · {date} a las {time}",
    "booking.mail_body":
      "Nueva solicitud de cita\n\nNombre: {name}\nEmail: {email}\nTeléfono: {phone}\nFecha: {date}\nHora: {time} ({tz})\nVía: {via}\n\n",
    "booking.success": "Agendado {date} · {time}. Te envié la confirmación y el Meet por correo.",
    "booking.prev_month": "Mes anterior",
    "booking.next_month": "Mes siguiente",
    "meets.label": "Agendar cita",
    "meets.title": "Agendar una cita",
    "meets.lead":
      "Elige fecha y horario para una videollamada de 30 minutos. Te llegará confirmación y enlace de Meet por correo.",
    "meets.meta":
      "Agenda una videollamada con {name}: consulta de automatización, IA, RevOps y sistemas en Mérida (CST).",
    "footer.pages": "Páginas",
    "footer.contact": "Contacto",
    "sky.caption1": "Cielo de Yucatán",
    "sky.caption2": "Horizonte · cenote",
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.portfolio": "Portfolio",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "nav.menu": "Menu",
    "nav.lang": "Language",
    "skip": "Skip to content",
    "hero.h1_before": "I'm",
    "hero.h1_after": ", a Software Engineer.",
    "hero.about_link": "Learn more about me",
    "hero.cta_primary": "Let's work together",
    "hero.cta_secondary": "View portfolio",
    "home.featured_label": "Featured portfolio",
    "home.featured_title": "Collaborations with real impact",
    "home.featured_lead":
      "Sites I coded from Idea2Form / Idris Aguero Figma wireframes for community, equity, and climate tech organizations.",
    "home.featured_more": "See the full portfolio index",
    "home.blog_label": "Blog",
    "home.blog_title": "Notes on what I build",
    "home.blog_lead":
      "AI automation, RevOps, CRM, and data — practical notes for systems with less friction.",
    "home.blog_more": "See all posts",
    "home.services_label": "Freelance services",
    "home.services_title": "How I can help",
    "home.services_lead":
      "AI automation, RevOps, data analysis, and ERP/CRM optimization so your operation stops fighting the software.",
    "home.cta_label": "Open to collaborate",
    "home.cta_title": "Ready to remove friction from your systems?",
    "home.cta_email": "Email me",
    "home.cta_contact": "Contact details",
    "carousel.prev": "Previous",
    "carousel.next": "Next",
    "portfolio.label": "Portfolio",
    "portfolio.title": "Projects I shipped with craft and care",
    "portfolio.lead":
      "I’ve collaborated across very different projects: frontend and backend, AI automation, RevOps, DevOps, webmaster work, business intelligence, dashboards, and web apps. In each one I bring the same care so the technical side feels clear, useful, and low-friction.",
    "portfolio.meta_description":
      "Danny Cen portfolio: collaboration across frontend, backend, AI, RevOps, DevOps, BI, dashboards, and web apps — with craft and care.",
    "portfolio.visit": "Visit site",
    "portfolio.back": "Back to index",
    "portfolio.role": "Role",
    "portfolio.studio": "Studio",
    "portfolio.period": "Period",
    "blog.label": "Blog",
    "blog.title": "Notes & articles",
    "blog.lead":
      "Six topics on how I work: AI agents, automation, WhatsApp + Kommo, impact UI/UX, AI-assisted development, and hybrid product delivery.",
    "blog.meta_description":
      "Danny Cen’s blog on AI automation, RevOps, CRM, and lower-friction systems.",
    "blog.back": "Back to blog",
    "blog.empty": "No posts published yet.",
    "about.label": "About",
    "about.title": "Software Engineer with craft and care",
    "about.p1":
      "I'm {name}, a Software Engineer in {location}. I work across frontend and backend, AI automation, RevOps, DevOps, data, and web apps — and I bring the same quality and care to every project that I want to stand behind.",
    "about.p2":
      "My philosophy is simple: build and optimize processes that remove friction. I integrate flows, AI agents, WhatsApp, CRM, and APIs so software works for the team — not against it — and feels clear, useful, and well made.",
    "about.p3":
      "I also do data analysis and RevOps: aligning marketing, sales, and operations with clear information and systems that don't fight each other. I've been a Product Owner, Project Manager, and certified Kommo CRM implementer; I care as much about the craft as the outcome.",
    "about.exp_label": "Experience",
    "about.exp_title": "Career path",
    "about.stack_label": "Stack",
    "about.stack_title": "Tools I work with",
    "contact.label": "Contact",
    "contact.title": "Tell me what you want to unblock",
    "contact.lead":
      "Ideal if your ERP, CRM, or internal stack is eating time — or if you want AI automation, RevOps, and data without adding more complexity.",
    "contact.message_cta": "Send a message",
    "contact.form_title": "Leave your details",
    "contact.form_lead":
      "Fill in the form and I’ll get back to you. You don’t need to email me first.",
    "contact.form_name": "Name",
    "contact.form_email": "Email",
    "contact.form_phone": "Phone / WhatsApp",
    "contact.form_message": "Message",
    "contact.form_submit": "Send message",
    "contact.form_mail_subject": "Message from {name}",
    "contact.form_success": "Message sent. You’ll get a confirmation email shortly.",
    "contact.modal_close": "Close",
    "contact.meta":
      "Contact {name} in Mérida, Yucatán, Mexico: AI automation, RevOps, data, and lower-friction systems.",
    "booking.label": "Book a call",
    "booking.title": "Automation & systems consult",
    "booking.lead":
      "Let's talk about the process or system creating the most friction. We'll review ERP, CRM, data, or RevOps and sketch a clear path to optimize it.",
    "booking.duration": "{min} min",
    "booking.video": "Video call",
    "booking.select_date": "Select a date",
    "booking.select_time": "Time slots",
    "booking.confirm": "Confirm selection",
    "booking.need_date": "Pick an available date",
    "booking.need_time": "Pick a time slot",
    "booking.your_details": "Your details",
    "booking.guest_name": "Name",
    "booking.guest_email": "Email",
    "booking.guest_phone": "Phone / WhatsApp",
    "booking.mail_subject": "Call — {name} · {date} at {time}",
    "booking.mail_body":
      "New booking request\n\nName: {name}\nEmail: {email}\nPhone: {phone}\nDate: {date}\nTime: {time} ({tz})\nVia: {via}\n\n",
    "booking.success": "Booked {date} · {time}. I emailed you the confirmation and Meet link.",
    "booking.prev_month": "Previous month",
    "booking.next_month": "Next month",
    "meets.label": "Book a call",
    "meets.title": "Schedule a call",
    "meets.lead":
      "Pick a date and time for a 30-minute video call. You'll get email confirmation and a Meet link.",
    "meets.meta":
      "Book a video call with {name}: automation, AI, RevOps, and systems consult (CST, Mérida).",
    "footer.pages": "Pages",
    "footer.contact": "Contact",
    "sky.caption1": "Yucatán sky",
    "sky.caption2": "Horizon · cenote",
  },
} as const;

export type UiKey = keyof (typeof ui)["es"];

export function useTranslations(lang: Lang) {
  return function t(key: UiKey, vars?: Record<string, string>) {
    let value: string = ui[lang][key] ?? ui.es[key];
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        value = value.replace(`{${k}}`, v);
      }
    }
    return value;
  };
}

export function getNav(lang: Lang) {
  const t = useTranslations(lang);
  return [
    { label: t("nav.home"), path: "" },
    { label: t("nav.about"), path: "about" },
    { label: t("nav.portfolio"), path: "portafolio" },
    { label: t("nav.blog"), path: "blog" },
    { label: t("nav.contact"), path: "contact" },
  ];
}
