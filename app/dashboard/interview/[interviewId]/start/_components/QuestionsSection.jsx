"use client";
import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";

const QuestionsSection = ({ mockInterviewQuestion = [], activeQuestionIndex }) => {
  console.log("🚀 ~ QuestionsSection ~ mockInterviewQuestion:", mockInterviewQuestion);

  // 🔊 Text-to-speech helper
  const textToSpeech = (text) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  // 🧠 Handle case where questions aren't yet loaded
  if (!Array.isArray(mockInterviewQuestion) || mockInterviewQuestion.length === 0) {
    return (
      <div className="p-5 border rounded-lg my-10 text-center text-gray-500">
        Loading questions...
      </div>
    );
  }

  return (
    <div className="p-5 border rounded-lg my-10">
      {/* Question selector buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {mockInterviewQuestion.map((question, index) => (
          <h2
            key={index}
            className={`p-2 bg-secondary rounded-full text-xs md:text-sm text-center cursor-pointer transition-all duration-200 ${
              activeQuestionIndex === index
                ? "bg-blue-700 text-white shadow-md scale-105"
                : "hover:bg-blue-100"
            }`}
          >
            Question #{index + 1}
          </h2>
        ))}
      </div>

      {/* Current question display */}
      <div className="flex items-center justify-between my-5">
        <h2 className="text-md md:text-lg font-medium">
          {mockInterviewQuestion[activeQuestionIndex]?.question}
        </h2>
        <Volume2
          className="cursor-pointer text-blue-700 hover:text-blue-900"
          onClick={() =>
            textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)
          }
        />
      </div>

      {/* Info/Note section */}
      <div className="border rounded-lg p-5 bg-blue-100 mt-10">
        <h2 className="flex gap-2 items-center text-primary">
          <Lightbulb />
          <strong>Note:</strong>
        </h2>
        <p className="text-sm text-primary my-2 leading-relaxed">
          Enable your video webcam and microphone to start your AI-generated mock interview.
          It includes 5 questions which you can answer — at the end you’ll get a performance
          report based on your responses. <br />
          <strong>We never record your video.</strong> You can disable webcam access anytime
          you wish.
        </p>
      </div>
    </div>
  );
};

export default QuestionsSection;
