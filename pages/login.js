import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // Redirect to the login page if token is not found
          router.push("/login");
        } else {
          const response = await fetch("/api/auth/check-auth", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (!response.ok) {
            // Redirect to the login page if the token is invalid
            router.push("/login");
          } else {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };
    checkAuthentication();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      "----- From Submitted------\n",
      "\nEmail : ",
      email,
      "\nPassword : ",
      password
    );
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      const { token } = data;
      // Save the token to localStorage or a cookie
      localStorage.setItem("token", token);
      console.log("----Login API Response---\n", data);
      if (res.ok) {
        setApiResponse("Redirecting . . . .");
        console.log("Login Successful...");
        router.push("/dashboard");
      } else {
        setApiResponse(data.message);
      }
    } catch (error) {
      setApiResponse("Server error");
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-center">
        <div className="card w-50 bg-transparent">
          <div className="card-body">
            <h1 className="card-title p-4">Login</h1>
            <form onSubmit={handleSubmit} className="was-validated">
              {apiResponse && (
                <div className="alert alert-danger" role="alert">
                  {apiResponse}
                </div>
              )}
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control p-3 fs-5 bg-transparent text-white"
                  id="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="invalid-feedback">{}</div>
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control p-3 fs-5 bg-transparent text-white"
                  id="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="invalid-feedback">{}</div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary p-2 fs-5 w-50" type="submit">
                  Login
                </button>
                  <Link className="btn btn-danger p-2 fs-5 w-50" href="/signup">Sign Up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
