import { ThemeMode } from "@/lib/generated/prisma/browser";

export interface UserSettingsInput {
  dateFormat?: string
  timeFormat?: string
  language?: string
  theme?: ThemeMode
}
