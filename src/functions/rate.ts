export function calculateRate(kredit: number, zinsen: number, tilgung: number): number {
    return kredit * (((zinsen + tilgung) / 100) + 1) / 12 / 12
}


// const darlehen = 200000; // Darlehen in Euro
// const zins = 0.03; // Zinssatz in Prozent
// const laufzeit = 360; // Laufzeit in Monaten

export function calculateMonthlyRate(darlehen: number, zins: number, laufzeit: number) {
    return ((darlehen * zins) / (1 - Math.pow(1 + zins, -laufzeit)) / 12);
}

// Ratenzahlungen (vorschüssig):
// Wenn man den Zinssatz, die Größe der Rate und die Anzahl der Jahre kennt, kann man den Zahlungsendwert ermitteln. Die Formel lautet dann:
// Kn=R⋅q⋅(qn−1)q−1 (Zahlung zum Jahresanfang)


Wenn man den Zinssatz, den Zahlungsendwert und die Anzahl der Jahre kennt, kann man die Größe der Rate ermitteln. Die Formel lautet dann:

R=Kn⋅(q−1)q(qn−1) (Zahlung zum Jahresanfang)