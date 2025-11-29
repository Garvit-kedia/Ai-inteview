"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import { Mic, StopCircle, Loader2, Camera, CameraOff } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  onAnswerSave,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);

  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);

  // ---------------- Speech Recognition ----------------
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript.trim()) {
          setUserAnswer((prev) => (prev + " " + finalTranscript).trim());
        }
      };

      recognition.onerror = (event) => {
        toast.error(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // ---------------- Webcam: FIXED VERSION ----------------
  const EnableWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Delay helps React mount DOM before attaching stream
      setTimeout(async () => {
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;

          try {
            await webcamRef.current.play();
          } catch (err) {
            console.error("Video autoplay blocked:", err);
          }
        }
      }, 150);

      setWebcamEnabled(true);
      toast.success("Webcam enabled successfully");
    } catch (error) {
      toast.error("Failed to enable webcam", {
        description: "Check your camera permissions.",
      });
      console.error("Webcam error:", error);
    }
  };

  const DisableWebcam = () => {
    const stream = webcamRef.current?.srcObject;
    const tracks = stream?.getTracks();

    tracks?.forEach((track) => track.stop());
    if (webcamRef.current) webcamRef.current.srcObject = null;

    setWebcamEnabled(false);
  };

  // ---------------- Recording Controls ----------------
  const StartStopRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech-to-text not supported");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      toast.info("Recording stopped");
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info("Recording started");
    }
  };

  // ---------------- Save Answer ----------------
  const UpdateUserAnswer = async () => {
    if (!userAnswer.trim() && !code.trim()) {
      toast.error("Please provide an answer or code");
      return;
    }

    setLoading(true);

    try {
      const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}, 
      User Answer: ${userAnswer}, 
      Code (${language}): ${code}. 
      Give rating (0-10) & feedback in JSON:
      {"rating": <number>, "feedback": <text>}`;

      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response.text().replace(/```json|```/g, "").trim();
      const JsonfeedbackResp = JSON.parse(mockJsonResp);

      const answerRecord = {
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        codeAns: code,
        codeLang: language,
        feedback: JsonfeedbackResp?.feedback,
        rating: JsonfeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-YYYY"),
      };

      await db.insert(UserAnswer).values(answerRecord);
      onAnswerSave?.(answerRecord);

      toast.success("Answer recorded successfully");
      setUserAnswer("");
      setCode("");

      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    } catch (error) {
      toast.error("Failed to save answer", { description: error.message });
      console.error("Answer save error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="flex justify-center items-center flex-col relative">

      {loading && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex flex-col justify-center items-center">
          <Loader2 className="h-16 w-16 animate-spin text-white mb-4" />
          <p className="text-white text-lg">Saving your answer...</p>
        </div>
      )}

      {/* Webcam Section */}
      <div className="flex flex-col my-20 justify-center items-center bg-black rounded-lg p-5">
        {webcamEnabled ? (
          <video
            ref={webcamRef}
            autoPlay
            muted
            playsInline
            className="w-[200px] h-[200px] object-cover rounded-lg"
          />
        ) : (
          <div className="w-[200px] h-[200px] flex justify-center items-center bg-gray-200 rounded-lg">
            <p className="text-gray-500">Webcam Disabled</p>
          </div>
        )}

        <Button
          variant="outline"
          className="mt-4"
          onClick={webcamEnabled ? DisableWebcam : EnableWebcam}
        >
          {webcamEnabled ? (
            <>
              <CameraOff className="mr-2 h-4 w-4" /> Disable Webcam
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" /> Enable Webcam
            </>
          )}
        </Button>
      </div>

      {/* Record Button */}
      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 items-center animate-pulse flex gap-2">
            <StopCircle /> Stop Recording
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>

      {/* Answer Text */}
      <textarea
        className="w-full h-32 p-4 mt-4 border rounded-md text-gray-800"
        placeholder="Your answer will appear here..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        onPaste={(e) => {
          e.preventDefault();
          toast.error("Pasting is disabled in the answer section.");
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
            e.preventDefault();
            toast.error("Pasting is disabled in the answer section.");
          }
        }}
      />

      {/* Code Section */}
      {/* <div className="w-full mt-8">
        <h2 className="font-semibold mb-2 text-lg text-gray-800">
          💻 Code Answer Section
        </h2>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded-md p-2 mb-4 text-gray-700"
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="javascript">JavaScript</option>
        </select>

        <textarea
          className="w-full h-56 font-mono text-sm p-3 border rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Write your ${language} code here...`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div> */}

      <Button
        className="mt-6"
        onClick={UpdateUserAnswer}
        disabled={loading || (!userAnswer.trim() && !code.trim())}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Answer"
        )}
      </Button>
    </div>
  );
};

export default RecordAnswerSection;
