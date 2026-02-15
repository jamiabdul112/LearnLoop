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
    <div className="signup-page">
      <div className="signup-wrapper">
        <div className="signup-frst-page">
          <div className="signup-frst-wrapper">
            <div className="signup-frst-page-content">
              <div className="left-signup-content">
                <h2 className="white-h2">Swap Talent.</h2>
                <h2 className="green-h2">Grow Together.</h2>
                <p className="signup-p-1">Join a community where talents are shared, not sold. Whether you’re teaching, learning, or simply exploring, every swap helps you grow, connect, and discover new possibilities together.</p>
                <img src="/images/signup-pg.png" alt="Login Illustration" />
              </div>
              
              <div className="right-signup-content">
                <div className="signup-email">
                  <h3 className="signup-email-h3">Log in your profile</h3>
                  <p className="signup-email-p">Join our community and start swapping</p>
                  
                  <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <button type="submit" disabled={isPending}>
                      {isPending ? "Processing..." : "Log In"}
                    </button>
                  </form>

                  {/* Visual error feedback */}
                  {isError && <p style={{ color: "red", fontSize: "0.8rem", marginTop: "10px" }}>{error.message}</p>}

                  <p className="signup-email-p2">
                    Don't have an account?<Link to="/signup" style={{textDecoration:"none"}}><span className="sign-in-shortcut" style={{cursor: 'pointer'}}>Sign Up</span></Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;