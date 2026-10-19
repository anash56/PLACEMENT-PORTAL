import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
export default function AcceptInvitation() {
    const [params] = useSearchParams(); const token = params.get("token") || ""; const [name, setName] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false); const navigate = useNavigate();
    const submit = async e => { e.preventDefault(); try { setLoading(true); await api.post("/colleges/invitations/accept", { token, name, password }); toast.success("Administrator account created. Please log in."); navigate("/login"); } catch (error) { toast.error(error.response?.data?.message || "Invitation could not be accepted."); } finally { setLoading(false); } };
    return <PageContainer className="flex justify-center"><Card className="w-full max-w-md"><h1 className="mb-2 text-2xl font-bold">Set up College Admin account</h1><p className="mb-5 text-sm text-gray-500">Invitation links expire after 24 hours and can only be used once.</p>{!token ? <p className="text-red-600">Invitation token is missing. Open the complete link from your email.</p> : <form className="space-y-4" onSubmit={submit}><Input label="Full name" value={name} onChange={e => setName(e.target.value)} required /><Input label="Create password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /><p className="text-xs text-gray-500">At least 8 characters, including uppercase, lowercase, number, and special character.</p><Button className="w-full" disabled={loading}>{loading ? "Creating account…" : "Complete setup"}</Button></form>}</Card></PageContainer>;
}
