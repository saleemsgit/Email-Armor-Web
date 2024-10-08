import { createContext,useContext,useEffect,useState } from "react";
import {createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,} from 'firebase/auth';
import {auth, db} from '../firebase'
import { doc, getDoc, setDoc, updateDoc, getDocs, writeBatch, collection} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [signinError, setSigninError] = useState();
    const [signupError, setSignupError] = useState();
    const navigate = useNavigate();

      const sendUserData = async (userData) => {
          const params = new URLSearchParams(userData).toString();
          try {
              const response = await fetch(`http://127.0.0.1:8000/user_behaviour_predict?${params}`, {
                  method: 'GET',
                  headers: {
                      'Accept': 'application/json'
                  }
              });
              const data = await response.json();
              console.log(data);
          } catch (error) {
              console.error("Error sending user data", error);
          }
      };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return unsubscribe;
    }, []);



    const signIn = async (data) => {
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
        } catch (error) {
            setSigninError(error.message);
            console.log('error', error);
        }
    };
    

    const logOut = () => {
         signOut(auth);
      };


    return (
        <AuthContext.Provider value={{user,  createPatient, createDoctor, signIn, signinError, signupError, logOut}}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    return useContext(AuthContext);
}
export default AuthContextProvider;