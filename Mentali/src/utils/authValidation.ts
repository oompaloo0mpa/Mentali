import { CountryCode as PhoneCountryCode, isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

export function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string, countryCode: PhoneCountryCode) {
    return isValidPhoneNumber(value, countryCode);
}

/** Normalize a national phone input to E.164 (e.g. +6591234567) for API storage and lookup. */
export function toE164Phone(
    value: string,
    countryCode: PhoneCountryCode,
    callingCode?: string,
): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const parsed = parsePhoneNumber(trimmed, countryCode);
        if (parsed?.isValid()) return parsed.format("E.164");
    } catch {
        // fall through to calling-code fallback
    }

    if (callingCode) {
        const digits = trimmed.replace(/\D/g, "");
        if (!digits) return null;
        try {
            const parsed = parsePhoneNumber(`+${callingCode}${digits}`);
            if (parsed?.isValid()) return parsed.format("E.164");
        } catch {
            return null;
        }
    }

    return null;
}

export function isValidVerificationCode(value: string) {
    return /^\d{6}$/.test(value.trim());
}

export function getPasswordRequirements(value: string) {
    return {
        hasLength: value.length >= 8,
        hasNumber: /\d/.test(value),
        hasUppercase: /[A-Z]/.test(value),
        hasSpecialCharacter: /[^A-Za-z0-9]/.test(value),
    };
}

export function isStrongPassword(value: string) {
    const requirements = getPasswordRequirements(value);

    return (
        requirements.hasLength &&
        requirements.hasNumber &&
        requirements.hasUppercase &&
        requirements.hasSpecialCharacter
    );
}