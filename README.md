# 🏠 Mortgage Loan Calculator

A comprehensive German mortgage calculator that allows you to analyze different mortgage calculation methods used by banks and plan your loan repayment strategy.

## ✨ Features

### 🏦 **Multiple Calculation Methods**

- **Fixed Interest Rate**: Lock in rates for 10 or 20 years
- **Variable Parameters**: Adjust loan amount, interest rate, term, and monthly payments
- **Smart Locking**: Lock any parameter and let others adjust automatically
- **Real-time Calculations**: All changes update instantly

### 💰 **Sondertilgung (Extra Payments)**

- **Flexible Limits**: Choose from 5%, 10%, 20%, 50%, or unlimited extra payments per year
- **Monthly Planning**: Plan specific extra payments for any month
- **Automatic Validation**: Prevents exceeding annual limits based on German banking regulations
- **Impact Analysis**: See exactly how extra payments reduce your total interest and loan term

### 📊 **Real-time Visualization**

- **Interactive Chart**: Visual representation of your payment schedule with balance, payments, and interest
- **Detailed Table**: Month-by-month breakdown of payments, interest, and remaining balance
- **Savings Calculator**: Shows total money saved through extra payments

### 🔒 **Parameter Locking System**

- Lock any input (loan amount, interest rate, term, etc.)
- Other parameters automatically recalculate when you change unlocked values
- Intelligent dependency management between locked parameters

## 🛠️ Technology Stack

- **Vue 3** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Decimal.js** for precise financial calculations
- **Pinia** for state management

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run all tests (unit + user)
npm test

# Run unit tests only
npm run test:unit

# Run user tests only
npm run test:user
```

## 📈 How It Works

1. **Enter Loan Details**: Set your loan amount, interest rate, and preferred payment structure
2. **Choose Calculation Method**: Select how you want the mortgage calculated (fixed term, fixed payment, etc.)
3. **Plan Extra Payments**: Use the Sondertilgung feature to plan additional payments
4. **Analyze Results**: Review the chart and table to see your complete payment schedule
5. **Compare Scenarios**: Adjust parameters to see how changes affect your total cost

## 🎯 German Banking Compliance

This calculator follows German banking regulations for mortgage calculations and Sondertilgung limits, making it accurate for real-world mortgage planning in Germany.

---

**Built with ❤️ for accurate mortgage calculations**
