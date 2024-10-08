import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Inbox from "./components/Inbox";
import SentBox from "./components/SentBox";
import Trash from "./components/Trash";
import Draft from "./components/Draft";
import SignUp from "./pages/Auth/SignUp";
import SignIn from "./pages/Auth/SignIn";
import WebPage from "./pages/WebPage";
import Quarantined from "./components/Quarantined";
import Spam from "./components/Spam";
import FetchMails from "./components/FetchMails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WebPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<HomePage />}>
          <Route index element={<Inbox />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="sent" element={<SentBox />} />
          <Route path="trash" element={<Trash />} />
          <Route path="draft" element={<Draft />} />
          <Route path="quarantined" element={<Quarantined />} />
          <Route path="spam" element={<Spam />} />
          <Route path="fetchmails" element={<FetchMails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
