import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import { useState } from "react";
import "./AuthPages.css";
import {useNavigate} from "react-router-dom";
import api from "../utils/api";


export default function AuthPages() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    try {
      const response = await api(`/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (!response.ok) throw new Error(data.message || 'Login failed');

      // ✅ Save token and full user object
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage({ type: 'success', text: `Welcome back ${data.user.name}!` });

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.firstName || !form.email || !form.password || !form.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const response = await api(`/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          password: form.password
        }),
      });
      const data = await response.json();
      console.log('Registration response:', data);
      if (!response.ok) throw new Error(data.message || 'Registration failed'); // ← fixed
      setMessage({ type: 'success', text: 'Registration successful! Please login.' });
      setTab('login');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    const response = await api("/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Google login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setMessage({ type: "success", text: `Welcome ${data.user.name}!` });
    setTimeout(() => navigate("/"), 1000);

  } catch (error) {
    setMessage({ type: "error", text: error.message });
  } finally {
    setLoading(false);
  }
};

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setMessage(null);
    setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <>
      <div className="auth-root">
        <div className="auth-left">
          <div className="brand">
            <div className="brand-label">T-SHIRT PAPA FIE</div>
            <div className="brand-name" onClick={() => navigate("/")}>DICES<span>HUB</span></div>
          </div>

          <div className="left-middle">
            <div className="left-quote">
              Wear what <em>speaks</em> for you.
            </div>
            <div className="left-description">
              Premium t-shirts crafted for those who appreciate quality, comfort, and timeless style.
            </div>
          </div>

          <div className="left-bottom">
            <div className="left-features">
              <div className="feature">
                <div className="feature-item"><div className="feature-dot"></div>Free shipping on orders over 210 cedis</div>
                <div className="feature-item"><div className="feature-dot"></div>100% premium cotton fabrics</div>
                <div className="feature-item"><div className="feature-dot"></div>Exclusive member discounts</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-eyebrow">Member Access</div>
              <div className="auth-title">
                {tab === 'login' ? 'Welcome Back!' : 'Create Account'}
              </div>
              <div className="auth-subtitle">
                {tab === 'login'
                  ? 'Sign in to access your orders and preferences.'
                  : "Join us and enjoy exclusive access and member benefits."
                }
              </div>
            </div>

            <div className="auth-tabs">
              <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
              <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Register</button>
            </div>

            <div className="auth-form">
              {message && (
                <div className={message.type === "error" ? "error-message" : "success-message"}>
                  {message.text}
                </div>
              )}

              {tab === 'register' && (
                <div className="form-row">
                  <div className="field">
                    <label>First Name</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter your first name" />
                  </div>
                  <div className="field">
                    <label>Last Name</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter your last name" />
                  </div>
                </div>
              )}

              <div className="field">
                <label>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" />
              </div>

              <div className="field">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" />
              </div>

              {tab === "login" && (
                <div className="forgot-link">
                  <a href="#">Forgot password?</a>
                </div>
              )}

              {tab === 'register' && (
                <div className="field">
                  <label>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
                </div>
              )}

              <button className="submit-btn" onClick={tab === 'login' ? handleLogin : handleRegister} disabled={loading}>
                {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Register'}
              </button>

              <div className="divider">or continue with</div>

              <div className="social-btns">
                <button className="social-btn" onClick={handleGoogleLogin} disabled={loading}>
                  𝐆 Google
                </button>
                <button className="social-btn">𝐅 Facebook</button>
              </div>

              <div className="switch-text">
                {tab === "login" ? (
                  <>
                    Don't have an account?{' '}
                    <button onClick={() => switchTab("register")}>Create one</button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button onClick={() => switchTab("login")}>Sign in</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}