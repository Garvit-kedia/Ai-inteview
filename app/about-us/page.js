'use client'
import { useState } from 'react'
import { 
  Users, 
  Target, 
  Award, 
  Briefcase, 
  BookOpen, 
  Rocket 
} from 'lucide-react'

const AboutUsPage = () => {
  const [activeTab, setActiveTab] = useState('mission')

  const tabContent = {
    mission: {
      icon: <Target className="mr-2 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-base md:text-lg">MockMate AI is on a mission to revolutionize interview preparation by providing personalized, intelligent AI coaching tailored to individual career aspirations.</p>
          <p className="text-base md:text-lg">With MockMate AI, the goal is to bridge the gap between preparation and success, empowering users to unlock their full potential.</p>
        </div>
      )
    },
    story: {
      icon: <BookOpen className="mr-2 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-base md:text-lg">The idea for MockMate AI was born from firsthand experiences with the challenges of interview preparation. As a solo developer, I wanted to create a platform that simplifies the process and builds confidence in individuals.</p>
          <p className="text-base md:text-lg">This journey has been a testament to the power of passion and innovation, leading to the creation of an impactful tool for career growth.</p>
        </div>
      )
    },
    approach: {
      icon: <Rocket className="mr-2 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-base md:text-lg">leverages advanced AI algorithms to generate dynamic, contextually relevant interview questions based on your professional background and goals.</p>
          <p className="text-base md:text-lg">Through real-time analysis and feedback, the platform provides actionable insights, enabling users to improve with every mock interview attempt.</p>
        </div>
      )
    }
  }

  const coreValues = [
    {
      icon: <Award className="w-12 h-12 text-indigo-600 mb-4" />,
      title: "Continuous Learning",
      description: "Always striving to improve and provide better tools for growth."
    },
    {
      icon: <Users className="w-12 h-12 text-indigo-600 mb-4" />,
      title: "Empowerment",
      description: "Supporting individuals in building confidence and achieving professional success."
    },
    {
      icon: <Briefcase className="w-12 h-12 text-indigo-600 mb-4" />,
      title: "Excellence",
      description: "Delivering high-quality, impactful features to simplify interview preparation."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">

      

      
    </div>
  )
}

export default AboutUsPage