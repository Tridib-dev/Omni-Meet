export function rupeesToPaise(rupees: number): number {
    if (!Number.isFinite(rupees) || rupees < 0) return 0;
    return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
    if (!Number.isFinite(paise) || paise < 0) return 0;
    return paise / 100;
}
