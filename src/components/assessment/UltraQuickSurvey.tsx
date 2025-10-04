"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "../ui/progress";
import { CheckCircle } from "lucide-react";

interface Question {
  id: string;
  section: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface UserInfo {
  email: string;
  mobile: string;
}

interface Response {
  questionId: string;
  answer: string;
  section: string;
}

const ultraQuickQuestions: Question[] = [
  // Section 1: Academic Readiness (2 Questions)
  {
    id: "Q1",
    section: "Academic Readiness",
    question: "How would you describe your academic performance?",
    options: {
      A: "Consistently high (above 85%)",
      B: "Good (70–85%)",
      C: "Average (55–70%)",
      D: "Below average (below 55%)"
    }
  },
  {
    id: "Q2",
    section: "Academic Readiness",
    question: "What is your English proficiency level?",
    options: {
      A: "Fluent in academic and conversational use",
      B: "Good, but need improvement in academic writing",
      C: "Understandable but limited",
      D: "Weak, needs strong improvement"
    }
  },

  // Section 2: Career & Goal Alignment (2 Questions)
  {
    id: "Q3",
    section: "Career & Goal Alignment",
    question: "Do you have clear long-term career goals?",
    options: {
      A: "Very clear",
      B: "Somewhat clear",
      C: "Vague",
      D: "No clarity"
    }
  },
  {
    id: "Q4",
    section: "Career & Goal Alignment",
    question: "Is your intended course aligned with your career goals?",
    options: {
      A: "Strongly aligned",
      B: "Somewhat aligned",
      C: "Unclear",
      D: "Not aligned"
    }
  },

  // Section 3: Financial Planning (2 Questions)
  {
    id: "Q5",
    section: "Financial Planning",
    question: "How prepared are you with tuition + living cost estimation?",
    options: {
      A: "Fully calculated",
      B: "Partially calculated",
      C: "Rough idea",
      D: "No idea"
    }
  },
  {
    id: "Q6",
    section: "Financial Planning",
    question: "What is your primary funding source?",
    options: {
      A: "Family savings",
      B: "Education loan",
      C: "Scholarship/grants",
      D: "Not planned yet"
    }
  },

  // Section 4: Personal & Cultural Readiness (2 Questions)
  {
    id: "Q7",
    section: "Personal & Cultural Readiness",
    question: "How adaptable are you to new cultures and lifestyles?",
    options: {
      A: "Very adaptable",
      B: "Adaptable",
      C: "Somewhat adaptable",
      D: "Struggle to adapt"
    }
  },
  {
    id: "Q8",
    section: "Personal & Cultural Readiness",
    question: "How independent are you in daily living (cooking, budgeting, self-care)?",
    options: {
      A: "Fully independent",
      B: "Mostly independent",
      C: "Somewhat dependent",
      D: "Dependent"
    }
  },

  // Section 5: Practical Readiness (2 Questions)
  {
    id: "Q9",
    section: "Practical Readiness",
    question: "How prepared are you with visa documentation?",
    options: {
      A: "Fully prepared",
      B: "Somewhat",
      C: "Minimal",
      D: "Not prepared"
    }
  },
  {
    id: "Q10",
    section: "Practical Readiness",
    question: "How comfortable are you with digital/online tools?",
    options: {
      A: "Very comfortable",
      B: "Comfortable",
      C: "Somewhat comfortable",
      D: "Uncomfortable"
    }
  },

  // Section 6: Support System (2 Questions)
  {
    id: "Q11",
    section: "Support System",
    question: "Do your parents/family fully support your study abroad decision?",
    options: {
      A: "Strongly support",
      B: "Support with concerns",
      C: "Unsure",
      D: "Do not support"
    }
  },
  {
    id: "Q12",
    section: "Support System",
    question: "How aligned are your parents' expectations with yours?",
    options: {
      A: "Strongly aligned",
      B: "Somewhat aligned",
      C: "Slightly aligned",
      D: "Not aligned"
    }
  }
];

export default function UltraQuickSurvey() {
  const [step, setStep] = useState<'info' | 'survey' | 'completed'>('info');
  const [userInfo, setUserInfo] = useState<UserInfo>({ email: '', mobile: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

  const currentQuestion = ultraQuickQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / ultraQuickQuestions.length) * 100;

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.email && userInfo.mobile) {
      setStep('survey');
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setCurrentAnswer(answer);
  };

  const handleNext = () => {
    if (currentAnswer) {
      const newResponse: Response = {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        section: currentQuestion.section
      };

      const updatedResponses = [...responses, newResponse];
      setResponses(updatedResponses);

      if (currentQuestionIndex < ultraQuickQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
      } else {
        // Survey completed - save to localStorage
        const surveyData = {
          userInfo,
          responses: updatedResponses,
          completedAt: new Date().toISOString(),
          testType: 'Ultra-Quick Study Abroad Readiness Assessment'
        };
        
        localStorage.setItem('ultraQuickSurvey', JSON.stringify(surveyData));
        setStep('completed');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Find previous answer
      const prevResponse = responses.find(r => r.questionId === ultraQuickQuestions[currentQuestionIndex - 1].id);
      setCurrentAnswer(prevResponse?.answer || '');
      // Remove the current question's response if it exists
      setResponses(responses.filter(r => r.questionId !== currentQuestion.id));
    }
  };

  if (step === 'info') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Ultra-Quick Assessment
            </CardTitle>
            <CardDescription className="text-center">
              Fast snapshot check - 12 questions covering all categories (3-5 minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={userInfo.mobile}
                  onChange={(e) => setUserInfo({...userInfo, mobile: e.target.value})}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                Start Ultra-Quick Assessment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'completed') {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Ultra-Quick Assessment Completed!
              </h2>
              <p className="text-lg text-muted-foreground">
                Thank you for completing the Ultra-Quick Study Abroad Readiness Assessment. Your snapshot has been saved.
              </p>
              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Total Questions:</strong> {ultraQuickQuestions.length}<br />
                  <strong>Completed At:</strong> {new Date().toLocaleString()}<br />
                  <strong>Email:</strong> {userInfo.email}<br />
                  <strong>Assessment Type:</strong> Ultra-Quick Track (12 Questions)<br />
                  <strong>Readiness Score:</strong> Snapshot generated ✓
                </p>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                Take Another Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{currentQuestion.section}</h2>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {ultraQuickQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="text-center text-sm text-muted-foreground">
              Ultra-Quick Track • Estimated time: 3-5 minutes • Snapshot Readiness Score
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.id}. {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerSelect}>
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={key} id={`${currentQuestion.id}-${key}`} />
                <Label 
                  htmlFor={`${currentQuestion.id}-${key}`} 
                  className="flex-1 cursor-pointer text-sm leading-relaxed"
                >
                  <span className="font-medium">{key})</span> {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!currentAnswer}
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        >
          {currentQuestionIndex === ultraQuickQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
        </Button>
      </div>
    </div>
  );
}