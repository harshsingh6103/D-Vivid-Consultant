import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface StudentData {
  userName: string
  overallScore: number
  topicScoresArray: Array<{
    name: string
    correct: number
    total: number
  }>
}

interface LLMResponse {
  studentName: string
  studentEmail: string
  studentClass: string
  studentSchool: string
  score: number
  maxScore: number
  totalTime: number
  topics: Array<{
    name: string
    correct: number
    total: number
  }>
  careerInterests: Array<{
    name: string
    score: number
  }>
  aptitudeScores: Array<{
    name: string
    score: number
  }>
  skills: Array<{
    name: string
    score: number
  }>
  academicRecommendations: string[]
  examRecommendations: string[]
  upskillingRecommendations: string[]
  extracurricularRecommendations: string[]
  analysis: {
    readinessBand: string
    overallAssessment: string
    strengths: string[]
    weaknesses: string[]
    specificRecommendations: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Analyze-results API called');
    const studentData: StudentData = await request.json()
    console.log('📥 Received student data:', JSON.stringify(studentData, null, 2));
    
    // Validate required fields
    if (!studentData.userName || typeof studentData.overallScore !== 'number') {
      console.error('❌ Invalid student data received')
      return NextResponse.json({ error: 'Invalid student data' }, { status: 400 })
    }
    
    // Check if API key is available
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY not found in environment variables');
      throw new Error('OPENROUTER_API_KEY not configured');
    }
    console.log('✅ OPENROUTER_API_KEY found:', apiKey.substring(0, 10) + '...');
    console.log('🔑 Full API key length:', apiKey.length);
    
    // Prepare the prompts
      const systemPrompt = `You are a Study Abroad Counselor specializing in international education readiness assessment. Analyze student scores and generate a comprehensive JSON report.

STUDY ABROAD READINESS BANDS:
- 90-100: Excellent - Highly prepared for competitive international programs
- 80-89: Very Good - Well-prepared with minor areas for improvement
- 70-79: Good - Moderately prepared, some areas need strengthening
- 60-69: Satisfactory - Basic readiness, significant preparation needed
- <60: Needs Improvement - Requires substantial preparation before study abroad

ASSESSMENT AREAS:
- Academic Readiness: Language skills, learning style, research abilities, motivation, stress management
- Cultural Adaptability: Social skills, cultural openness, language adaptability, openness to experience, emotional independence
- Career Clarity: Career goals, work environment preferences, international career importance, professional motivation
- Study Abroad Readiness: Financial planning, motivation, home connections, challenge awareness, contribution mindset

Generate JSON with these exact fields:
- careerInterests: [{"name":"Research & Academia","score":X}, {"name":"Technology & Innovation","score":X}, {"name":"Business & Management","score":X}, {"name":"Healthcare & Medicine","score":X}]
- aptitudeScores: [{"name":"Academic Readiness","score":X}, {"name":"Cultural Adaptability","score":X}, {"name":"Career Clarity","score":X}, {"name":"Study Abroad Readiness","score":X}]
- skills: [{"name":"Cultural Adaptability","score":X}, {"name":"Language Learning","score":X}, {"name":"Financial Planning","score":X}, {"name":"Goal Setting","score":X}]
- analysis: {"readinessBand":"X", "overallAssessment":"text", "strengths":["text"], "weaknesses":["text"], "specificRecommendations":["text"]}

Focus on study abroad readiness, cultural adaptability, and international education preparation. ONLY output JSON.`

      const userPrompt = `Student: ${studentData.userName}
Overall Study Abroad Readiness Score: ${studentData.overallScore}/100

Assessment Results:
${studentData.topicScoresArray.map(topic => `- ${topic.name}: ${topic.correct}/100`).join('\n')}

Please analyze this student's readiness for international education and provide:
1. Readiness band assessment
2. Strengths and areas for improvement
3. Specific recommendations for study abroad preparation
4. Career interest alignment
5. Skills development priorities

Generate comprehensive JSON report focusing on study abroad readiness.`

    // Try Gemini API with fallback to mock data
    let generatedText = '';
    let modelUsed = 'fallback';
    
    try {
      console.log('🌐 Attempting OpenRouter API call...');
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://dvividconsultant.com", // Optional, for analytics
          "X-Title": "D-Vivid Consultant Study Abroad Assessment", // Optional, for analytics
        },
        timeout: 10000, // 10 second timeout
      });

      // Try multiple fast models in sequence with timeout
      const models = [
        "meta-llama/llama-3.2-3b-instruct:free",
        "microsoft/phi-3-mini-128k-instruct:free",
        "google/gemma-2-2b-it:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "microsoft/phi-3-mini-4k-instruct:free"
      ];
      
      let completion: any = null;
      for (const model of models) {
        try {
          console.log(`🔄 Trying model: ${model}`);
          
          // Add timeout for each model attempt
          const modelPromise = openai.chat.completions.create({
            model: model,
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user", 
                content: userPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1024,
          });
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Model timeout')), 5000)
          );
          
          completion = await Promise.race([modelPromise, timeoutPromise]);
          console.log(`✅ Success with model: ${model}`);
          break;
        } catch (modelError: any) {
          console.log(`❌ Model ${model} failed:`, modelError.message);
          console.log(`❌ Model ${model} error details:`, modelError);
          continue;
        }
      }
      
      if (!completion) {
        throw new Error('All models failed');
      }

      generatedText = completion.choices[0]?.message?.content || '';
      modelUsed = 'phi-3-mini-128k-instruct:free';
      console.log('✅ OpenRouter API success!');
      console.log('📝 Generated text length:', generatedText.length);
      console.log('📝 Generated text preview:', generatedText.substring(0, 200) + '...');
      
    } catch (error: any) {
      console.log('❌ OpenRouter API failed, using fallback data');
      console.log('Error:', error.message);
      
            // Generate intelligent fallback data based on student performance
            const readinessBand = studentData.overallScore >= 90 ? 'Excellent' : 
                                 studentData.overallScore >= 80 ? 'Very Good' :
                                 studentData.overallScore >= 70 ? 'Good' :
                                 studentData.overallScore >= 60 ? 'Satisfactory' : 'Needs Improvement';
            
            // Generate scores based on actual performance
            const baseScore = Math.max(1, Math.floor(studentData.overallScore / 10));
            const variation = 2;
            
            generatedText = JSON.stringify({
              studentName: studentData.userName,
              studentEmail: 'student@example.com',
              studentClass: '12',
              studentSchool: 'Sample School',
              score: studentData.overallScore,
              maxScore: 100,
              totalTime: 45,
              topics: studentData.topicScoresArray,
              careerInterests: [
                { name: 'Research & Academia', score: Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variation))) },
                { name: 'Technology & Innovation', score: Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variation))) },
                { name: 'Business & Management', score: Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variation))) },
                { name: 'Healthcare & Medicine', score: Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variation))) }
              ],
              aptitudeScores: [
                { name: 'Academic Readiness', score: Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variation))) },
                { name: 'Cultural Adaptability', score: Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variation))) },
                { name: 'Career Clarity', score: Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variation))) },
                { name: 'Study Abroad Readiness', score: Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variation))) }
              ],
              skills: [
                { name: 'Cultural Adaptability', score: Math.max(20, Math.min(100, studentData.overallScore + Math.floor(Math.random() * 20))) },
                { name: 'Language Learning', score: Math.max(20, Math.min(100, studentData.overallScore + Math.floor(Math.random() * 20))) },
                { name: 'Financial Planning', score: Math.max(20, Math.min(100, studentData.overallScore + Math.floor(Math.random() * 20))) },
                { name: 'Goal Setting', score: Math.max(20, Math.min(100, studentData.overallScore + Math.floor(Math.random() * 20))) }
              ],
              academicRecommendations: ['Advanced English Literature', 'Research Methodology', 'Cross-Cultural Studies'],
              examRecommendations: ['IELTS', 'TOEFL', 'SAT', 'GRE'],
              upskillingRecommendations: ['Cross-Cultural Communication', 'Language Training', 'Financial Planning'],
              extracurricularRecommendations: ['International Student Exchange', 'Cultural Clubs', 'Study Groups'],
              analysis: {
                readinessBand: readinessBand,
                overallAssessment: `Based on your study abroad readiness score of ${studentData.overallScore}, you demonstrate ${readinessBand.toLowerCase()} preparedness for international education.`,
                strengths: studentData.overallScore >= 70 ? 
                  ['Strong academic foundation', 'Good cultural adaptability', 'Clear career goals'] :
                  ['Potential for growth', 'Willingness to learn', 'Basic academic skills'],
                weaknesses: studentData.overallScore < 70 ?
                  ['Language skills need improvement', 'Cultural adaptability requires development', 'Financial planning needs attention'] :
                  ['Communication skills', 'Leadership development', 'Advanced preparation'],
                specificRecommendations: studentData.overallScore < 70 ?
                  ['Focus on language skills development', 'Build cultural awareness', 'Improve financial planning', 'Strengthen academic foundation'] :
                  ['Enhance communication skills', 'Develop leadership qualities', 'Prepare for standardized tests', 'Build international experience']
              }
            });
    }

    // Parse the JSON response from Gemini
    let llmResult: LLMResponse
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        llmResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in Gemini response')
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', generatedText)
      
      // Fallback to basic structure if parsing fails
      llmResult = {
        studentName: studentData.userName,
        studentEmail: '',
        studentClass: '',
        studentSchool: '',
        score: studentData.overallScore,
        maxScore: 100,
        totalTime: 0,
        topics: studentData.topicScoresArray,
        careerInterests: [
          { name: 'Data Science', score: Math.floor(Math.random() * 4) + 6 },
          { name: 'Engineering', score: Math.floor(Math.random() * 4) + 6 },
          { name: 'Management', score: Math.floor(Math.random() * 4) + 6 }
        ],
        aptitudeScores: [
          { name: 'Numerical Aptitude', score: Math.floor(Math.random() * 4) + 6 },
          { name: 'Verbal Reasoning', score: Math.floor(Math.random() * 4) + 6 },
          { name: 'Problem Solving', score: Math.floor(Math.random() * 4) + 6 }
        ],
        skills: [
          { name: 'Leadership', score: Math.floor(Math.random() * 20) + 70 },
          { name: 'Communication', score: Math.floor(Math.random() * 20) + 70 },
          { name: 'Time Management', score: Math.floor(Math.random() * 20) + 70 }
        ],
        academicRecommendations: ['Advanced Mathematics', 'Computer Science', 'Business Studies'],
        examRecommendations: ['SAT', 'ACT', 'IELTS'],
        upskillingRecommendations: ['Programming', 'Data Analysis', 'Project Management'],
        extracurricularRecommendations: ['Student Council', 'Tech Club', 'Volunteer Work'],
        analysis: {
          readinessBand: studentData.overallScore >= 90 ? 'Excellent' : 
                        studentData.overallScore >= 80 ? 'Very Good' :
                        studentData.overallScore >= 70 ? 'Good' :
                        studentData.overallScore >= 60 ? 'Satisfactory' : 'Weak',
          overallAssessment: 'AI analysis temporarily unavailable',
          strengths: ['Strong analytical skills', 'Good problem-solving ability'],
          weaknesses: ['Needs improvement in communication', 'Time management skills'],
          specificRecommendations: ['Focus on communication skills', 'Improve time management']
        }
      }
    }

    return NextResponse.json(llmResult)
    
  } catch (error: any) {
    console.error('❌ Error in analyze-results API:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json({ 
      error: 'Failed to analyze results',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
