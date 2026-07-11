import {
    createContext,
    useContext,
    useState
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {

        const storedUser =
            localStorage.getItem("user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;

    });


    const login = (
        newUser
    ) => {

        localStorage.setItem(
            "user",
            JSON.stringify(newUser)
        );

        setUser(newUser);

    };


    const logout = async () => {

        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        }

        localStorage.removeItem("user");

        setUser(null);

    };


    const value = {

        user,

        login,

        logout,

        isAuthenticated: Boolean(user),

        isAdmin:
            user?.role === "admin"

    };


    return (

        <AuthContext.Provider value={value}>

            {children}

        </AuthContext.Provider>

    );

}


export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(

            "useAuth must be used inside AuthProvider"

        );

    }

    return context;

}
