/**
 * Shared backend deadline rule: expire at 23:59:59.999 Asia/Kolkata
 * on the UTC calendar date stored from the HTML date input.
 */
export function getDeadlineEndAt(deadline) {
    if (!deadline) return null;
    const value = deadline instanceof Date ? deadline : new Date(deadline);
    if (Number.isNaN(value.getTime())) return null;
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 18, 29, 59, 999));
}
export function isDeadlinePassed(deadline, now = new Date()) {
    if (!deadline) return false;
    const end = getDeadlineEndAt(deadline);
    if (!end) return false;
    const current = now instanceof Date ? now.getTime() : new Date(now).getTime();
    return Number.isFinite(current) && current > end.getTime();
}
