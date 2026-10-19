import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Textarea from "../components/ui/TextArea";

const initial = { name: "", contactPerson: "", contactDesignation: "", contactEmail: "", contactPhone: "", website: "", address: "" };
export default function CollegeOnboarding() {
    const [form, setForm] = useState(initial); const [loading, setLoading] = useState(false); const [done, setDone] = useState(false);
    const set = e => setForm(previous => ({ ...previous, [e.target.name]: e.target.value }));
    const submit = async e => { e.preventDefault(); try { setLoading(true); await api.post("/colleges/requests", form); setDone(true); toast.success("College request submitted."); } catch (error) { toast.error(error.response?.data?.message || "Could not submit request."); } finally { setLoading(false); } };
    return <PageContainer className="flex justify-center"><Card className="w-full max-w-2xl"><h1 className="text-3xl font-bold text-gray-900">College Onboarding Request</h1><p className="mb-6 mt-2 text-sm text-gray-500">Submit institutional contact details for Super Admin verification.</p>{done ? <div className="rounded-lg bg-green-50 p-5 text-green-800"><h2 className="font-semibold">Request received</h2><p className="mt-1 text-sm">The request will remain pending until reviewed. Students cannot select this college before approval.</p><Button className="mt-4" onClick={() => { setForm(initial); setDone(false); }}>Submit another request</Button></div> : <form onSubmit={submit} className="space-y-4">
        <Input label="College name" name="name" value={form.name} onChange={set} required />
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Contact person" name="contactPerson" value={form.contactPerson} onChange={set} required /><Input label="Designation" name="contactDesignation" value={form.contactDesignation} onChange={set} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Official contact email" type="email" name="contactEmail" value={form.contactEmail} onChange={set} required /><Input label="Contact phone" type="tel" name="contactPhone" value={form.contactPhone} onChange={set} required /></div>
        <Input label="Website (optional)" type="url" name="website" placeholder="https://..." value={form.website} onChange={set} />
        <Textarea label="Full address" name="address" value={form.address} onChange={set} rows={3} required />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Submitting…" : "Submit for verification"}</Button>
    </form>}</Card></PageContainer>;
}
