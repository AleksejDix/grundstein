import Dinero from 'dinero.js'

export function calculateTilgung(kredit: number, zins: number, rate: number ) {
    if(kredit === 0) return 0
    if(rate === 0) return 0
    const DineroKredit = Dinero({ amount: kredit * 100 })
    const DineroRate = Dinero({ amount: rate * 100 })

    const YearlyRate = DineroRate.multiply(12)
    
    const DineroYearlyZins = DineroKredit.percentage(zins) // 500
    const YearlyTilgung =  YearlyRate.subtract(DineroYearlyZins)
    
  
    return YearlyTilgung.multiply(10000).divide(DineroKredit.getAmount()).getAmount() / 100
}


// TODO FIX
export function berechneTilgung(schulden, rate, laufzeit) {
    let tilgung = (rate * 12) / schulden;
    let tilgungsprozentsatz = tilgung / laufzeit * 100;
    return Math.ceil(tilgungsprozentsatz * 100 * 100) / 100;
  }