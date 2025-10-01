"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  CheckIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { signupUser, setAuthToken } from "@/lib/auth";
import GoogleLoginButton from "@/components/GoogleLoginButton";

declare global {
  interface Window {
    google: any;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const passwordRequirements = [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { label: "Contains uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "Contains lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "Contains number", test: (pwd: string) => /\d/.test(pwd) },
    { label: "Contains special character", test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) }
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (!passwordRequirements.every(req => req.test(formData.password))) newErrors.password = "Password does not meet all requirements";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await signupUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        newsletter: formData.newsletter
      });

      setAuthToken(response.token);
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    if (apiError) setApiError(null);
  };

  // ------------------- Google Signup -------------------
  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signup-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    const token = response.credential;
    if (!token) {
      setApiError("Google signup failed: no token received");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) router.push("/dashboard");
      else setApiError(data.error || "Google signup failed");
    } catch (err: any) {
      setApiError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/5 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 30, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{ duration: 35, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="w-full max-w-lg relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Title Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
            whileHover={{ scale: 1.05 }}
          >
            NovaDocs
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Create your account and start editing PDFs instantly
          </p>
        </motion.div>

        {/* Signup Form Card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Glassmorphism Card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-sm"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">

            {/* API Error Message */}
            {apiError && (
              <motion.div
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {apiError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <motion.input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 placeholder-gray-400 ${errors.firstName
                          ? "border-red-300 dark:border-red-600"
                          : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
                        }`}
                      placeholder="John"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  {errors.firstName && (
                    <motion.p
                      className="text-red-500 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.firstName}
                    </motion.p>
                  )}
                </motion.div>

                {/* Last Name */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                >
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <motion.input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 placeholder-gray-400 ${errors.lastName
                          ? "border-red-300 dark:border-red-600"
                          : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
                        }`}
                      placeholder="Doe"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  {errors.lastName && (
                    <motion.p
                      className="text-red-500 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.lastName}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Email Field */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <motion.input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 placeholder-gray-400 ${errors.email
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
                      }`}
                    placeholder="john@example.com"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <motion.input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`w-full pl-12 pr-14 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 placeholder-gray-400 ${errors.password
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
                      }`}
                    placeholder="Create a strong password"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </motion.button>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <motion.div
                    className="mt-3 space-y-2 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    {passwordRequirements.map((req, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center text-sm ${req.test(formData.password)
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-500 dark:text-gray-400"
                          }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CheckIcon
                          className={`w-4 h-4 mr-2 ${req.test(formData.password) ? "text-green-500" : "text-gray-300"
                            }`}
                        />
                        {req.label}
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {errors.password && (
                  <motion.p
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <motion.input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`w-full pl-12 pr-14 py-4 bg-white/50 dark:bg-gray-700/50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 placeholder-gray-400 ${errors.confirmPassword
                        ? "border-red-300 dark:border-red-600"
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? "border-green-300 dark:border-green-600"
                          : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
                      }`}
                    placeholder="Confirm your password"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </motion.button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>

              {/* Sign Up Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 font-semibold text-lg overflow-hidden disabled:opacity-70"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <span className="relative z-10 flex items-center">
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.button>
              <motion.div
                className="relative my-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                </div>
              </motion.div>

              {/* Social Login Buttons */}
              <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {/* Google Login */}
              <GoogleLoginButton />
            </motion.div>
            </form>

            {/* Sign In Link */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
