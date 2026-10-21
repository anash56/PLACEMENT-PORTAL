import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import ConfirmationModal from "./ui/ConfirmationModal";

function Brand({ to = "/" }) {
  return (
    <NavLink to={to} className="brand-lockup" aria-label="Placement Portal home">
      <span className="brand-symbol" aria-hidden="true">P</span>
      <span className="brand-wordmark">
        Placement<span>Portal</span>
        <small>CAMPUS TO CAREER</small>
      </span>
    </NavLink>
  );
}

function LogoutIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return open ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const role = user?.role;
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const home = role === "super_admin"
    ? "/super-admin"
    : role === "college_admin"
      ? "/admin"
      : isAuthenticated
        ? "/jobs"
        : "/";

  const linkClasses = ({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`;
  const publicLinks = <>
    <NavLink to="/jobs" className={linkClasses} onClick={closeMenu}>Find opportunities</NavLink>
    <NavLink to="/college-onboarding" className={linkClasses} onClick={closeMenu}>For colleges</NavLink>
  </>;
  const studentLinks = <>
    <NavLink to="/jobs" className={linkClasses} onClick={closeMenu}>Find opportunities</NavLink>
    <NavLink to="/my-applications" className={linkClasses} onClick={closeMenu}>My applications</NavLink>
    <NavLink to="/profile" className={linkClasses} onClick={closeMenu}>My profile</NavLink>
  </>;
  const adminLinks = role === "super_admin" ? <>
    <NavLink to="/super-admin" end className={linkClasses} onClick={closeMenu}>College management</NavLink>
  </> : <>
    <NavLink to="/admin" end className={linkClasses} onClick={closeMenu}>Overview</NavLink>
    <NavLink to="/admin/jobs" className={linkClasses} onClick={closeMenu}>Manage jobs</NavLink>
    <NavLink to="/admin/students/verification" className={linkClasses} onClick={closeMenu}>Student verification</NavLink>
  </>;
  const links = !isAuthenticated ? publicLinks : role === "student" ? studentLinks : adminLinks;
  const accountRole = role === "super_admin" ? "Platform administrator" : role === "college_admin" ? "College administrator" : role === "student" ? "Student workspace" : "Portal account";
  const displayName = user?.name?.trim().split(/\s+/)[0] || (role === "super_admin" ? "Platform" : role === "college_admin" ? "College" : "Student");

  const openLogout = () => {
    closeMenu();
    setLogoutOpen(true);
  };

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
    <nav className="public-navbar sticky top-0 z-50 border-b bg-white" aria-label="Main navigation">
      <div className="navbar-inner">
        <Brand to={home} />

        <div className="navbar-desktop-links" aria-label="Primary">
          {links}
        </div>

        <div className="navbar-desktop-actions">
          {!isAuthenticated ? <>
            <NavLink to="/login" className="nav-login">Sign in</NavLink>
            <NavLink to="/register" className="nav-get-started">Get started <span aria-hidden="true">↗</span></NavLink>
          </> : <>
            <span className="nav-user-chip" title={user?.email || displayName}>
              <span className="nav-user-avatar">{displayName.charAt(0).toUpperCase()}</span>
              <span className="nav-user-name">{displayName}</span>
            </span>
            <Button variant="primary" className="navbar-signout-button" onClick={openLogout}>
              <LogoutIcon />
              Sign out
            </Button>
          </>}
        </div>

        <button
          className="navbar-menu-button"
          type="button"
          onClick={() => setMenuOpen(value => !value)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="portal-mobile-menu"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen && <div className="navbar-mobile" id="portal-mobile-menu">
        {isAuthenticated && <div className="navbar-mobile-account">
          <span className="nav-user-avatar navbar-mobile-avatar">{displayName.charAt(0).toUpperCase()}</span>
          <span className="navbar-mobile-account-copy">
            <strong>{user?.name || displayName}</strong>
            <small>{accountRole}{user?.collegeName ? ` · ${user.collegeName}` : ""}</small>
          </span>
        </div>}
        <div className="navbar-mobile-content">
          <div className="navbar-mobile-links">{links}</div>
          {!isAuthenticated ? <div className="navbar-mobile-auth-actions">
            <NavLink to="/login" className="nav-mobile-action" onClick={closeMenu}>Sign in</NavLink>
            <NavLink to="/register" className="nav-mobile-primary" onClick={closeMenu}>Create student account <span aria-hidden="true">↗</span></NavLink>
          </div> : <Button variant="primary" className="navbar-mobile-signout" onClick={openLogout}>
            <LogoutIcon />
            Sign out
          </Button>}
        </div>
      </div>}
    </nav>

    <ConfirmationModal
      open={logoutOpen}
      title="Sign out?"
      message="Are you sure you want to sign out of Placement Portal?"
      onCancel={() => { if (!loggingOut) setLogoutOpen(false); }}
      onConfirm={doLogout}
      loading={loggingOut}
      confirmText="Sign out"
      confirmVariant="primary"
    />
  </>;
}
