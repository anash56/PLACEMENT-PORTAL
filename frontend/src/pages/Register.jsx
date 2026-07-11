import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";


function Register() {

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            toast.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }


        try {

            setLoading(true);


            await api.post(

                "/auth/register",

                {
                    name,
                    email,
                    password
                }

            );


            toast.success("Registration Successful");


            navigate("/login");

        }

        catch (error) {

            console.log(

                error.response?.data

            );


            toast.error(

                error.response?.data?.message

                ||

                "Registration Failed"

            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <PageContainer
            className="
                flex
                items-center
                justify-center
            "
        >

            <Card
                className="
                    w-full
                    max-w-md
                "
            >

                <div className="mb-6 text-center">

                    <h1
                        className="
                            text-3xl
                            font-bold
                            text-gray-900
                        "
                    >

                        Create Account

                    </h1>


                    <p
                        className="
                            mt-2
                            text-sm
                            text-gray-500
                        "
                    >

                        Register as a student to explore job opportunities

                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    <Input
                        label="Name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />


                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />


                    <Input
                        label="Password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />
                    <p className="text-xs text-gray-500">
                        Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.
                    </p>


                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >

                        {
                            loading
                                ? "Creating Account..."
                                : "Register"
                        }

                    </Button>

                </form>


                <p className="mt-6 text-center text-sm text-gray-500">

                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                        className="font-medium text-blue-600 hover:text-blue-700"
                    >

                        Login

                    </button>

                </p>

            </Card>

        </PageContainer>

    );

}


export default Register;