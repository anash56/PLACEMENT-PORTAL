import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import ConfirmationModal from "./ui/ConfirmationModal";

function Navbar() {

    const navigate = useNavigate();

    const { isAuthenticated, user, logout } = useAuth();

    const role = user?.role;

    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);

    const handleLogout = () => {

        setLogoutOpen(true);

    };

    const confirmLogout = () => {

        logout();

        setLogoutOpen(false);

        setMenuOpen(false);

        navigate("/login");

    };

    const closeMenu = () => {

        setMenuOpen(false);

    };

    const linkClasses = ({ isActive }) =>

        `px-3 py-2 rounded-lg transition font-medium ${isActive
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`;

    return (

        <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">

            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

                <div className="flex items-center gap-3">

                    <button
                        className="text-2xl md:hidden"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >

                        ☰

                    </button>

                    <NavLink
                        to={role === "admin" ? "/admin" : "/"}
                        onClick={closeMenu}
                        className="text-2xl font-bold text-blue-600"
                    >

                        Placement Portal

                    </NavLink>

                </div>

                {/* Desktop Menu */}

                <div className="hidden items-center gap-3 md:flex">

                    {

                        !isAuthenticated

                            ?

                            <>

                                <NavLink
                                    to="/"
                                    className={linkClasses}
                                >

                                    Jobs

                                </NavLink>

                                <NavLink
                                    to="/login"
                                    className={linkClasses}
                                >

                                    Login

                                </NavLink>

                                <NavLink
                                    to="/register"
                                    className={linkClasses}
                                >

                                    Register

                                </NavLink>

                            </>

                            :

                            role === "student"

                                ?

                                <>

                                    <NavLink
                                        to="/"
                                        className={linkClasses}
                                    >

                                        Jobs

                                    </NavLink>

                                    <NavLink
                                        to="/my-applications"
                                        className={linkClasses}
                                    >

                                        My Applications

                                    </NavLink>

                                    <NavLink
                                        to="/profile"
                                        className={linkClasses}
                                    >

                                        Profile

                                    </NavLink>

                                    <Button
                                        variant="secondary"
                                        onClick={handleLogout}
                                    >

                                        Logout

                                    </Button>

                                </>

                                :

                                <>

                                    <NavLink
                                        to="/admin"
                                        end
                                        className={linkClasses}
                                    >

                                        Dashboard

                                    </NavLink>

                                    <NavLink
                                        to="/admin/jobs"
                                        end
                                        className={linkClasses}
                                    >

                                        Manage Jobs

                                    </NavLink>

                                    <NavLink
                                        to="/admin/jobs/create"
                                        className={linkClasses}
                                    >

                                        Create Job

                                    </NavLink>

                                    <Button
                                        variant="secondary"
                                        onClick={handleLogout}
                                    >

                                        Logout

                                    </Button>

                                </>

                    }

                </div>

            </div>

            {/* Mobile Menu */}

            {

                menuOpen && (

                    <div className="border-t bg-white md:hidden">

                        <div className="flex flex-col gap-2 p-4">

                            {

                                !isAuthenticated

                                    ?

                                    <>

                                        <NavLink
                                            to="/"
                                            className={linkClasses}
                                            onClick={closeMenu}
                                        >

                                            Jobs

                                        </NavLink>

                                        <NavLink
                                            to="/login"
                                            className={linkClasses}
                                            onClick={closeMenu}
                                        >

                                            Login

                                        </NavLink>

                                        <NavLink
                                            to="/register"
                                            className={linkClasses}
                                            onClick={closeMenu}
                                        >

                                            Register

                                        </NavLink>

                                    </>

                                    :

                                    role === "student"

                                        ?

                                        <>

                                            <NavLink
                                                to="/"
                                                className={linkClasses}
                                                onClick={closeMenu}
                                            >

                                                Jobs

                                            </NavLink>

                                            <NavLink
                                                to="/my-applications"
                                                className={linkClasses}
                                                onClick={closeMenu}
                                            >

                                                My Applications

                                            </NavLink>

                                            <NavLink
                                                to="/profile"
                                                className={linkClasses}
                                                onClick={closeMenu}
                                            >

                                                Profile

                                            </NavLink>

                                            <Button
                                                variant="secondary"
                                                className="w-full"
                                                onClick={handleLogout}
                                            >

                                                Logout

                                            </Button>

                                        </>

                                        :

                                        <>

                                            <NavLink
                                                to="/admin"
                                                end
                                                className={linkClasses}
                                                onClick={closeMenu}
                                            >

                                                Dashboard

                                            </NavLink>

                                            <NavLink
                                                to="/admin/jobs"
                                                end
                                                className={linkClasses}
                                                onClick={closeMenu}
                                            >

                                                Manage Jobs

                                            </NavLink>

                                            <NavLink
                                                to="/admin/jobs/create"
                                                className={linkClasses}
                                                onClick={closeMenu}
                                            >

                                                Create Job

                                            </NavLink>

                                            <Button
                                                variant="secondary"
                                                className="w-full"
                                                onClick={handleLogout}
                                            >

                                                Logout

                                            </Button>

                                        </>

                            }

                        </div>

                    </div>

                )

            }

            <ConfirmationModal

                open={logoutOpen}

                title="Logout"

                message="Are you sure you want to logout?"

                onCancel={() => setLogoutOpen(false)}

                onConfirm={confirmLogout}

                confirmText="Logout"

                confirmVariant="danger"

            />

        </nav>

    );

}

export default Navbar;