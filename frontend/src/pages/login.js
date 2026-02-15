import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseURL } from "../constants/baseUrl";
import { Link } from "react-router-dom";
import '../css/signup.css'
import { useQueryClient } from "@tanstack/react-query";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const queryClient = useQueryClient()

  const { mutate: login, isPending, isError, error } = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Logged in Successfully");
      queryClient.invalidateQueries({
                queryKey:["authUser"]
            }) 
    },
    onError: (err) => {
      toast.error(err.message); // This will show the error as a popup
    }
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with:", formData); // Debugging line
    login(formData);
  };

  return (
    <div className="signupPage-page">
    <div className="signupPage-wrapper">
      
      {/* LEFT COLUMN: Branding (Same as Signup) */}
      <div className="signupPage-branding">
        <div className="branding-content">
          <h1 className="hero-text-white">Swap Talent.</h1>
          <h1 className="hero-text-green">Grow Together.</h1>
          <p className="hero-description">
            Join a community where talents are shared, not sold. Whether you’re teaching, 
            learning, or simply exploring, every swap helps you grow, connect, and 
            discover new possibilities together.
          </p>
          <div className="illustration-container">
            <img src="/images/signup-pg.png" alt="Barter Connection Illustration" />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form (Using Signup Classes) */}
      <div className="signupPage-form-container">
        <div className="form-content-box">
          <div className="form-header">
            <h2 className="form-title">Log in your profile</h2>
            <p className="form-subtitle">Welcome back! Continue your skill swapping journey.</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                placeholder="abcd@gmail.com"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="***************"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Error message aligned with the form style */}
            {isError && (
              <p className="form-error-text">{error.message}</p>
            )}

            <button type="submit" className="submit-auth-btn" disabled={isPending}>
              {isPending ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? 
            <Link to="/signup" className="auth-link"> Sign Up</Link>
          </p>
        </div>
      </div>

    </div>
  </div>
  );
}

export default Login;