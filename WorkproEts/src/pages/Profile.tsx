import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getProfileData, updateProfileData } from '../api/admin';
import { format } from 'date-fns';
import { Visibility, VisibilityOff, AccountCircle } from '@mui/icons-material'; // Default user icon
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { ToastContainer } from 'react-toastify';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({}); // Update profile type if necessary
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await getProfileData(userId || "");
        setProfile(response);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle password input change for each field
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    if (field === 'current') {
      setCurrentPassword(value);
    } else if (field === 'new') {
      setNewPassword(value);
    } else if (field === 'confirm') {
      setConfirmPassword(value);
    }
  };

  // Password update handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPassword === newPassword) {
      toast.error("Current password and new password cannot be the same.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password must be the same.");
      return;
    }

    const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordStrengthRegex.test(newPassword)) {
      toast.error("Password must be at least 8 characters long, and include both letters and numbers.");
      return;
    }

    try {
      const userId = sessionStorage.getItem('userId');
      await updateProfileData(userId || "", newPassword);
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error("Failed to update password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Content with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Profile Content */}
        <main className="flex-1 p-6">
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Profile Header */}
                <div className="relative">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 animate-gradient"></div>
                  <div className="relative px-6 -mt-16">
                    <div className="text-center">
                      <img
                        className="mx-auto h-32 w-32 rounded-full border-4 border-white shadow-xl ring-4 ring-blue-500/30 animate__animated animate__fadeIn" // Added fade-in animation
                        src={profile.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=John"}
                        alt={profile.name || "Default User"}
                        onError={(e) => (e.target.src = '/default-avatar.png')} // Use a default avatar on error
                      />
                      <h2 className="mt-4 text-2xl font-bold text-gray-900">{profile.name}</h2>
                      <p className="text-md text-gray-600">{profile.email}</p>
                      <div className="mt-2 flex items-center justify-center space-x-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
                          {profile.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {profile.createdAt ? (
                            <>Joined {format(new Date(profile.createdAt), 'MMMM dd, yyyy')}</>
                          ) : (
                            <>Date not available</>
                          )}
                        </span>
                      </div>
                    </div>
                    <ToastContainer />
                  </div>
                </div>

                {/* Password Form */}
                <div className="mt-6 px-4 sm:px-6 lg:px-8 pb-8">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white px-6 py-8 rounded-lg shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h3>
                      <div className="space-y-4">
                        {/* Current Password */}
                        <div className="relative">
                          <label htmlFor="current" className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="current"
                            id="current"
                            value={profile.password || ''}
                            onChange={(e) => handlePasswordChange(e, 'current')}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-150"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </button>
                        </div>

                        {/* New Password */}
                        <div className="relative">
                          <label htmlFor="new" className="block text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="new"
                            id="new"
                            value={newPassword}
                            onChange={(e) => handlePasswordChange(e, 'new')}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-150"
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirm"
                            id="confirm"
                            value={confirmPassword}
                            onChange={(e) => handlePasswordChange(e, 'confirm')}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-150"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
