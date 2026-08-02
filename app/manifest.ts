import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barrio MAX TV",
    short_name: "MAX TV",
    description: "Pantalla digital para Barrio MAX",
    start_url: "/tv",
    display: "standalone",
    orientation: "landscape",
    background_color: "#05070d",
    theme_color: "#d80712",
    icons: [
      { src: "/assets/logo-mark.svg", sizes: "512x512", type: "image/png" }
    ]
  };
}
