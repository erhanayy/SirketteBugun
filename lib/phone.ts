export function formatPhoneForDisplay(value: string | null | undefined): string {
    if (!value) return '';

    let digits = value.replace(/\D/g, '');

    // Yabancı numaralarformatsız şekilde doğrudan gösterilsin
    if (!digits.startsWith('0090')) {
        return digits;
    }

    let formatted = '';

    if (digits.length > 0) {
        let i = 0;
        while (i < digits.length) {
            if (i === 0) { formatted += digits.substring(i, i + 2); i += 2; }
            else if (i === 2) { formatted += ' ' + digits.substring(i, i + 2); i += 2; }
            else if (i === 4) { formatted += ' ' + digits.substring(i, i + 3); i += 3; }
            else if (i === 7) { formatted += ' ' + digits.substring(i, i + 3); i += 3; }
            else if (i === 10) { formatted += ' ' + digits.substring(i, i + 2); i += 2; }
            else if (i === 12) { formatted += ' ' + digits.substring(i, i + 2); i += 2; }
            else { formatted += ' ' + digits.substring(i); i = digits.length; }
        }
    }

    return formatted;
}
