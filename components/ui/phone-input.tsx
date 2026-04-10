'use client';
import React, { useState } from 'react';

export function PhoneInput({ name, defaultValue, required, className, placeholder }: any) {
    const formatPhone = (value: string) => {
        // Rakamlar dışındaki her şeyi temizle (artı işareti dahil)
        let digits = value.replace(/\D/g, '');

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
                else { formatted += ' ' + digits.substring(i); i = digits.length; } // Kalanı direkt yaz
            }
        }

        return formatted ? formatted : '00 90 ';
    };

    const initialVal = defaultValue
        ? formatPhone(defaultValue.toString())
        : '00 90 ';

    const [val, setVal] = useState(initialVal);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputVal = e.target.value;

        if (inputVal.startsWith('+')) {
            inputVal = '00' + inputVal.substring(1);
        }

        if (inputVal.replace(/\D/g, '').length < 2) {
            setVal('00 ');
            return;
        }
        setVal(formatPhone(inputVal));
    };

    return (
        <>
            {/* Ekranda Gözüken Formatlı Kutu */}
            <input
                type="text"
                value={val}
                onChange={handleChange}
                className={className}
                placeholder={placeholder || "00 90 5XX XXX XX XX"}
                required={required}
            />
            {/* Arka planda sunucuya giden saf hali */}
            <input
                type="hidden"
                name={name}
                value={val.replace(/\s/g, '')}
            />
        </>
    );
}
