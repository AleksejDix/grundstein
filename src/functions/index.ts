export function createPaymentSchedule(
    principal, 
    interestRate, 
    monthlyPayment, 
    extraPayments = {}, 
    paymentsMade = 0, 
    balance = principal, 
    schedule = [],
    date = new Date(2021, 6, 1),
    interestPaidTotal = 0
    ) {
    // Berechne die monatliche Rate
    const monthlyRate = interestRate / 100 / 12;
  
    // Wenn das Endguthaben kleiner als die monatliche Zahlung ist, gib den Tilgungsplan zurück
    if (balance <= monthlyPayment) {
      // Erstelle ein Objekt für den letzten Eintrag im Tilgungsplan
      const lastEntry = {
        paymentNumber: paymentsMade + 1,
        principalPaid: balance,
        interestPaid: 0,
        interestPaidTotal,
        balance: 0
      };
      // Füge den letzten Eintrag dem Tilgungsplan hinzu
      schedule.push(lastEntry);
      return schedule;
    }
    
    // 
    const newDate = new Date(date.getTime());
    const month = newDate.getMonth()
   
    const nextMonth = month + 1
    newDate.setMonth(nextMonth)
    

    
    // Berechne die Zinsen für diesen Monat
    const interest = balance * monthlyRate;
    // Berechne die Tilgung für diesen Monat
    let principalPaid = monthlyPayment - interest;

    
    // Erhöhe die Anzahl der gemachten Zahlungen um 1
    const newPaymentsMade = paymentsMade + 1;


    // wir nehmen alles was 
    // if(newPaymentsMade < 25) {
        // extraPayments[newPaymentsMade] = extraPayments[newPaymentsMade] ? extraPayments[newPaymentsMade] + newGewinn : 0 + newGewinn
    // }


    
    // Überprüfe, ob in diesem Monat eine Sondertilgung geleistet wird
    if (extraPayments[newPaymentsMade]) {
      principalPaid += extraPayments[newPaymentsMade];
    } 
    // Verringere die Restschuld um die Tilgung
    const newBalance = balance - principalPaid;

    const newInterestPaidTotal = interestPaidTotal + interest

  
    
    // Erstelle ein Objekt für den Eintrag im Tilgungsplan
    const entry = {
      paymentNumber: newPaymentsMade,
      principalPaid,
      interestPaid: interest,
      interestPaidTotal: newInterestPaidTotal,
      rate: principalPaid + interest,
      balance: newBalance,
      date: newDate,
    };
    // Füge den Eintrag dem Tilgungsplan hinzu
    schedule.push(entry);
  
    // Rufe die Funktion rekursiv auf und übergebe das neue Endguthaben, die neue Anzahl der gemachten Zahlungen und den aktualisierten Tilgungsplan
    return createPaymentSchedule(principal, interestRate, monthlyPayment, extraPayments, newPaymentsMade, newBalance, schedule, newDate, newInterestPaidTotal);
  }



  