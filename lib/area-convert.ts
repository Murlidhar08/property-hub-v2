import { MeasurementType } from "./generated/prisma/enums";

export function convertToSqFeet(
    value: number | null | undefined,
    type: MeasurementType | null | undefined
): number {
    if (!value || !type) return 0;

    switch (type) {
        case MeasurementType.acer:
            return value * 43560;
        // As per gujarat 1 bigha = 16 guntha
        case MeasurementType.bigha:
            return value * 17424;
        case MeasurementType.guntha:
            return value * 1089;
        default:
            return value;
    }
}