const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function isAllowedProfileFile(file, kind) {
    if (!file || file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return false;
    if (kind === "resume") return file.type === "application/pdf";
    if (kind === "id") return ["image/jpeg", "image/png", "application/pdf"].includes(file.type);
    return false;
}

export function readFileAsDataUri(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Unable to read selected file."));
        reader.readAsDataURL(file);
    });
}
