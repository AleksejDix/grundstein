export const compound = ({ pv, z, y }) => pv * (1 + z) ** y;
export const discount = ({ fv, z, y }) => fv / (1 + z) ** y;
export const term = ({ fv, pv, z }) => Math.log(fv / pv) / Math.log(1 + z);
export const interest = ({ pv, fv, y }) => (fv / pv) ** (1 / y) - 1;
