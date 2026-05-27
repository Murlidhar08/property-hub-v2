export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    }).format(value);
};

export function rupeeToWords(amount: number): string {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    function convert_less_than_thousand(n: number): string {
        let res = '';
        if (n >= 100) {
            res += ones[Math.floor(n / 100)] + ' hundred ';
            n %= 100;
        }
        if (n >= 10 && n <= 19) {
            res += teens[n - 10] + ' ';
        } else if (n >= 20) {
            res += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0 && n < 10) {
            res += ones[n] + ' ';
        }
        return res;
    }

    if (amount === 0) return 'zero';

    let res = '';
    const crore = Math.floor(amount / 10000000);
    amount %= 10000000;
    if (crore > 0) {
        res += convert_less_than_thousand(crore) + 'crore ';
    }

    const lakh = Math.floor(amount / 100000);
    amount %= 100000;
    if (lakh > 0) {
        res += convert_less_than_thousand(lakh) + 'lakh ';
    }

    const thousand = Math.floor(amount / 1000);
    amount %= 1000;
    if (thousand > 0) {
        res += convert_less_than_thousand(thousand) + 'thousand ';
    }

    if (amount > 0) {
        res += convert_less_than_thousand(amount);
    }

    return res.trim();
}