import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isRegister) {
        // Registration logic
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username, fullName }),
        });
        if (res.ok) {
          setSuccess("Registration successful! You can now sign in.");
          setIsRegister(false);
          setEmail("");
          setPassword("");
          setUsername("");
          setFullName("");
        } else {
          let data;
          try {
            data = await res.json();
          } catch {
            data = {};
          }
          setError(data?.message || "Registration failed");
        }
      } else {
        // Login logic
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          // Fetch user info to check if admin
          const meRes = await fetch("/api/me", { credentials: "include" });
          if (meRes.ok) {
            const data = await meRes.json();
            if (data.user && data.user.isAdmin) {
              setLocation("/admin");
            } else {
              setLocation("/");
            }
          } else {
            setLocation("/");
          }
        } else {
          setError("Invalid email or password");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender to-mint">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">{isRegister ? "Register" : "Sign In"}</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">{success}</div>}
        {isRegister && (
          <>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required={isRegister}
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required={isRegister}
                autoComplete="name"
              />
            </div>
          </>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Sign In"}
        </Button>
        <div className="text-center">
          <button
            type="button"
            className="text-coral underline mt-2"
            onClick={() => {
              setIsRegister(r => !r);
              setError("");
              setSuccess("");
            }}
          >
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
}