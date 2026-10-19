import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import ConfirmationModal from "./ui/ConfirmationModal";
export default function Navbar() {
    const navigate = useNavigate(); const { isAuthenticated, user, logout } = useAuth(); const role = user?.role;
    const [menuOpen, setMenuOpen] = useState(false); const [logoutOpen, setLogoutOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);
    const home = role === "super_admin" ? "/super-admin" : role === "college_admin" ? "/admin" : "/";
    const linkClasses = ({ isActive }) => `px-3 py-2 rounded-lg transition font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`;
    const studentLinks = <><NavLink to="/" className={linkClasses} onClick={closeMenu}>Jobs</NavLink><NavLink to="/my-applications" className={linkClasses} onClick={closeMenu}>My Applications</NavLink><NavLink to="/profile" className={linkClasses} onClick={closeMenu}>Profile</NavLink></>;
    const adminLinks = role === "super_admin" ? <NavLink to="/super-admin" className={linkClasses} onClick={closeMenu}>College Management</NavLink> : <><NavLink to="/admin" end className={linkClasses} onClick={closeMenu}>Dashboard</NavLink><NavLink to="/admin/jobs" className={linkClasses} onClick={closeMenu}>Manage Jobs</NavLink><NavLink to="/admin/students/verification" className={linkClasses} onClick={closeMenu}>Verify Students</NavLink><NavLink to="/admin/jobs/create" className={linkClasses} onClick={closeMenu}>Create Job</NavLink></>;
    const links = !isAuthenticated ? <><NavLink to="/" className={linkClasses} onClick={closeMenu}>Jobs</NavLink><NavLink to="/college-onboarding" className={linkClasses} onClick={closeMenu}>For Colleges</NavLink><NavLink to="/login" className={linkClasses} onClick={closeMenu}>Login</NavLink><NavLink to="/register" className={linkClasses} onClick={closeMenu}>Register</NavLink></> : role === "student" ? studentLinks : adminLinks;
    const doLogout = async () => { await logout(); setLogoutOpen(false); closeMenu(); navigate("/login"); };
    return <><nav className="sticky top-0 z-50 border-b bg-white shadow-sm"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div className="flex items-center gap-3"><button className="text-2xl md:hidden" onClick={() => setMenuOpen(value => !value)} aria-label="Toggle navigation">☰</button><NavLink to={home} onClick={closeMenu} className="text-2xl font-bold text-blue-600">Placement Portal</NavLink></div><div className="hidden items-center gap-3 md:flex">{links}{isAuthenticated && <Button variant="secondary" onClick={() => setLogoutOpen(true)}>Logout</Button>}</div></div>{menuOpen && <div className="border-t bg-white md:hidden"><div className="flex flex-col gap-2 p-4">{links}{isAuthenticated && <Button variant="secondary" className="w-full" onClick={() => setLogoutOpen(true)}>Logout</Button>}</div></div>}</nav><ConfirmationModal open={logoutOpen} title="Logout" message="Are you sure you want to logout?" onCancel={() => setLogoutOpen(false)} onConfirm={doLogout} confirmText="Logout" confirmVariant="danger" /></>;
}
