import { form } from 'framer-motion/client';
import React, { useState, FormEvent } from 'react';

interface AdminSignUpFormData {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
    adminKey: string;
}

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState<AdminSignUpFormData>({
    email: '',
    userName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    adminKey: '',
  });
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { email, userName, firstName, lastName, phoneNumber, password, adminKey } = formData;

    if (!email || !userName || !firstName || !lastName || !phoneNumber || !password || !adminKey) {
        alert('Please fill in all fields');
      return;
    }
    console.log(formData);
    const data = await fetch('/api/auth/signup/admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        });
const response = await data.json();
console.log(response);
    if (!data.ok) {
      alert(response.error);
      return;
    }
    alert('Sign up successful');
  };

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="userName" className="block text-sm font-medium">Username</label>
          <input
            type="text"
            id="userName"
            value={formData.userName}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">Confirm password</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">Admin Key</label>
          <input
            type="password"
            id="adminKey"
            value={formData.adminKey}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div> 

        <button
          type="submit"
          className="w-full py-2 rounded-md"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;