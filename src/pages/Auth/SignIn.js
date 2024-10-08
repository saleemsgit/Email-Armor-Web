import {React ,useState}from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth,db } from '../../firebase';
import { doc } from 'firebase/firestore';

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const user_ID = user.uid;
      const userRef = doc(db, 'users', user_ID);
      navigate('/home');

    }
    catch{
      console.log("Error signing in")
    }

  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-primary-100 to-secondary-100">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          {/* <img src="path/to/your/logo.png" alt="Logo" className="h-8" /> */}
          <h1 className="text-2xl font-bold text-white ml-2">Mail Armor</h1>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-white hidden md:block">Don't have an account?</p>
          <button
            onClick={() => {
              navigate('/signup');
            }}
            className="bg-primary-100 text-white font-semibold py-2 px-4 rounded-full hover:bg-primary-100 transition duration-300"
          >
            Sign Up
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8 text-center">Let's go!</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="abc@example.com"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-primary-100 hover:bg-primary-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
            <div className="text-center mt-4">
              <button className="text-primary-100 hover:text-primary-200">
                or signin with Google
              </button>
            </div>
          </form>
          <p className="text-center text-gray-500 text-xs mt-8">
            By clicking the button above, you agree to our{' '}
            <a
              href="/terms-of-service"
              className="text-primary-100 hover:text-primary-200"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy-policy"
              className="text-primary-100 hover:text-primary-200"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
