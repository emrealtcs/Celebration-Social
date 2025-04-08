import {
  createContext,
  PropsWithChildren,
  useState,
  useContext,
  useEffect,
} from "react";
import { auth, db } from "./_Config";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updatePassword as firebaseUpdatePassword,
} from "firebase/auth";
import { ref, set } from "firebase/database";

import { User } from "./_Model";

const initialState = {
  isLoggedIn: undefined,
  signIn: async () => {},
  signOut: async () => {},
  register: async () => {},
  updatePassword: async () => {},
};

type AuthContextType = {
  isLoggedIn: boolean | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (user: User, password: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(initialState);

interface Props extends PropsWithChildren {}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const register = async (user: User, password: string) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        user.email,
        password
      );

      if (response.user) {
        await set(ref(db, `/users/${response.user.uid}`), user);
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (auth.currentUser) {
        await firebaseUpdatePassword(auth.currentUser, newPassword);
      } else {
        throw new Error("No user is logged in.");
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, signIn, signOut, register, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;

export const useAuth = () => {
  //called by login, signup (register)
  const context = useContext(AuthContext); //used to stay logged in ?

  if (!context) {
    throw new Error("useAuth must be accessible within the AuthProvider");
  }

  return context;
};
