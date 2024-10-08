import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ComposeMail from "./ComposeMail";

function Draft() {
  const [selectedMail, setSelectedMail] = useState(null);
  const [mailData, setMailData] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [filter, setFilter] = useState("all");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        await fetchMails(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMails = async (email) => {
    try {
      const q = query(
        collection(db, "drafts"),
        where("from", "==", email),
        where("isDeleted", "==", false)
      );
      const querySnapshot = await getDocs(q);
      const mails = [];
      querySnapshot.forEach((doc) => {
        mails.push({ id: doc.id, ...doc.data() });
      });
      setMailData(mails);
    } catch (error) {
      console.error("Error fetching mails: ", error);
    }
  };

  const handleMailClick = (mail) => {
    setSelectedMail(mail);
  };

  const handleDeleteMail = async (mail) => {
    try {
      const mailRef = doc(db, "drafts", mail.id);
      await updateDoc(mailRef, {
        isDeleted: true,
      });
      setMailData(mailData.filter((m) => m.id !== mail.id));
      setSelectedMail(null);
    } catch (error) {
      console.error("Error deleting email: ", error);
    }
  };

  const handleEditMail = (mail) => {
    setSelectedMail(mail);
    setIsEditing(true);
  };

  const handleBackToDrafts = () => {
    setSelectedMail(null);
    setIsEditing(false);
  };

  const filterMails = (mails) => {
    if (filter === "unread") {
      return mails.filter((mail) => !mail.isRead);
    } else if (filter === "read") {
      return mails.filter((mail) => mail.isRead);
    } else {
      return mails;
    }
  };

  return (
    <div
      className="bg-gray-200 rounded-2xl p-4 m-4 flex flex-col overflow-y-auto justify-start"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      {selectedMail && isEditing ? (
        <ComposeMail
          draft={selectedMail}
          onClose={handleBackToDrafts}
          onSend={handleBackToDrafts}
        />
      ) : selectedMail ? (
        <div>
          <button
            className="bg-primary-200 hover:bg-primary-100 text-white p-2 rounded-md mb-4"
            onClick={handleBackToDrafts}
          >
            Back to Draft
          </button>
          <div className="bg-white p-4 rounded-2xl">
            <h2 className="text-2xl font-bold mb-2">{selectedMail.subject}</h2>
            <p className="text-sm mb-2">From: {selectedMail.from}</p>
            <p className="text-sm mb-4">Date: {selectedMail.date}</p>
            <p className="text-lg">{selectedMail.body}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="py-2 flex items-center justify-between">
            <select
              className="bg-white p-2 rounded-3xl"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div
            className="flex flex-col gap-4 overflow-y-auto justify-start"
            style={{ height: "calc(100vh - 6rem)" }}
          >
            {filterMails(mailData).map((mail) => (
              <div
                key={mail.id}
                className={`bg-white h-24 p-4 rounded-2xl flex items-center justify-between cursor-pointer ${
                  mail.isRead ? "bg-gray-400" : "bg-white"
                }`}
                onClick={() => handleMailClick(mail)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Avatar"
                      className="rounded-full h-10 w-10"
                    />
                  </div>
                  <div>
                    <p className="text-sm">{mail.from}</p>
                    <h2 className="text-lg font-bold">{mail.subject}</h2>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-around gap-4">
                  <p className="text-sm">{mail.date}</p>
                  <div className="flex items-center gap-4">
                    <FontAwesomeIcon
                      icon={faPen}
                      className={`${
                        mail.isRead ? "text-yellow-500" : "text-gray-500"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMail(mail);
                      }}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMail(mail);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Draft;
