import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";

export default function Register() {
    const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
    const [collegeQuery, setCollegeQuery] = useState(""); const [colleges, setColleges] = useState([]); const [collegeId, setCollegeId] = useState("");
    const [idCardBase64, setIdCardBase64] = useState(""); const [idCardName, setIdCardName] = useState(""); const [loading, setLoading] = useState(false); const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (collegeQuery.trim().length < 2) { setColleges([]); return; }
        let active = true;
        const timer = setTimeout(async () => {
            try { setSearching(true); const response = await api.get(`/colleges/search?q=${encodeURIComponent(collegeQuery.trim())}`); if (active) setColleges(response.data.colleges || []); }
            catch { if (active) setColleges([]); }
            finally { if (active) setSearching(false); }
        }, 250);
        return () => { active = false; clearTimeout(timer); };
    }, [collegeQuery]);

    const handleIdCard = event => {
        const file = event.target.files?.[0];
        setIdCardBase64(""); setIdCardName("");
        if (!file) return;
        if (!(["image/jpeg", "image/png", "application/pdf"].includes(file.type)) || file.size > 5 * 1024 * 1024) {
            toast.error("Choose a JPG, PNG, or PDF file up to 5 MB."); event.target.value = ""; return;
        }
        const reader = new FileReader();
        reader.onload = () => { setIdCardBase64(String(reader.result)); setIdCardName(file.name); };
        reader.onerror = () => toast.error("Could not read the selected file.");
        reader.readAsDataURL(file);
    };

    const handleSubmit = async event => {
        event.preventDefault();
        if (!collegeId) return toast.error("Search and select an approved college.");
        if (!idCardBase64) return toast.error("Upload your college ID card.");
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) return toast.error("Password must include uppercase, lowercase, number, special character, and be at least 8 characters.");
        try {
            setLoading(true);
            await api.post("/auth/register", { name, email, password, collegeId, collegeIdCardBase64: idCardBase64 });
            toast.success("Account created. Your college affiliation is pending verification.");
            navigate("/login");
        } catch (error) { toast.error(error.response?.data?.message || "Registration failed."); }
        finally { setLoading(false); }
    };

    return <PageContainer className="flex items-center justify-center">
        <Card className="w-full max-w-xl">
            <div className="mb-6 text-center"><h1 className="text-3xl font-bold text-gray-900">Create Student Account</h1><p className="mt-2 text-sm text-gray-500">Choose an approved college and submit your student ID for verification.</p></div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                <div className="relative">
                    <Input label="Search your approved college" placeholder="Type at least 2 characters, e.g. L.D." value={collegeQuery} onChange={e => { setCollegeQuery(e.target.value); setCollegeId(""); }} autoComplete="off" required />
                    {collegeId && <p className="mt-1 text-sm text-green-700">College selected.</p>}
                    {!collegeId && collegeQuery.trim().length >= 2 && <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                        {searching ? <p className="p-3 text-sm text-gray-500">Searching…</p> : colleges.length ? colleges.map(college => <button key={college._id} type="button" onClick={() => { setCollegeId(college._id); setCollegeQuery(college.name); setColleges([]); }} className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-blue-50">{college.name}</button>) : <p className="p-3 text-sm text-gray-500">No approved college found.</p>}
                    </div>}
                </div>
                <div><label className="mb-2 block text-sm font-medium text-gray-700">College ID card (JPG, PNG, PDF — max 5 MB)</label><input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onChange={handleIdCard} required className="block w-full text-sm" />{idCardName && <p className="mt-1 text-xs text-gray-500">Selected: {idCardName}</p>}</div>
                <p className="text-xs leading-5 text-gray-500">Your account will remain pending until your College Admin verifies your affiliation. The ID card is stored as an authenticated Cloudinary resource.</p>
                <Button type="submit" disabled={loading || !collegeId || !idCardBase64} className="w-full">{loading ? "Creating account…" : "Register"}</Button>
            </form>
            <p className="mt-5 text-center text-sm text-gray-500">College not listed? <button type="button" className="font-medium text-blue-600" onClick={() => navigate("/college-onboarding")}>Request college onboarding</button></p>
            <p className="mt-3 text-center text-sm text-gray-500">Already registered? <button type="button" onClick={() => navigate("/login")} className="font-medium text-blue-600">Login</button></p>
        </Card>
    </PageContainer>;
}
