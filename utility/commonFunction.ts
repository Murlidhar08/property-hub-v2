import { format } from "date-fns";

export function formatAmount(amount?: number | null) {
    if (!amount) return "0";

    return Math.abs(amount).toLocaleString("en-IN");
}

export function getInitials(name?: string | null) {
    if (!name) return "?";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0][0]?.toUpperCase() ?? "?";
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const formatDate = (date: Date | string | number, dateFormat: string = "dd/MM/yyyy"): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        return format(d, dateFormat);
    } catch (error) {
        return String(date);
    }
};

export const formatTime = (date: Date | string | number, timeFormat: string = "hh:mm a"): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        return format(d, timeFormat);
    } catch (error) {
        return String(date);
    }
};

export function formatInWords(num: number, isSymbolRequire = true) {
    if (isNaN(num) || !num)
        return null;

    const units = [
        { value: 1e7, word: "crore" },
        { value: 1e5, word: "lakh" },
        { value: 1e3, word: "thousand" },
        { value: 1e2, word: "hundred" },
    ];

    let result = "";
    for (let i = 0; i < units.length; i++) {
        if (num >= units[i].value) {
            const count = Math.floor(num / units[i].value);
            num %= units[i].value;
            result += `${count} ${units[i].word} `;
        }
    }

    // Add any remaining amount (less than 100)
    let roundNum = Math.round(num);
    if (roundNum > 0) {
        result += `${roundNum} `;
    }


    // Return blank result
    if (!result)
        return null;

    // Currency Symbol
    // TODO: PENDING DYNAMIC SYMBOL
    if (isSymbolRequire)
        result = "$" + " " + result;

    return result.trim();
}