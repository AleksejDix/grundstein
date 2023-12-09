// Present value of perpetual annuity (in arrears)
// Present value of perpetual annuity (in advance)

export const calculateRegularPaymentValue = ({ r, z }) => r / z;
export const calculateStartPaymentValue = ({ r, z }) => (r / z) * (1 + z);
