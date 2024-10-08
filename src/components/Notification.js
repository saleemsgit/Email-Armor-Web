import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTrash } from "@fortawesome/free-solid-svg-icons";
import { db, auth, storage } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL } from "firebase/storage";

function Notification() {
  const [selectedMail, setSelectedMail] = useState(null);
  const [mailData, setMailData] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [filter, setFilter] = useState("all");

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
        collection(db, "quarantined"),
        where("to", "==", email),
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

  const handleMailClick = async (mail) => {
    setSelectedMail(mail);

    try {
      const mailRef = doc(db, "quarantined", mail.id);
      await updateDoc(mailRef, {
        isRead: true,
      });
    } catch (error) {
      console.error("Error updating email status: ", error);
    }
  };

  const handleDeleteMail = async (mail) => {
    try {
      const mailRef = doc(db, "quarantined", mail.id);
      await updateDoc(mailRef, {
        isDeleted: true,
      });
      setMailData(mailData.filter((m) => m.id !== mail.id));
      setSelectedMail(null);
    } catch (error) {
      console.error("Error deleting email: ", error);
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <p className="font-bold text-gray-700">Notifications</p>
      <ul className="mt-2">
        {mailData.map((mail) => (
          <li
            key={mail.id}
            className="border-b border-gray-200 py-2 cursor-pointer"
            onClick={() => handleMailClick(mail)}
          >
            <div className="flex justify-between">
              <span>{mail.from}</span>
              <FontAwesomeIcon
                icon={faTrash}
                className="text-red-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMail(mail);
                }}
              />
            </div>
            <p className="text-gray-500 text-sm">
              The mail from {mail.from} sent to qurantined because of the safety
              reasons
            </p>
          </li>
        ))}
      </ul>
      {selectedMail && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="font-bold">{selectedMail.from}</p>
          <p>{selectedMail.body}</p>
        </div>
      )}
    </div>
  );
}

export default Notification;
