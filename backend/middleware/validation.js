export const validateProfileUpdate = (req, res, next) => {
    const { cgpa, branch, graduationYear, contactNumber, skills } = req.body;

    if (cgpa !== undefined && cgpa !== null && cgpa !== "") {
        const parsedCgpa = Number(cgpa);
        if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
            return res.status(400).json({ message: "CGPA must be a number between 0 and 10." });
        }
    }

    if (graduationYear !== undefined && graduationYear !== null && graduationYear !== "") {
        const parsedYear = Number(graduationYear);
        if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
            return res.status(400).json({ message: "Please provide a valid graduation year." });
        }
    }

    if (contactNumber !== undefined && contactNumber !== null && contactNumber !== "") {
        const cleanedContact = String(contactNumber).trim();
        if (!/^[0-9]{10}$/.test(cleanedContact)) {
            return res.status(400).json({ message: "Contact number must be exactly 10 digits." });
        }
    }

    if (skills !== undefined && skills !== null) {
        if (!Array.isArray(skills)) {
            return res.status(400).json({ message: "Skills must be an array." });
        }
    }

    next();
};
