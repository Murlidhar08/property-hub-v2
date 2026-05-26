import { format } from "date-fns";

interface UserDateFormatConfig {
    dateFormat: string;
    timeFormat: string;
}

let globalUserConfig: UserDateFormatConfig = {
    dateFormat: "dd/MM/yyyy",
    timeFormat: "hh:mm a"
};

/**
 * Set the global user configuration for hook-free formatting.
 */
export function setGlobalUserConfig(config: Partial<UserDateFormatConfig>) {
    if (config.dateFormat) {
        globalUserConfig.dateFormat = config.dateFormat;
    }
    if (config.timeFormat) {
        globalUserConfig.timeFormat = config.timeFormat;
    }
}

/**
 * Retrieve the active global user config preferences.
 */
export function getGlobalUserConfig(): UserDateFormatConfig {
    return globalUserConfig;
}

/**
 * Formats a date according to the user's preferred date format.
 * Falls back to safe formatting or original string if parsing fails.
 */
export const formatUserDate = (date: Date | string | number, customFormat?: string): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        return format(d, customFormat || globalUserConfig.dateFormat);
    } catch (error) {
        return String(date);
    }
};

/**
 * Formats a time according to the user's preferred time format (12/24 hour).
 * Falls back to safe formatting or original string if parsing fails.
 */
export const formatUserTime = (date: Date | string | number, customFormat?: string): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        return format(d, customFormat || globalUserConfig.timeFormat);
    } catch (error) {
        return String(date);
    }
};

/**
 * Formats both date and time in a cohesive string based on user preferences.
 */
export const formatUserDateTime = (
    date: Date | string | number,
    separator: string = " • "
): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);

        const formattedDate = formatUserDate(d);
        const formattedTime = formatUserTime(d);

        return `${formattedDate}${separator}${formattedTime}`;
    } catch (error) {
        return String(date);
    }
};
