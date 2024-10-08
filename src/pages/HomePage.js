import React, { useState ,useEffect} from 'react';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import { Outlet } from 'react-router-dom';
import ComposeMail from '../components/ComposeMail';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [showComposeMail, setShowComposeMail] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
      } else {
        setUser(user);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleComposeClick = () => {
    setShowComposeMail(true);
  }; 

  const handleLogout = async () =>{
    try{
      await auth.signOut();
      navigate('/');
    }
    catch{
      console.log("Error signing out")
    }
  }



  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex flex-grow overflow-hidden">
        <SideBar onComposeClick={handleComposeClick} onLogoutClick={handleLogout} />
        <div className="flex-grow overflow-clip">
          <Outlet />
        </div>
      </div>
      {showComposeMail && <ComposeMail />}
    </div>

    // <div className="h-screen flex flex-col">
    //   <Header />
    //   <div className="flex flex-grow">
    //     <SideBar onComposeClick={handleComposeClick} />
    //     <Outlet />
    //   </div>
    //   {showComposeMail && <ComposeMail />}
    // </div>

    // <div className="h-screen flex flex-col">
    //   <Header />
    //   <div className="flex flex-1">
    //     <SideBar onComposeClick={handleComposeClick} />
    //     <main className="flex-1 p-4">
    //       <Outlet />
    //     </main>
    //   </div>
    //   {showComposeMail && <ComposeMail />}
    // </div>

    // <div className="flex h-screen">
    //   <SideBar onComposeClick={handleComposeClick} />
    //   <div className="flex flex-col flex-grow">
    //     <Header />
    //     <Outlet />
    //   </div>
    // </div>
  );
}

export default HomePage;
