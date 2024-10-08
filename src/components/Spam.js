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

function Spam() {
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
        collection(db, "spam"),
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
      const mailRef = doc(db, "spam", mail.id);
      await updateDoc(mailRef, {
        isRead: true,
      });
    } catch (error) {
      console.error("Error updating email status: ", error);
    }
  };

  const handleDeleteMail = async (mail) => {
    try {
      const mailRef = doc(db, "spam", mail.id);
      await updateDoc(mailRef, {
        isDeleted: true,
      });
      setMailData(mailData.filter((m) => m.id !== mail.id));
      setSelectedMail(null);
    } catch (error) {
      console.error("Error deleting email: ", error);
    }
  };

  const handleStarMail = (mail) => {
    mail.stared = !mail.stared;
    setSelectedMail(mail);
  };

  const handleMarkAsRead = (mail) => {
    mail.isRead = true;
    setSelectedMail(mail);
  };

  const handleMarkAsUnread = (mail) => {
    mail.isRead = false;
    setSelectedMail(mail);
  };

  const handleBackToInbox = () => {
    setSelectedMail(null);
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

  const handleAttachmentDownload = async (attachment) => {
    try {
      const storageRef = ref(storage, attachment.url);
      const downloadUrl = await getDownloadURL(storageRef);
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error downloading attachment: ", error);
    }
  };

  // const handleAttachmentDownload = async (attachment) => {
  //   try {
  //     const storageRef = ref(storage, attachment.url);
  //     const downloadUrl = await getDownloadURL(storageRef);

  //     const sha256Hash = CryptoJS.SHA256(downloadUrl).toString(CryptoJS.enc.Hex);
  //     console.log('SHA-256 hash of attachment URL:', sha256Hash);

  //     const filesResponse = await fetch(`http://127.0.0.1:8000/fileinfo/${sha256Hash}`);
  //     const filesData = await filesResponse.json();
  //     console.log('File info from VirusTotal:', filesData);

  //     // Example: Displaying file information in an alert (replace with your UI logic)
  //     alert(`File Name: ${filesData.data.attributes.names.join(', ')}`);

  //     window.open(downloadUrl, '_blank');
  //   } catch (error) {
  //     console.error('Error downloading attachment: ', error);
  //   }
  // };

  return (
    <div
      className="bg-gray-200 rounded-2xl p-4 m-4 flex flex-col overflow-y-auto justify-start"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      {selectedMail ? (
        <div>
          <button
            className="bg-primary-200 hover:bg-primary-100 text-white p-2 rounded-md mb-4"
            onClick={handleBackToInbox}
          >
            Back to Inbox
          </button>
          <div className="bg-white p-4 rounded-2xl">
            <h2 className="text-2xl font-bold mb-2">{selectedMail.subject}</h2>
            <p className="text-sm mb-2">From: {selectedMail.from}</p>
            <p className="text-sm mb-4">Date: {selectedMail.date}</p>
            <p className="text-lg">{selectedMail.body}</p>
            <p className="text-sm mb-1">Language : {selectedMail.language}</p>
            {selectedMail.attachments &&
              selectedMail.attachments.length > 0 && (
                <div className="mt-4">
                  <p className="text-lg font-bold mb-2">Attachments:</p>
                  {selectedMail.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-4 mb-2">
                      <span className="text-sm">{attachment.name}</span>
                      <button
                        className="text-blue-500 hover:underline text-sm"
                        onClick={() => handleAttachmentDownload(attachment)}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                    <p className="text-sm">{mail.body}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-around gap-4">
                  <p className="text-sm">{mail.date}</p>
                  <div className="flex items-center gap-4">
                    <FontAwesomeIcon
                      icon={faStar}
                      className={`text-yellow-500 ${
                        mail.stared ? "" : "hidden"
                      }`}
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

export default Spam;
