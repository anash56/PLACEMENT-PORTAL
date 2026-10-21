import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import ConfirmationModal from "./ui/ConfirmationModal";

function Brand({ to = "/" }) {
  return <NavLink to={to} className="brand-lockup" aria-label="Placement Portal home"><span className="brand-symbol">P</span><span className="brand-wordmark">Placement<span>Portal</span><small>CAMPUS TO CAREER</small></span></NavLink>;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const role = user?.role;
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const home = role === "super_admin" ? "/super-admin" : role === "college_admin" ? "/admin" : isAuthenticated ? "/jobs" : "/";
  const linkClasses = ({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`;
  const publicLinks = <><NavLink to="/jobs" className={linkClasses} onClick={closeMenu}>Find opportunities</NavLink><NavLink to="/college-onboarding" className={linkClasses} onClick={closeMenu}>For colleges</NavLink></>;
  const studentLinks = <><NavLink to="/jobs" className={linkClasses} onClick={closeMenu}>Find opportunities</NavLink><NavLink to="/my-applications" className={linkClasses} onClick={closeMenu}>My applications</NavLink><NavLink to="/profile" className={linkClasses} onClick={closeMenu}>My profile</NavLink></>;
  const adminLinks = role === "super_admin" ? <NavLink to="/super-admin" className={linkClasses} onClick={closeMenu}>College management</NavLink> : <><NavLink to="/admin" end className={linkClasses} onClick={closeMenu}>Overview</NavLink><NavLink to="/admin/jobs" className={linkClasses} onClick={closeMenu}>Manage jobs</NavLink><NavLink to="/admin/students/verification" className={linkClasses} onClick={closeMenu}>Student verification</NavLink></>;
  const links = !isAuthenticated ? publicLinks : role === "student" ? studentLinks : adminLinks;

  const doLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      setLogoutOpen(false);
      closeMenu();
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return <>
    <nav className="public-navbar sticky top-0 z-50 border-b bg-white">
      <div className="navbar-inner mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-10">
        <Brand to={home} />
        <div className="hidden items-center gap-1 md:flex">{links}</div>
        <div className="hidden items-center gap-2 md:flex">
          {!isAuthenticated ? <><NavLink to="/login" className="nav-login">Sign in</NavLink><NavLink to="/register" className="nav-get-started">Get started <span aria-hidden="true">↗</span></NavLink></> : <><span className="nav-user-chip" title={user?.email}><span className="nav-user-avatar">{(user?.name || "U").trim().charAt(0).toUpperCase()}</span><span className="nav-user-name">{user?.name?.split(" ")[0] || "Account"}</span></span><Button variant="secondary" onClick={() => setLogoutOpen(true)}>Sign out</Button></>}
        </div>
        <button className="navbar-menu-button md:hidden" type="button" onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>{menuOpen ? "×" : "☰"}</button>
      </div>
      {menuOpen && <div className="navbar-mobile md:hidden"><div className="flex flex-col gap-1 px-5 pb-5 pt-2 sm:px-8">{links}{!isAuthenticated ? <><NavLink to="/login" className="nav-mobile-action" onClick={closeMenu}>Sign in</NavLink><NavLink to="/register" className="nav-mobile-primary" onClick={closeMenu}>Create student account <span>↗</span></NavLink></> : <Button variant="secondary" className="mt-2 w-full" onClick={() => setLogoutOpen(true)}>Sign out</Button>}</div></div>}
    </nav>
    <ConfirmationModal
      open={logoutOpen}
      title="Sign out?"
      message="Are you sure you want to sign out of Placement Portal?"
      onCancel={() => { if (!loggingOut) setLogoutOpen(false); }}
      onConfirm={doLogout}
      loading={loggingOut}
      confirmText="Sign out"
      confirmVariant="secondary"
    />
  </>;
}
