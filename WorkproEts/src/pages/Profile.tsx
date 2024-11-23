import React from "react";
import Navbar from "../components/Navbar"; // Adjust the path as per your project structure
import Sidebar from "../components/Sidebar"; // Adjust the path as per your project structure

const Profile = () => {
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
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Profile</h1>
            <p className="text-gray-600">
              This is your profile page. Customize it as needed!
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
