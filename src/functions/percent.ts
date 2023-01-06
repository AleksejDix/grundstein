export function calculateDifferenceInPercent(numbers: number[]): { number: number, difference: number }[] {
    return numbers.map((number, index) => {
        if (index === 0) {
        return { number, difference: 0 };
        }
        return { number, difference: (number - numbers[index - 1]) / numbers[index - 1] * 100 };
    });
}