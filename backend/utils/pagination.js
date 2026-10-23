/** Normalize untrusted pagination query parameters into bounded integers. */
export function normalizePagination(queryParams = {}, defaultLimit = 10, maxLimit = 50) {
    const requestedPage = Number(queryParams?.page);
    const requestedLimit = Number(queryParams?.limit);
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const fallbackLimit = Number.isSafeInteger(defaultLimit) && defaultLimit > 0 ? defaultLimit : 10;
    const upperLimit = Number.isSafeInteger(maxLimit) && maxLimit > 0 ? maxLimit : 50;
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, upperLimit)
        : Math.min(fallbackLimit, upperLimit);
    return { page, limit };
}