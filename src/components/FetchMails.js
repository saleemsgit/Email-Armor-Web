import { useEffect, useState } from "react";
import axios from "axios";
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

function FetchMails() {
  const [emails, setEmails] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [to, setTo] = useState();
  // The backend results
  const [emailHeader, setEmailHeaders] = useState();
  const [emailText, setEmailTexts] = useState();
  const [urlDetection, setUrlDetection] = useState(); //from the body
  const [fileInfo, setFileInfo] = useState();
  const [qrDetail, setQrDetail] = useState();
  const [attachmentCls, setAttachmentCls] = useState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTo(user.email);
      }
    });
    return () => unsubscribe();
  }, []);
  const saveInFireBase = async (fetchedEmails) => {
    let reason = "";
    const attachmentUrlsInbox = [];

    const base64Data = fetchedEmails[0]?.attachments[0]?.data;
    const attachmentName = fetchedEmails[0]?.attachments[0]?.name;

    // Check if base64Data is a valid base64 string
    // if (!base64Data) {
    //   console.error("Invalid attachment data or name");
    //   return;
    // }

    // Remove base64 header if it exists
    const base64Image = base64Data.includes("base64,")
      ? base64Data.split(",")[1]
      : base64Data;

    try {
      // Decode base64 data
      const byteString = atob(base64Image.trim()); // Trim spaces/newlines

      // Convert byte string to a typed array
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }

      // Create a Blob from the typed array
      const blob = new Blob([byteArray], { type: "image/png" });

      const storageRefInbox = ref(storage, `inbox/${"image"}`);

      // Upload Blob to Firebase Storage
      await uploadBytes(storageRefInbox, blob, { contentType: "image/png" });

      const urlInbox = await getDownloadURL(storageRefInbox);
      attachmentUrlsInbox.push({
        name: "image",
        url: urlInbox,
      });

      console.log(attachmentUrlsInbox);

      // Safe check for emailHeader and its properties
      const headerClass = emailHeader?.headerDetection?.header_class;
      console.log(headerClass);

      const language = emailText?.Language?.Language || "unknown"; // Provide default value if language is undefined

      if (headerClass === "Spam") {
        reason = "Email header is spam";
        await addToFirebase(
          "quarantined",
          fetchedEmails[0].from,
          fetchedEmails[0].subject,
          fetchedEmails[0].body,
          fetchedEmails[0].date,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`Sent quarantined: ${reason}`);
        alert(`Sent quarantined: ${reason}`);
      } else if (emailText?.["Spam Detection"]?.spam_class === "spam") {
        reason = "Email body is spam";
        await addToFirebase(
          "quarantined",
          fetchedEmails[0].from,
          fetchedEmails[0].subject,
          fetchedEmails[0].body,
          fetchedEmails[0].date,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`Sent quarantined: ${reason}`);
        alert(`Sent quarantined: ${reason}`);
      } else if (urlDetection?.bitly_urls?.length === 1) {
        reason = "The URL in the body might contain a virus";
        await addToFirebase(
          "spam",
          fetchedEmails[0].from,
          fetchedEmails[0].subject,
          fetchedEmails[0].body,
          fetchedEmails[0].date,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`Sent spam: ${reason}`);
        alert(`Sent spam: ${reason}`);
      } else {
        reason = "The email is clean";
        await addToFirebase(
          "inbox",
          fetchedEmails[0].from,
          fetchedEmails[0].subject,
          fetchedEmails[0].body,
          fetchedEmails[0].date,
          attachmentUrlsInbox,
          language,
          reason
        );
        console.log(`Sent inbox: ${reason}`);
        alert(`Sent inbox: ${reason}`);
      }
    } catch (error) {
      console.error("Error processing base64 data:", error);
    }
  };

  const addToFirebase = async (
    saveIn,

    from,
    subject,
    body,
    date,
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
      language,
      reason,
    });
  };

  const fetchMails = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/fetch-emails", {
        params: {
          email: email,
          password: password,
        },
      });

      const fetchedEmails = response.data; // Store response data in a variable
      setEmails(fetchedEmails); // Set emails data in state

      // Pass fetched emails to the functions directly
      function1EmailHeaderChecker(fetchedEmails);
      function1EmailBodyChecker(fetchedEmails);
      function2UrlDetection(fetchedEmails);
      handleAttachments(fetchedEmails);

      saveInFireBase(fetchedEmails);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };
  const function1EmailHeaderChecker = async (fetchedEmails) => {
    const hops = 6;
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString("en-US");

    // Log the fetched email data for debugging
    console.log("Fetched email data:", fetchedEmails[0]);

    // Assuming fetchedEmails is an array of emails
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/function01/email_header/",
        new URLSearchParams({
          hops: hops.toString(),
          date: formattedDate,
          Subject: fetchedEmails[0].subject, // Access the first email's subject
          From: Array.isArray(fetchedEmails[0].from)
            ? fetchedEmails[0].from
            : [fetchedEmails[0].from], // Ensure From is an array
        })
      );

      setEmailHeaders(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error posting email header:", error);
    }
  };
  const function1EmailBodyChecker = async (fetchedEmails) => {
    const emailBody = fetchedEmails[0].body; // Access the first email's body
    console.log(emailBody);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/function01/email_text/`,
        {
          params: { body: emailBody },
        }
      );
      setEmailTexts(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Error fetching email text:", error);
    }
  };

  const function2UrlDetection = async (fetchedEmails) => {
    const urls = fetchedEmails[0].body
      .split(" ")
      .filter((word) => word.startsWith("http"));
    console.log(`Extracted URLs: ${urls}`);

    try {
      const bodyURLresponse = await axios.post(
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
        // setFunctionWebscrape(functionFourResponse.data);
      }
      console.log(responseAlert.data);

      setUrlDetection(bodyURLresponse.data);
      console.log(bodyURLresponse.data);
      // console.log(responseAlert.data);
      // setFunctionAlert(responseAlert.data);
    } catch (error) {
      console.error("Error checking links:", error);
    }
  };
  const handleAttachments = async (fetchedEmails) => {
    try {
      // Assuming the attachment data is base64 encoded
      const base64Data = fetchedEmails[0].attachments[0].data; // Base64 encoded data
      console.log("Base64 Data: ", base64Data);

      // Convert base64 to Blob
      const base64Response = await fetch(
        `data:image/jpeg;base64,${base64Data}`
      );
      const file = await base64Response.blob(); // Create Blob from base64
      console.log("Blob file: ", file);

      // Prepare the FormData objects for different API endpoints
      const formData = new FormData();
      const formData1 = new FormData();
      const formData2 = new FormData();

      // Append the Blob file to the FormData with the appropriate keys
      formData.append("file", file);
      formData1.append("QR_image_file", file);
      formData2.append("attachments", file);

      // First API call to /fileinfo/
      const response = await fetch("http://localhost:8000/fileinfo/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file info.");
      }

      // Second API call to /function02/QR_URL_detection/
      const response1 = await fetch(
        "http://localhost:8000/function02/QR_URL_detection/",
        {
          method: "POST",
          body: formData1,
        }
      );

      if (!response1.ok) {
        throw new Error("Failed to detect QR code.");
      }

      // Third API call to /function03/attachments_classification
      const response2 = await fetch(
        "http://localhost:8000/function03/attachments_classification",
        {
          method: "POST",
          body: formData2,
        }
      );

      if (!response2.ok) {
        throw new Error("Failed to classify attachments.");
      }

      // Assuming the response is in JSON format

      const contentDetailOfFileInfo = await response.json();
      setFileInfo(contentDetailOfFileInfo);
      const contentDetailQR = await response1.json();
      setQrDetail(contentDetailQR);
      const contentDetailAttachmentClassification = await response2.json();
      setAttachmentCls(contentDetailAttachmentClassification);
      // Logging the details for debugging
      console.log("FileInfo: ", contentDetailOfFileInfo);
      console.log("QR Detection details: ", contentDetailQR);
      console.log(
        "AttachmentClassification: ",
        contentDetailAttachmentClassification
      );
    } catch (error) {
      console.error("Error processing attachments:", error);
    }
  };

  const renderAttachment = (attachment) => {
    const { filename, data } = attachment;
    const base64Data = `data:;base64,${data}`;

    // Check if the attachment is an image based on file extension
    if (/\.(jpg|jpeg|png|gif)$/i.test(filename)) {
      // Render the image directly
      return (
        <div key={filename}>
          <img src={base64Data} alt={filename} className="attachment-image" />
          <p>{filename}</p>
        </div>
      );
    } else {
      // Provide download link for non-image files
      return (
        <div key={filename}>
          <a href={base64Data} download={filename}>
            Download {filename}
          </a>
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <label className="block text-gray-700 font-semibold mb-2">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
        />

        <label className="block text-gray-700 font-semibold mb-2 mt-4">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="w-full border border-gray-300 rounded-md py-2 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your password"
        />

        <button
          onClick={fetchMails}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition duration-300 ease-in-out shadow-md"
        >
          Fetch Mails
        </button>
      </div>

      <div className="mt-8 w-full max-w-3xl overflow-auto" style={{ maxHeight: '400px' }}>
        {emails.length > 0 ? (
          <ul className="space-y-4">
            {emails.map((mail, index) => (
              <li key={index} className="bg-white p-4 rounded-lg shadow-lg">
                <strong className="block text-lg text-gray-800">From:</strong> 
                <span className="text-gray-700">{mail.from}</span>
                <br />
                <strong className="block text-lg text-gray-800">Subject:</strong> 
                <span className="text-gray-700">{mail.subject}</span>
                <br />
                <strong className="block text-lg text-gray-800">Body:</strong> 
                <span className="text-gray-700">{mail.body}</span>
                <br />
                <strong className="block text-lg text-gray-800">Attachments:</strong>
                {mail.attachments && mail.attachments.length > 0 ? (
                  mail.attachments.map((attachment) => renderAttachment(attachment))
                ) : (
                  <p className="text-gray-500">No attachments</p>
                )}
                <hr className="my-4" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 mt-4">No emails fetched yet.</p>
        )}
      </div>
    </div>
  );
}
export default FetchMails;
