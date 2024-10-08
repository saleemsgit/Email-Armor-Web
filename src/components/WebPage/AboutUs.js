import React from 'react';
import About01 from '../../assets/About01.png';
import About02 from '../../assets/About02.png';
import About03 from '../../assets/About03.png';
import About04 from '../../assets/About04.png';

const AboutUs = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-28">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="flex flex-wrap -mx-4 gap-4">
          <div className="w-full px-4 mb-8 md:mb-0">
            <div className="flex justify-center items-center p-8 border border-gray-200 rounded-lg">
              <div className="md:w-1/2 p-10">
                <h3 className="text-2xl font-semibold mb-4">
                  AI Based Quick Email Text Analysis
                </h3>
                <p className="text-gray-600 mb-6">
                  Our advanced AI algorithms provide a swift and comprehensive
                  analysis of your email content. By examining patterns and
                  context, our system can identify potential phishing attempts
                  and security threats in real-time, ensuring your inbox remains
                  secure and your communications safe.
                </p>
              </div>

              <img
                src={About01}
                alt="Email Text Analysis"
                className="w-1/2 h-auto"
              />
            </div>
          </div>
          <div className="w-full  px-4">
            <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg">
              <img
                src={About02}
                alt="QR Phishing & URL Analyzer"
                className="w-1/2 h-auto"
              />
              <div className="md:w-1/2 p-10">
                <h3 className="text-2xl font-semibold mb-4">
                  AI Based QR Phishing & URL Analyzer
                </h3>
                <p className="text-gray-600 mb-6">
                  The system features an AI-driven analyzer that scrutinizes QR
                  codes and URLs embedded in your emails. By detecting and
                  flagging malicious links and phishing URLs, it prevents you
                  from falling victim to cyberattacks and ensures you only
                  interact with safe and trustworthy web addresses.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full px-4 mb-8 md:mb-0">
            <div className="flex justify-center items-center p-8 border border-gray-200 rounded-lg">
              <div className="md:w-1/2 p-10">
                <h3 className="text-2xl font-semibold mb-4">
                  Analyze The Mail Attachment Using a Machine Learning Model
                </h3>
                <p className="text-gray-600 mb-6">
                  Leveraging powerful machine learning models, our system
                  thoroughly scans email attachments for hidden threats and
                  malware. This proactive approach helps in identifying and
                  neutralizing security risks before they can cause harm,
                  providing an additional layer of protection for your digital
                  environment.
                </p>
              </div>

              <img
                src={About03}
                alt="Email Text Analysis"
                className="w-1/2 h-auto"
              />
            </div>
          </div>
          <div className="w-full  px-4">
            <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg">
              <img
                src={About04}
                alt="QR Phishing & URL Analyzer"
                className="w-1/2 h-auto"
              />
              <div className="md:w-1/2 p-10">
                <h3 className="text-2xl font-semibold mb-4">
                  Phishing URL Detection Based on The Content
                </h3>
                <p className="text-gray-600 mb-6">
                  Our technology goes beyond surface-level analysis by examining
                  the content and context of emails to detect phishing URLs.
                  This content-based detection method ensures higher accuracy in
                  identifying deceptive and harmful links, enhancing your
                  overall email security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
