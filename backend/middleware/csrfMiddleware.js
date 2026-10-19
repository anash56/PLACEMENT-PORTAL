const parseCookie = (req, name) => {
    const raw = req.headers.cookie || "";
    for (const part of raw.split(";")) {
        const index = part.indexOf("=");
        if (index >= 0 && part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
    }
    return null;
};

export const originCheck = (req, res, next) => {
    const configured = process.env.FRONTEND_URL;
    const origin = req.get("origin");
    if (origin && (!configured || origin !== configured.replace(/\/$/, ""))) return res.status(403).json({ message: "Request origin not allowed." });
    return next();
};

export const csrfProtect = (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const cookie = parseCookie(req, "csrf_token");
    const header = req.get("x-csrf-token");
    if (!cookie || !header || cookie.length < 32 || cookie !== header) return res.status(403).json({ message: "CSRF validation failed. Refresh the page and retry." });
    return next();
};
