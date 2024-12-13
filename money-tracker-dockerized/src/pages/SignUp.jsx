import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();
  const url = process.env.REACT_APP_LOCAL_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${url}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          lastname,
          cellphone,
          email,
          password
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        sendConfirmationEmail();
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendConfirmationEmail = async () => {
    try {
      const response = await fetch(`${url}/mail/confirmation-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        setCodeSent(true);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmailValidation = async (email, code) => {
    console.log(email, code);

    try {
      const response = await fetch(`${url}/mail/validate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          confirmationCode: code
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        navigate('/login');
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 ">
      <button
        onClick={handleGoBack}
        className="ml-10 self-start bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Go Back
      </button>

      {!codeSent ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center bg-white rounded-lg shadow-lg px-10 py-8 w-1/2 bg-blue-200">
          <h1 className="text-4xl font-bold mb-10 text-gray-800">Sign Up</h1>
          <div className="flex flex-col mb-5 w-full">
            <label className="text-2xl mb-2 text-gray-800">First Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="inputField rounded-md"
            />
          </div>
          <div className="flex flex-col mb-5 w-full">
            <label className="text-2xl mb-2 text-gray-800">Last Name:</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="inputField rounded-md"
            />
          </div>
          <div className="flex flex-col mb-5 w-full">
            <label className="text-2xl mb-2 text-gray-800">Cellphone:</label>
            <input
              type="text"
              value={cellphone}
              onChange={(e) => setCellphone(e.target.value)}
              className="inputField rounded-md"
            />
          </div>
          <div className="flex flex-col mb-5 w-full">
            <label className="text-2xl mb-2 text-gray-800">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inputField rounded-md"
            />
          </div>
          <div className="flex flex-col mb-5 w-full">
            <label className="text-2xl mb-2 text-gray-800">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inputField rounded-md"
            />
          </div>
          <button
            type="submit"
            className="signUpButton w-1/2 mb-5 py-2 rounded-md text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-200">
            Sign Up
          </button>
        </form>
      ) : (
        <>
          <p className="text-2xl font-bold mb-5 mt-2 text-center">
            Please enter the code sent to you email
          </p>
          <label className="text-2xl mb-2 text-gray-800">Confirmation code:</label>
          <input
            type="number"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="inputField rounded-md text-center"
          />
          <button
            type="submit"
            className="w-1/4 mt-5 py-2 rounded-md text-white font-semibold bg-green-600 hover:bg-green-700 transition-all duration-200"
            onClick={() => handleEmailValidation(email, code)}>
            Submit code
          </button>
        </>
      )}
    </div>
  );
};
export default SignUp;
