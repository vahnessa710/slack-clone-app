import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logoLandscape from "../../assets/logo_landscape.png";
import rose from "../../assets/rose.png";
import { IoMdAddCircle } from "react-icons/io";
import { useAuth } from "../../context/AuthProvider.jsx";

function Login() {  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSignup, setIsSignup] = useState(false); // Toggle signup

  const navigate = useNavigate();
  const { login, signup, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      alert(result.error || "Login failed");
    }
  };

  // const handleAutoLogin = async () => {
  //   try {
  //     const predefinedCredentials = {
  //       user: {
  //         // Wrap in 'user' key
  //         email: "vahnessa.gonzales@gmail.com",
  //         password: "password",
  //       },
  //     };

  //     const response = await axios.post(
  //       `${API_URL}/api/v1/login`,
  //       predefinedCredentials,
  //     );

  //     if (response.data) {
  //       setLoggedUserId(response.data.data.user.id);
  //       onLogin();
  //       navigate("/dashboard");
  //     }
  //   } catch (error) {
  //     console.error("Auto-login error:", error);
  //     alert("Failed to auto-login. Please try again.");
  //   }
  // };

  const handleSignup = async (e) => {
    e.preventDefault();

    const result = await signup(email, password, passwordConfirmation);

    if (result.success) {
      navigate("/dashboard");
    } else {
      alert(result.error || "Signup failed");
    }
  };

  // Add loading state if needed
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={logoLandscape} id="logo-landscape" />

        <h3 id="recent-logins">Recent Logins</h3>
        <p className="recent-logins-description">
          Click your picture or add an account.
        </p>

        <div className="add-something-container">
          <div
            className="add-account-box"
            id="primary-profile"
            // onClick={handleAutoLogin}
          >
            <div className="dp-container">
              <img src={rose} alt="profile" />
            </div>
            <div className="user-name">vahnessa.gonzales</div>
          </div>
          <div className="add-account-box" onClick={() => setIsSignup(true)}>
            <div className="img-box">
              <p className="add-account-icon">
                <IoMdAddCircle />
              </p>
            </div>
            <p className="add-account-caption">Add Account</p>
          </div>
        </div>
      </div>

      <div className="login-box">
        {/* Account Creation Window */}
        {isSignup ? (
          <form onSubmit={handleSignup}>
            <h2 className="create-an-account" data-testid="createAcctHeader">
              Create an Account
            </h2>

            <p className="create-account-description">It's quick and easy.</p>
            <hr />

            <div className="input-group">
              <label>Email</label>
              <input
                className="input-group-signUp"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                className="input-group-signUp"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm password</label>
              <input
                className="input-group-signUp"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </div>

            <button type="submit" className="btn">
              Sign Up
            </button>

            <div className="caption-under-signUp-modal">
              <span>
                Already have an account?
                <span
                  className="toggle-link"
                  onClick={() => setIsSignup(false)}
                >
                  Login here.
                </span>
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                className="input-group-login"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>

            <div className="input-group">
              <input
                className="input-group-login"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn">
              Log In
            </button>

            <p className="forgot-pw toggle-link">Forgot password?</p>

            <hr />

            <div className="new-account-container">
              <p
                className="new-account-btn"
                onClick={() => setIsSignup(true)}
                data-testid="createAcctBtn"
                id="create-account-button"
              >
                Create new account
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
