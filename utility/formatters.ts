export function formatIndianCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatIndianNumber(amount: number) {
    return new Intl.NumberFormat('en-IN').format(amount);
}

