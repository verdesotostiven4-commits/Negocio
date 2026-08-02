export type MediaKind = "video" | "image" | "slide";
export type TransitionName = "fade" | "slide" | "zoom" | "wipe" | "none";
export type SlideTheme = "brand" | "offer" | "services" | "fresh" | "dark";

export interface ScheduleWindow {
  startsAt?: string;
  endsAt?: string;
  days?: number[];
  fromHour?: string;
  toHour?: string;
}

export interface SignageItem {
  id: string;
  kind: MediaKind;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: string;
  price?: string;
  callToAction?: string;
  src?: string;
  poster?: string;
  voiceoverUrl?: string;
  durationSeconds: number;
  transition: TransitionName;
  theme?: SlideTheme;
  enabled: boolean;
  muted?: boolean;
  fit?: "cover" | "contain";
  schedule?: ScheduleWindow;
}

export interface SignageSettings {
  businessName: string;
  slogan: string;
  location: string;
  phone: string;
  hours: string;
  backgroundMusicUrl?: string;
  backgroundMusicVolume: number;
  autoRefreshSeconds: number;
  showClock: boolean;
  showProgress: boolean;
}

export interface SignagePlaylist {
  version: number;
  updatedAt: string;
  settings: SignageSettings;
  items: SignageItem[];
}

export interface PlaylistResponse {
  playlist: SignagePlaylist;
  source: "blob" | "default";
}
