import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";

import { useAuth } from "../context/AuthContext";


function Login() {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();


    // Get login function from AuthContext

    const { login } = useAuth();


    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            setLoading(true);


            const res = await api.post(

                "/auth/login",

                {

                    email,

                    password

                }

            );


            // Create user object
            const loggedInUser = {
                name: res.data.name,
                email: res.data.email,
                role: res.data.role,
                token: res.data.token
            };

            // Save user info and token to state and localStorage
            login(loggedInUser);


            toast.success("Login Successful");


            // Redirect based on role

            if (res.data.role === "admin") {

                navigate("/admin");

            } else {

                navigate("/");

            }

        }

        catch (error) {

            console.log(

                error.response?.data

            );


            toast.error(

                error.response?.data?.message

                ||

                "Login Failed"

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

                        Welcome Back

                    </h1>


                    <p
                        className="
                            mt-2
                            text-sm
                            text-gray-500
                        "
                    >

                        Login to continue to Placement Portal

                    </p>

                </div>


                <form

                    onSubmit={handleSubmit}

                    className="space-y-4"

                >

                    <Input

                        label="Email"

                        type="email"

                        placeholder="Enter your email"

                        value={email}

                        onChange={(e) =>

                            setEmail(

                                e.target.value

                            )

                        }

                        required

                    />


                    <Input

                        label="Password"

                        type="password"

                        placeholder="Enter your password"

                        value={password}

                        onChange={(e) =>

                            setPassword(

                                e.target.value

                            )

                        }

                        required

                    />


                    <Button

                        type="submit"

                        disabled={loading}

                        className="w-full"

                    >

                        {

                            loading

                                ?

                                "Logging in..."

                                :

                                "Login"

                        }

                    </Button>

                </form>

            </Card>

        </PageContainer>

    );

}


export default Login;