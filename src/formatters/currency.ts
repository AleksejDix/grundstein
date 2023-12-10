export const currency = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "Eur",
  currencySign: "accounting",
  unitDisplay: "long",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
