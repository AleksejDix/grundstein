const percentFormatter = new Intl.NumberFormat('de-DE', { style: 'percent',  signDisplay: "exceptZero", minimumFractionDigits: 2 });

export const formatPercent = (amount: number) => percentFormatter.format(amount)