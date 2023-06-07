import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const router = useRouter();
  const validateForm = () => {
    let isValid = true;

    if (!name) {
      setNameError("Please enter your name");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!/^[a-zA-Z\s]*$/.test(name)) {
      setNameError("Name can only contain letters and spaces");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Please enter a password");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!/(?=.*\d)(?=.*[A-Z]).{6,}/.test(password)) {
      setPasswordError(
        "Password must be at least 6 characters long and contain at least one capital letter and one number"
      );
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("----- Form Submitted ------");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    console.log("---- Signup API Response ---");
    console.log(data);
    if (res.ok) {
      // Registration successful
      const { token } = data;
      // Store the token in localStorage or session storage
      localStorage.setItem('token', token); // Alternatively, you can use sessionStorage

      // Redirect to the authenticated area or perform other actions
      // e.g., redirect to the user's dashboard
      router.push('/dashboard');
    } else {
      // Registration failed
      // Handle the error or display an error message
      console.error(data.message);
      setApiResponse(data.message);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-center">
        <div className="card w-50 bg-transparent">
          <div className="card-body">
            <h1 className="card-title p-4">Sign Up</h1>
            <form onSubmit={handleSubmit} className="was-validated">
              {apiResponse && (
                <div className="alert alert-danger" role="alert">
                  {apiResponse}
                </div>
              )}
              <div className="mb-3">
                <input
                  type="text"
                  className={`form-control p-3 fs-5 bg-transparent text-white ${
                    nameError ? "is-invalid" : ""
                  }`}
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {nameError && <div className="invalid-feedback">{nameError}</div>}
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className={`form-control p-3 fs-5 bg-transparent text-white ${
                    emailError ? "is-invalid" : ""
                  }`}
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className={`form-control p-3 fs-5 bg-transparent text-white ${
                    passwordError ? "is-invalid" : ""
                  }`}
                  id="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {passwordError && (
                  <div className="invalid-feedback">{passwordError}</div>
                )}
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className={`form-control p-3 fs-5 bg-transparent text-white ${
                    confirmPasswordError ? "is-invalid" : ""
                  }`}
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPasswordError && (
                  <div className="invalid-feedback">{confirmPasswordError}</div>
                )}
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary p-2 fs-5 w-50" type="submit">
                  Sign Up
                </button>
                <Link className="btn btn-danger p-2 fs-5 w-50" href="/login">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
