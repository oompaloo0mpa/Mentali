import { CountryCode as PhoneCountryCode, isValidPhoneNumber } from "libphonenumber-js";

export function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string, countryCode: PhoneCountryCode) {
    return isValidPhoneNumber(value, countryCode);
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