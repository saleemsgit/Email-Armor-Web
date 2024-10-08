import React, { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase";
import {
  uploadBytes,
  getDownloadURL,
  ref,
  deleteObject,
} from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom";
import axios from "axios";

const ComposeMail = ({ draft, onClose, onSend }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [to, setTo] = useState(draft?.to || "");
  const [subject, setSubject] = useState(draft?.subject || "");
  const [body, setBody] = useState(draft?.body || "");
  const [attachments, setAttachments] = useState(draft?.attachments || []);
  const [from, setFrom] = useState(draft?.from || "");
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState(draft?.id || null);
  const [emailTexts, setEmailTexts] = useState();
  const [urlDetection, setUrlDetection] = useState();
  const [emailHeaders, setEmailHeaders] = useState();
  const [qrDetection, setQrDetection] = useState([]);
  const [qrSpamCounter, setQrSpamCounter] = useState([]);
  const [attachmentDetails, setAttachmentDetails] = useState([]);
  const [functionAlert, setFunctionAlert] = useState();
  const [functionWebscrape, setFunctionWebscrape] = useState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFrom(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 2000);
    return () => clearTimeout(timer);
  }, [to, subject, body, attachments]);

  const saveDraft = async () => {
    try {
      if (!from) return;

      const attachmentUrls = [];
      for (let attachment of attachments) {
        if (attachment.file) {
          const storageRef = ref(storage, `drafts/${attachment.file.name}`);
          await uploadBytes(storageRef, attachment.file);
          const url = await getDownloadURL(storageRef);
          attachmentUrls.push({ name: attachment.file.name, url });
        } else {
          attachmentUrls.push(attachment);
        }
      }

      const draftData = {
        from,
        to,
        subject,
        body,
        attachments: attachmentUrls,
        isRead: false,
        isDeleted: false,
        isSend: false,
      };

      if (draftId) {
        const draftRef = doc(db, "drafts", draftId);
        await setDoc(draftRef, draftData, { merge: true });
      } else {
        const draftRef = await addDoc(collection(db, "drafts"), draftData);
        setDraftId(draftRef.id);
      }
    } catch (error) {
      console.error("Error saving draft: ", error);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // const handleAttachmentChange = (e) => {
  //   const newAttachments = Array.from(e.target.files).map(file => ({ file, name: file.name }));
  //   setAttachments([...attachments, ...newAttachments]);
  // };

  const handleAttachmentChange = async (e) => {
    const newFiles = Array.from(e.target.files);

    try {
      const updatedAttachments = [];
      console.log(`done`);

      for (let file of newFiles) {
        // const listFile = [file];
        const formData = new FormData();
        const formData1 = new FormData();
        const formData2 = new FormData();

        formData.append("file", file);
        formData1.append("QR_image_file", file);
        formData2.append("attachments", file);
        const response = await fetch("http://localhost:8000/fileinfo/", {
          method: "POST",
          body: formData,
        });
        const response1 = await fetch(
          "http://localhost:8000/function02/QR_URL_detection/",
          {
            method: "POST",
            body: formData1,
          }
        );

        const response2 = await fetch(
          "http://localhost:8000/function03/attachments_classification",
          {
            method: "POST",
            body: formData2,
          }
        );

        // console.log(await response2.json());
        const contentDetail = await response2.json();
        const contentDetails = contentDetail.Other_file_report.Content;

        console.log(`details ${contentDetails}`);
        setAttachmentDetails((prev) => [...prev, contentDetails]);

        if (response.ok || response1.ok) {
          const fileInfo = await response.json();
          const qrDetails = await response1.json();
          console.log(qrDetails);
          console.log("File info:", fileInfo);
          updatedAttachments.push({
            file,
            name: file.name,
            fileInfo,
            qrDetails,
          });
        } else {
          console.error(
            "Failed to get file info:",
            response.status,
            response.statusText
          );
          alert("Failed to get file info.");
        }
      }

      setAttachments([...attachments, ...updatedAttachments]);
    } catch (error) {
      console.error("Error handling attachment change:", error);
      alert("Error handling attachment change.");
    }
  };

  const handleRemoveAttachment = async (name) => {
    try {
      const updatedAttachments = attachments.filter((att) => att.name !== name);
      setAttachments(updatedAttachments);

      // Remove attachment from Firebase Storage
      const storageRef = ref(storage, `drafts/${name}`);
      await deleteObject(storageRef);

      // Update Firestore to remove attachment from the draft document
      if (draftId) {
        const draftRef = doc(db, "drafts", draftId);
        const snapshot = await getDoc(draftRef);
        if (snapshot.exists()) {
          const { attachments } = snapshot.data();
          const updatedDraftAttachments = attachments.filter(
            (att) => att.name !== name
          );
          await updateDoc(draftRef, { attachments: updatedDraftAttachments });
        }
      }
    } catch (error) {
      console.error("Error removing attachment: ", error);
      alert("Error removing attachment.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attachmentUrlsSend = [];
      const attachmentUrlsInbox = [];
      console.log(`Processing attachments...`);

      for (let attachment of attachments) {
        if (attachment.file) {
          const storageRefSend = ref(storage, `send/${attachment.file.name}`);
          const storageRefInbox = ref(storage, `inbox/${attachment.file.name}`);

          // Upload files
          await uploadBytes(storageRefSend, attachment.file);
          await uploadBytes(storageRefInbox, attachment.file);

          const urlSend = await getDownloadURL(storageRefSend);
          const urlInbox = await getDownloadURL(storageRefInbox);

          attachmentUrlsSend.push({ name: attachment.file.name, url: urlSend });
          attachmentUrlsInbox.push({
            name: attachment.file.name,
            url: urlInbox,
          });
        } else {
          attachmentUrlsSend.push(attachment);
          attachmentUrlsInbox.push(attachment);
        }
      }

      const timestamp = new Date();
      const date = timestamp.toLocaleDateString();
      const time = timestamp.toLocaleTimeString();
      let reason = "";

      // Additional processing functions
      await emailText();
      await linkChecker(body);
      await emailHeader(subject, from);

      attachments.forEach((attachment) => {
        const countSpam = attachment?.qrDetails?.bitly_urls?.length || 0;
        setQrSpamCounter((prev) => [...prev, countSpam]);
      });

      const language = emailTexts?.Language?.Language || "Unknown";

      // Save to "send" collection
      await addDoc(collection(db, "send"), {
        from,
        to,
        subject,
        body,
        attachments: attachmentUrlsSend,
        isRead: false,
        isDeleted: false,
        isSend: true,
        date,
        time,
        language,
      });

      // Quarantine or Spam Logic
      if (emailHeaders.headerDetection.header_class === "Spam") {
        reason = "Email header is spam";
        await addToFirebase(
          "quarantined",
          date,
          time,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`sent qurantined reason ${reason}`);
      } else if (urlDetection.bitly_urls.length === 1) {
        reason = "URL might contain a virus";
        await addToFirebase(
          "quarantined",
          date,
          time,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`sent qurantined`);
      } else if (emailTexts["Spam Detection"].spam_class === "spam") {
        reason = "The body might contains spam message";
        await addToFirebase(
          "quarantined",
          date,
          time,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`sent qurantined reason : ${reason}`);
      } else if (qrSpamCounter.includes(1)) {
        reason = "QR link might contain a virus";
        await addToFirebase(
          "quarantined",
          date,
          time,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`sent qurantined reason: ${reason}`);
      } else if (functionAlert.PopUp_massage_class[0] === "hamed") {
        reason = "The email armor detected harmed url";
        await addToFirebase(
          "spam",
          date,
          time,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`sent spam reason ${reason}`);
      } else if (functionWebscrape["response.status_code"] === 403) {
        reason = "The email armor detected harmed url";
        await addToFirebase(
          "spam",
          date,
          time,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`sent spam reason : ${reason}`);
      } else if (
        attachmentDetails.some((subArray) => subArray.includes("Negative"))
      ) {
        reason = "Might contain disturbing content";
        await addDoc(collection(db, "spam"), {
          from,
          to,
          subject,
          body,
          attachments: attachmentUrlsInbox,
          isRead: false,
          isDeleted: false,
          isSend: true,
          date,
          time,
          language,
          reason,
        });
        console.log(`sent to spam`);
      } else {
        await addDoc(collection(db, "inbox"), {
          from,
          to,
          subject,
          body,
          attachments: attachmentUrlsInbox,
          isRead: false,
          isDeleted: false,
          isSend: true,
          date,
          time,
          language,
        });
        console.log(`sent to inbox`);
      }

      // Delete the draft after sending
      if (draftId) {
        const draftRef = doc(db, "drafts", draftId);
        await deleteDoc(draftRef);

        for (let attachment of attachments) {
          if (attachment.file) {
            const oldAttachmentRef = ref(
              storage,
              `drafts/${attachment.file.name}`
            );
            await deleteObject(oldAttachmentRef);
          }
        }
        setDraftId(null);
      }

      alert("Email sent successfully!");
      setTo("");
      setSubject("");
      setBody("");
      setAttachments([]);
      setAttachmentDetails([]);
      setQrSpamCounter([]);

      if (onSend) onSend();
    } catch (error) {
      console.error("Error sending email: ", error);
      alert("Error sending email.");
    } finally {
      setLoading(false);
    }
  };

  const addToFirebase = async (
    saveIn,
    date,
    time,
    attachmentUrlsInbox,
    language,
    reason
  ) => {
    await addDoc(collection(db, saveIn), {
      from,
      to,
      subject,
      body,
      attachments: attachmentUrlsInbox,
      isRead: false,
      isDeleted: false,
      isSend: true,
      date,
      time,
      language,
      reason,
    });
  };

  const emailText = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/function01/email_text/`,
        {
          params: { body },
        }
      );
      setEmailTexts(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching email text:", error);
    }
  };

  const emailHeader = async (from, subject) => {
    const hops = 6;
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString("en-US");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/function01/email_header/",
        new URLSearchParams({
          hops: hops.toString(),
          date: formattedDate,
          Subject: from,
          From: Array.isArray(subject) ? subject : [subject],
        })
      );

      setEmailHeaders(response.data);
    } catch (error) {
      console.error("Error posting email header:", error);
    }
  };

  const linkChecker = async (body) => {
    const urls = body.split(" ").filter((word) => word.startsWith("http"));
    console.log(`Extracted URLs: ${urls}`);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/function02/URL_detection/",
        { urls } // Passing the URLs as a POST request body
      );

      const responseAlert = await axios.post(
        "http://127.0.0.1:8000/function04/alert",
        { urls } // Passing the URLs as a POST request body
      );

      for (let url of urls) {
        const functionFourResponse = await axios.get(
          "http://127.0.0.1:8000/function04/web_scraping",
          {
            params: {
              link: url, // Passing a single URL
            },
          }
        );
        console.log(
          "Web scraping result for",
          url,
          ":",
          functionFourResponse.data
        );
        setFunctionWebscrape(functionFourResponse.data);
      }

      setUrlDetection(response.data);
      console.log(response.data);
      console.log(responseAlert.data);
      setFunctionAlert(responseAlert.data);
    } catch (error) {
      console.error("Error checking links:", error);
    }
  };

  const qrCheaker = async () => {
    const response = await axios.post(``, {
      params: {},
    });
  };
  return (
    <div
      className={`fixed bottom-0 right-0 ${
        isExpanded ? "w-full h-full" : "w-96 h-fit mr-10"
      } bg-white shadow-lg rounded-xl transition-all duration-300`}
    >
      <div className="flex justify-between items-center p-4 border-b bg-gray-300 rounded-t-xl">
        <h2 className="text-lg font-bold">Compose Mail</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExpand}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? "🗕" : "🗖"}
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-200 rounded"
          >
            &#10005;
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onBlur={saveDraft}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={saveDraft}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Compose your email"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onBlur={saveDraft}
              className="w-full p-2 border rounded h-40"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <p>Attachments</p>
            <input
              type="file"
              multiple
              onChange={handleAttachmentChange}
              className="w-full p-2 border rounded"
            />
            <div>
              {attachments.map((attachment, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(attachment.name)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary-200 text-white px-4 py-2 rounded"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComposeMail;
