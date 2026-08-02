import type { SignagePlaylist } from "@/lib/types";

export const DEFAULT_PLAYLIST: SignagePlaylist = {
  version: 1,
  updatedAt: "2026-08-01T00:00:00.000Z",
  settings: {
    businessName: "BARRIO MAX",
    slogan: "Más cerca, más ahorro",
    location: "Barrio La Unión · Puerto Ayora",
    phone: "0991060509",
    hours: "Todos los días · 7:00 AM a 10:00 PM",
    backgroundMusicVolume: 0.2,
    autoRefreshSeconds: 30,
    showClock: true,
    showProgress: true
  },
  items: [
    {
      id: "bienvenida",
      kind: "slide",
      eyebrow: "Tu tienda del barrio",
      title: "Bienvenidos a Barrio MAX",
      subtitle: "De todo para tu hogar, con atención cercana y variedad todos los días.",
      callToAction: "Barrio La Unión · 7 AM a 10 PM",
      durationSeconds: 9,
      transition: "fade",
      theme: "brand",
      enabled: true,
      fit: "cover"
    },
    {
      id: "servicios",
      kind: "slide",
      eyebrow: "Todo en un solo lugar",
      title: "Recargas, transferencias y entretenimiento",
      subtitle: "Recargas móviles, Free Fire, DirecTV y más servicios disponibles en caja.",
      badge: "Rápido y fácil",
      callToAction: "Pregunta en caja",
      durationSeconds: 9,
      transition: "slide",
      theme: "services",
      enabled: true,
      fit: "cover"
    },
    {
      id: "abarrotes",
      kind: "slide",
      eyebrow: "Para la comida de cada día",
      title: "Abarrotes, aceites, enlatados y condimentos",
      subtitle: "Encuentra lo esencial para tu hogar sin ir lejos.",
      callToAction: "Más cerca, más ahorro",
      durationSeconds: 8,
      transition: "zoom",
      theme: "fresh",
      enabled: true,
      fit: "cover"
    },
    {
      id: "frescos",
      kind: "slide",
      eyebrow: "Frescos y de calidad",
      title: "Huevos, pollo, camarones, frutas y verduras",
      subtitle: "Productos para preparar tus comidas favoritas.",
      badge: "Disponibilidad diaria",
      durationSeconds: 9,
      transition: "wipe",
      theme: "fresh",
      enabled: true,
      fit: "cover"
    },
    {
      id: "delivery",
      kind: "slide",
      eyebrow: "¿No puedes venir?",
      title: "Te lo llevamos a domicilio",
      subtitle: "Haz tu pedido y consulta disponibilidad por WhatsApp.",
      callToAction: "099 106 0509",
      durationSeconds: 8,
      transition: "fade",
      theme: "dark",
      enabled: true
    },
    {
      id: "oferta-variable",
      kind: "slide",
      eyebrow: "Oferta del día",
      title: "Revisa nuestras promociones en tienda",
      subtitle: "Combos, últimas unidades y precios especiales cambian constantemente.",
      badge: "Aprovecha hoy",
      durationSeconds: 8,
      transition: "zoom",
      theme: "offer",
      enabled: true
    },
    {
      id: "cierre",
      kind: "slide",
      eyebrow: "Gracias por preferirnos",
      title: "BARRIO MAX",
      subtitle: "Más cerca, más ahorro",
      callToAction: "Barrio La Unión · Puerto Ayora",
      durationSeconds: 7,
      transition: "fade",
      theme: "brand",
      enabled: true
    }
  ]
};
