"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Globe, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import StudyAbroadSurvey from "../assessment/StudyAbroadSurvey";
import { Button } from "../ui/button";
import { CardSpotlight } from "../ui/card-spotlight";
import { LampContainer } from "../ui/lamp";

interface CTASectionProps {
  title?: string;
  buttonText?: string;
  href?: string;
  className?: string;
}

const CTASection = ({ 
  title = "Take your psychometric test today",
  buttonText = "Get started for free",
  href = "/auth/signup",
  className 
}: CTASectionProps) => {
  const [showAssessment, setShowAssessment] = useState(false);

  return (
    <div id="services">
      <div id="psychometric-test"></div>
      <LampContainer className={className}>
      <motion.div
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center text-center max-w-7xl mx-auto px-4 w-full"
      >
        <h1 className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl font-heading">
          {title}
        </h1>
        
        {!showAssessment ? (
          <>
            {/* Test Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full max-w-6xl">
              <TestCard 
                title="IELTS Preparation"
                description="Comprehensive IELTS test preparation with proven strategies and practice tests."
                icon={<BookOpen className="w-8 h-8 text-purple-400" />}
                testType="ielts"
                onAssessmentClick={setShowAssessment}
              />
              <TestCard 
                title="Study Abroad Assessment"
                description="Complete 54-question assessment to evaluate your study abroad readiness."
                icon={<Brain className="w-8 h-8 text-purple-400" />}
                testType="assessment"
                onAssessmentClick={setShowAssessment}
              />
              <TestCard 
                title="Study Abroad Guidance"
                description="Complete guidance for students planning to study overseas."
                icon={<Globe className="w-8 h-8 text-purple-400" />}
                testType="guidance"
                onAssessmentClick={setShowAssessment}
              />
              <TestCard 
                title="Academic Counseling"
                description="Expert advice on course selection and academic planning."
                icon={<GraduationCap className="w-8 h-8 text-purple-400" />}
                testType="counseling"
                onAssessmentClick={setShowAssessment}
              />
            </div>
            

          </>
        ) : (
          <div className="mt-12 w-full max-w-6xl">
            <div className="mb-8 text-center">
              <Button 
                onClick={() => setShowAssessment(false)}
                variant="outline"
                className="mb-4"
              >
                ← Back to Tests
              </Button>
            </div>
            <StudyAbroadSurvey />
          </div>
        )}
      </motion.div>
    </LampContainer>
    </div>
  );
};

// Test Card Component
const TestCard = ({ 
  title, 
  description, 
  icon, 
  testType,
  onAssessmentClick
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  testType: string;
  onAssessmentClick?: (show: boolean) => void;
}) => {
  return (
    <CardSpotlight className="h-96 w-full">
      <div className="flex flex-col h-full p-6">
        <div className="mb-4">
          {icon}
        </div>
        
        <h3 className="text-xl font-bold relative z-20 text-white mb-4">
          {title}
        </h3>
        
        <p className="text-neutral-300 relative z-20 text-sm flex-grow">
          {description}
        </p>
        
        <div className="mt-6 pt-4 border-t border-neutral-700">
          {testType === 'assessment' ? (
            <Button 
              onClick={() => onAssessmentClick?.(true)}
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              Take Test
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button 
              asChild
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              <Link href={`/test/${testType}`}>
                Take Test
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </CardSpotlight>
  );
};

export default CTASection;