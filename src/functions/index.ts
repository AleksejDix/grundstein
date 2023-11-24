
export function createPaymentSchedule(
  principal,
  interestRate,
  monthlyPayment,
  extraPayments = [],
  paymentsMade = 0,
  balance = principal,
  schedule = [],
  interestPaidTotal = 0,
  principalPaidTotal = 0
) {
  let loopCounter = 0;
  // Berechne die monatliche Rate
  const monthlyRate = interestRate / 100 / 12;

  // Schleife, bis das Endguthaben kleiner als die monatliche Zahlung ist
  while (balance > monthlyPayment) {
    loopCounter++;
    if (loopCounter > 1200) {
      console.error("Endless loop detected");
      break;
    }

    // Erhöhe die Anzahl der gemachten Zahlungen um 1
    paymentsMade++;
    // Berechne die Zinsen für diesen Monat
    const interest = balance * monthlyRate;
    // Berechne die Tilgung für diesen Monat
    let principalPaid = monthlyPayment - interest;
    // Überprüfe, ob in diesem Monat eine Sondertilgung geleistet wird
    if (extraPayments[paymentsMade]) {
      principalPaid += extraPayments[paymentsMade];
    }
    // Verringere die Restschuld um die Tilgung
    balance -= principalPaid;
    // Erhöhe den Gesamtzinsen um die Zinsen dieses Monats
    interestPaidTotal += interest;
    // Erhöhe den Gesamtzinsen um die Zinsen dieses Monats
    principalPaidTotal += principalPaid;
    // Erstelle ein Objekt für den Eintrag im Tilgungsplan
    const entry = {
      paymentNumber: paymentsMade,
      principalPaid,
      interestPaid: interest,
      interestPaidTotal,
      principalPaidTotal,
      rate: principalPaid + interest,
      balance,
    };
    // Füge den Eintrag dem Tilgungsplan hinzu
    schedule.push(entry);
  }

  // Erstelle ein Objekt für den letzten Eintrag im Tilgungsplan
  const lastEntry = {
    paymentNumber: paymentsMade + 1,
    principalPaid: balance,
    interestPaid: 0,
    interestPaidTotal,
    principalPaidTotal,
    balance: 0,
  };
  // Füge den letzten Eintrag dem Tilgungsplan hinzu
  schedule.push(lastEntry);
  // Gib den Tilgungsplan zurück
  return schedule;
}
