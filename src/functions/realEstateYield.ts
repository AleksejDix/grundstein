export function calculateRealEstateYield(price: number, annualIncome: number): number {
    return (annualIncome / price) * 100;
}
