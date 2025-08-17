import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const DeleteAccountPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle the account deletion API call
  const handleDelete = async () => {
    // Double-check that a user is logged in

    // Use a browser confirmation dialog to prevent accidental deletion
    if (
      !window.confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Your backend expects form data, so we create it here
    const formData = new URLSearchParams();
    formData.append("email", auth.userEmail);

    try {
      const response = await fetch("http://127.0.0.1:8000/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to delete account. Please try again."
        );
      }

      alert("Account deleted successfully.");
      auth.logout(); // Log the user out
      navigate("/"); // Redirect to the homepage
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-500">Delete Account</h1>
          <p className="text-slate-400 mt-2">This is a permanent action.</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl shadow-lg text-center">
          <p className="text-slate-300 mb-6">
            Are you sure you want to delete your account? All of your data,
            including saved resumes and career paths, will be permanently
            removed. This cannot be undone.
          </p>

          {error && (
            <p className="text-red-400 bg-red-900/20 p-3 rounded-lg mb-4">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="w-full text-center font-bold text-white py-3 px-5 rounded-full transition-all duration-300 ease-in-out bg-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Yes, Delete My Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
