import Dinero from 'dinero.js'

export function calculateRate(kredit: number, zins: number, tilgung: number ) {
    if(kredit === 0) return 0
    const DineroKredit = Dinero({ amount: kredit * 100 })
    const yearlyAnnu = DineroKredit.percentage(tilgung);
    const yearlyZins = DineroKredit.percentage(zins);
    const yearlyRate = yearlyAnnu.add(yearlyZins)
    return yearlyRate.divide(12).getAmount() / 100
}



// function calculateMonthlyPayment(kredit: number, zins: number, term: number): number {
//     // Berechne den monatlichen Zins
//     const monthlyRate = zins / 100 / 12;
//     // Berechne die monatliche Rate
//     const monthlyPayment = (monthlyRate / (1 - Math.pow(1 + monthlyRate, -term))) * kredit;
//     // Gib die monatliche Rate zurück
//     return monthlyPayment;
//   }