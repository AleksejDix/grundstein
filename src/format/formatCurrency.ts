const currencyFormater = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export const formatCurrency = (amount: number) => currencyFormater.format(amount)