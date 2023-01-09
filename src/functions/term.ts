import Dinero from 'dinero.js'

// export function calculateTerm(kredit: number, tilgung: number) {
//     if(kredit === 0) return 0
//     const DineroKredit = Dinero({ amount: kredit * 100 })
//     const DineroYearlyTilgung = DineroKredit.percentage(tilgung).divide(12);
//     const months = DineroKredit.divide(DineroYearlyTilgung.getAmount())
//     return months.getAmount();
// }


// export function calculateTerm(kredit: number, zins: number, rate: number) {
//     // Berechne den monatlichen Zins
//     const monthlyRate = zins / 100 / 12;
//     // Berechne das monatliche Annuitätendifferenzial
//     // const monthlyAD = rate / (rate - (monthlyRate * kredit));
//     const monthlyAD = (zins / rate) / (1 - (1 / Math.pow(1 + (zins / rate), loanTerm)));
//     console.log(monthlyAD)
//     // Berechne die Anzahl der Monate, die für die Rückzahlung der Hypothek benötigt werden
//     const loanTerm = (-12 * Math.log(monthlyAD)) / Math.log(1 + monthlyRate);
//     // Gib die Laufzeit der Hypothek in Monaten zurück

//     return Math.ceil(loanTerm);
//   }


// Laufzeit = (-1 / 30) * (ln(1 - (monatlicher Zins * Nettodarlehensbetrag) / monatliche Rate) / ln(1 + monatlicher Zins)) + (1 / 12)

//   export function calculateTerm(principal: number, interestRate: number, monthlyPayment: number): number {
//     // Berechne den monatlichen Zins
//     const monthlyRate = interestRate / 100 / 12;
//     // Berechne die Anzahl der Monate, die für die Rückzahlung der Hypothek benötigt werden
//     const loanTerm = (-1 / 30) * (Math.log(1 - (monthlyRate * principal) / monthlyPayment) / Math.log(1 + monthlyRate)) + (1 / 12);
//     // Gib die Laufzeit der Hypothek in Monaten zurück
//     return loanTerm;
//   }


  export function calculateTerm(kredit: number, zins: number, tilgung: number, rate?: number): number {
    let loopCounter = 0
    let laufzeit = 0;
    let restschuld = kredit;

    let newRate = rate ? rate : (kredit * tilgung) / (12 * (1 - Math.pow(1 + zins/12, -laufzeit)));

    while (restschuld > 0) {
      loopCounter++;
      if (loopCounter > 1200) {
        console.error('Endless loop detected');
        laufzeit = Infinity
        break;
      }

      laufzeit += 1;
      restschuld = restschuld * (1 + zins / 100 / 12) - newRate;
    }
    return laufzeit;
  }
  