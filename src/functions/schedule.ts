export function generateRepaymentSchedule(
    summe: number,
    zinsen: number,
    tilgung: number
  ): { month: number, Summe: number, payment: number, interest: number, summe: number }[] {
    // Calculate the monthly interest rate

    let monthlyzinsen = (zinsen / 100) / (12 * 100);
    let monthlytilgung = (zinsen / 100) / (12 * 100);
    let rate = summe * (((zinsen + tilgung) / 100) + 1) / 12 / 12
  
    // Calculate the number of payments
    let numPayments = Math.log(rate / (rate - monthlyzinsen * summe)) / Math.log(1 + monthlyzinsen);
  
    console.log(numPayments, monthlytilgung)

    // Initialize the repayment schedule with the first payment
    let schedule: { month: number, Summe: number, payment: number, interest: number, summe: number }[] = [{
      month: 1,
      Summe: summe,
      payment: rate,
      interest: monthlyzinsen * summe,
      summe: rate - monthlyzinsen * summe
    }];
  
    // Generate the rest of the repayment schedule
    for (let i = 2; i <= numPayments; i++) {
      let oldSumme = schedule[i - 2].Summe;
      let interest = monthlyzinsen * oldSumme;
      let summe = rate - interest;
      schedule.push({
        month: i,
        Summe: oldSumme - summe,
        payment: rate,
        interest: interest,
        summe: summe
      });
    }
  
    return schedule;
  }