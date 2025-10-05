import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const results = await request.json()
    console.log('📄 PDF Generation - Received data:', JSON.stringify(results, null, 2))
    
    // Validate required fields
    if (!results.studentName) {
      console.error('❌ Missing studentName in PDF data')
      return NextResponse.json({ error: 'Missing student name' }, { status: 400 })
    }
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // Generate HTML content for the PDF
    const htmlContent = generateHTMLContent(results)
    console.log('📄 Generated HTML content length:', htmlContent.length)
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    console.log('📄 Page content loaded successfully')
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    })
    
    console.log('📄 PDF generated, buffer size:', pdfBuffer.length)
    
    // Validate PDF buffer
    if (pdfBuffer.length === 0) {
      console.error('❌ PDF buffer is empty');
      await browser.close();
      return NextResponse.json({ error: 'PDF generation failed - empty buffer' }, { status: 500 });
    }
    
    await browser.close()
    
    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="psychometric-report-${results.studentName.replace(/\s+/g, '-').toLowerCase()}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

function generateHTMLContent(results: any): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Psychometric Assessment Report</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
            }
            
            .chart-container {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #003B8C;
            }
            
            .chart-title {
                font-size: 18px;
                font-weight: bold;
                color: #003B8C;
                margin-bottom: 15px;
            }
            
            .bar-chart {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .bar-label {
                width: 150px;
                font-weight: 500;
                color: #555;
            }
            
            .bar-container {
                flex: 1;
                height: 25px;
                background: #e9ecef;
                border-radius: 12px;
                margin: 0 10px;
                overflow: hidden;
                position: relative;
            }
            
            .bar-fill {
                height: 100%;
                border-radius: 12px;
                transition: width 0.3s ease;
                position: relative;
            }
            
            .bar-fill.excellent { background: linear-gradient(90deg, #22C55E, #16A34A); }
            .bar-fill.good { background: linear-gradient(90deg, #3B82F6, #2563EB); }
            .bar-fill.average { background: linear-gradient(90deg, #F59E0B, #D97706); }
            .bar-fill.weak { background: linear-gradient(90deg, #EF4444, #DC2626); }
            
            .bar-value {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: white;
                font-weight: bold;
                font-size: 12px;
            }
            
            .radar-chart {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 20px 0;
            }
            
            .radar-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border: 2px solid #e9ecef;
                text-align: center;
            }
            
            .radar-score {
                font-size: 24px;
                font-weight: bold;
                color: #003B8C;
                margin-bottom: 5px;
            }
            
            .radar-label {
                font-size: 14px;
                color: #666;
            }
            
            .improvement-areas {
                background: linear-gradient(135deg, #FFF3CD, #FEF3C7);
                border: 2px solid #F59E0B;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .strength-areas {
                background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
                border: 2px solid #22C55E;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                margin-bottom: 30px;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 20px;
            }
            
            .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
            }
            
            .section-header {
                background: #f8f9fa;
                padding: 15px 20px;
                border-left: 4px solid #667eea;
                font-size: 1.3em;
                font-weight: bold;
                margin-bottom: 20px;
            }
            
            .section-content {
                padding: 0 20px;
            }
            
            .student-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .info-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            
            .info-label {
                font-weight: bold;
                color: #666;
                margin-bottom: 5px;
            }
            
            .info-value {
                font-size: 1.1em;
                color: #333;
            }
            
            .score-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .score-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }
            
            .score-card h3 {
                font-size: 2em;
                margin-bottom: 5px;
            }
            
            .score-card p {
                opacity: 0.9;
            }
            
            .topics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .topic-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #28a745;
            }
            
            .topic-name {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .topic-score {
                color: #666;
                font-size: 0.9em;
            }
            
            .recommendations {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
            }
            
            .recommendation-category {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #17a2b8;
            }
            
            .recommendation-category h4 {
                color: #333;
                margin-bottom: 15px;
                font-size: 1.1em;
            }
            
            .recommendation-list {
                list-style: none;
                padding: 0;
            }
            
            .recommendation-list li {
                background: white;
                margin-bottom: 8px;
                padding: 10px 15px;
                border-radius: 5px;
                border-left: 3px solid #17a2b8;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .analysis-summary {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .readiness-band {
                text-align: center;
                margin-bottom: 20px;
                padding: 15px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
            }
            
            .readiness-band h4 {
                font-size: 1.2em;
                margin-bottom: 10px;
            }
            
            .strengths-weaknesses {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .strengths, .weaknesses {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            
            .weaknesses {
                border-left-color: #e74c3c;
            }
            
            .specific-recommendations {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #27ae60;
            }
            
            .footer {
                margin-top: 50px;
                padding: 20px;
                background: #f8f9fa;
                text-align: center;
                color: #666;
                border-top: 2px solid #667eea;
            }
            
            .footer .date {
                font-weight: bold;
                color: #333;
                margin-top: 10px;
            }
            
            @media print {
                body { -webkit-print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #003B8C, #5BE49B); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 25px; box-shadow: 0 4px 12px rgba(0,59,140,0.3);">
                    <span style="color: white; font-weight: bold; font-size: 32px;">DV</span>
                </div>
                <div>
                    <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">D-Vivid Consultant</h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 500;">Strategic Counselling Circle</p>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Your Gateway to Global Education</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <h2 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Psychometric Assessment Report</h2>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">Comprehensive Study Abroad Readiness Analysis</p>
                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
                    <p style="margin: 0; color: white; font-size: 16px; font-weight: 500;">📊 AI-Powered Analysis • 🎯 Personalized Recommendations • 🌍 Global Readiness Assessment</p>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div class="section">
                <div class="section-header">Student Information</div>
                <div class="section-content">
                    <div class="student-info">
                        <div class="info-item">
                            <div class="info-label">Student Name</div>
                            <div class="info-value">${results.studentName}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value">${results.studentEmail}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Class</div>
                            <div class="info-value">${results.studentClass}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">School</div>
                            <div class="info-value">${results.studentSchool}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">Assessment Summary</div>
                <div class="section-content">
                    <div class="score-summary">
                        <div class="score-card">
                            <h3>${results.score}</h3>
                            <p>Total Score</p>
                        </div>
                        <div class="score-card">
                            <h3>${results.maxScore}</h3>
                            <p>Maximum Score</p>
                        </div>
                        <div class="score-card">
                            <h3>${Math.round((results.score / results.maxScore) * 100)}%</h3>
                            <p>Percentage</p>
                        </div>
                        <div class="score-card">
                            <h3>${results.totalTime}</h3>
                            <p>Minutes Taken</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">📊 Detailed Performance Analysis</div>
                <div class="section-content">
                    <div class="chart-container">
                        <div class="chart-title">Academic Performance Breakdown</div>
                        ${results.topics.map((topic: any) => {
                            const percentage = Math.round((topic.correct / topic.total) * 100);
                            const barClass = percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : percentage >= 40 ? 'average' : 'weak';
                            return `
                                <div class="bar-chart">
                                    <div class="bar-label">${topic.name}</div>
                                    <div class="bar-container">
                                        <div class="bar-fill ${barClass}" style="width: ${percentage}%">
                                            <div class="bar-value">${percentage}%</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">Skills Assessment Overview</div>
                        <div class="radar-chart">
                            ${results.skills.map((skill: any) => `
                                <div class="radar-item">
                                    <div class="radar-score">${skill.score}%</div>
                                    <div class="radar-label">${skill.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">Career Interest Alignment</div>
                        ${results.careerInterests.map((interest: any) => {
                            const percentage = Math.round((interest.score / 10) * 100);
                            const barClass = percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : percentage >= 40 ? 'average' : 'weak';
                            return `
                                <div class="bar-chart">
                                    <div class="bar-label">${interest.name}</div>
                                    <div class="bar-container">
                                        <div class="bar-fill ${barClass}" style="width: ${percentage}%">
                                            <div class="bar-value">${interest.score}/10</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            ${results.analysis ? `
            <div class="section">
                <div class="section-header">🤖 AI-Powered Analysis & Insights</div>
                <div class="section-content">
                    <div class="analysis-summary">
                        <div class="readiness-band">
                            <h4>🎯 Readiness Band: ${results.analysis.readinessBand}</h4>
                            <p>${results.analysis.overallAssessment}</p>
                        </div>
                        
                        <div class="strength-areas">
                            <h4>💪 Your Key Strengths</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
                                ${results.analysis.strengths.map((strength: string, index: number) => `
                                    <div style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #22C55E;">
                                        <div style="font-weight: 600; color: #16A34A;">${index + 1}. ${strength}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="improvement-areas">
                            <h4>🎯 Focus Areas for Development</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
                                ${results.analysis.weaknesses.map((weakness: string, index: number) => `
                                    <div style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #F59E0B;">
                                        <div style="font-weight: 600; color: #D97706;">${index + 1}. ${weakness}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #E0E7FF, #C7D2FE); border: 2px solid #6366F1; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <h4 style="color: #4F46E5; margin-bottom: 15px;">🎯 Strategic Action Plan</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                ${results.analysis.specificRecommendations.map((rec: string, index: number) => `
                                    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #E5E7EB;">
                                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                            <div style="width: 24px; height: 24px; background: #6366F1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 10px;">${index + 1}</div>
                                            <div style="font-weight: 600; color: #374151;">Priority ${index + 1}</div>
                                        </div>
                                        <div style="color: #6B7280; font-size: 14px;">${rec}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-header">🎯 Personalized Study Abroad Roadmap</div>
                <div class="section-content">
                    <div class="recommendations">
                        <div class="recommendation-category" style="background: linear-gradient(135deg, #F0F9FF, #E0F2FE); border: 2px solid #0EA5E9; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                            <h4 style="color: #0369A1; font-size: 20px; margin-bottom: 15px; display: flex; align-items: center;">
                                📚 Academic Excellence Track
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                ${results.academicRecommendations.map((rec: string, index: number) => `
                                    <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #0EA5E9; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                        <div style="font-weight: 600; color: #0369A1;">${rec}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="recommendation-category" style="background: linear-gradient(135deg, #F0FDF4, #DCFCE7); border: 2px solid #22C55E; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                            <h4 style="color: #15803D; font-size: 20px; margin-bottom: 15px; display: flex; align-items: center;">
                                🎓 Standardized Testing Strategy
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                ${results.examRecommendations.map((rec: string, index: number) => `
                                    <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #22C55E; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                        <div style="font-weight: 600; color: #15803D;">${rec}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="recommendation-category" style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border: 2px solid #F59E0B; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                            <h4 style="color: #D97706; font-size: 20px; margin-bottom: 15px; display: flex; align-items: center;">
                                🚀 Skill Development Program
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                ${results.upskillingRecommendations.map((rec: string, index: number) => `
                                    <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #F59E0B; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                        <div style="font-weight: 600; color: #D97706;">${rec}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="recommendation-category" style="background: linear-gradient(135deg, #F3E8FF, #E9D5FF); border: 2px solid #A855F7; border-radius: 12px; padding: 25px;">
                            <h4 style="color: #7C3AED; font-size: 20px; margin-bottom: 15px; display: flex; align-items: center;">
                                🌟 Leadership & Experience Building
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                ${results.extracurricularRecommendations.map((rec: string, index: number) => `
                                    <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #A855F7; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                        <div style="font-weight: 600; color: #7C3AED;">${rec}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer" style="background: linear-gradient(135deg, #003B8C, #5BE49B); color: white; padding: 30px; text-align: center; margin-top: 40px;">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                        <span style="color: white; font-weight: bold; font-size: 20px;">DV</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">D-Vivid Consultant</h3>
                        <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Strategic Counselling Circle</p>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 500;">📧 info@dvividconsultant.com | 📞 +91 98765 43210 | 📍 Surat, Gujarat, India</p>
                    <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8);">Your Gateway to Global Education</p>
                </div>
                <p style="margin: 20px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">This comprehensive report was generated on ${currentDate}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.7);">© 2024 D-Vivid Consultant. All rights reserved. | Powered by AI Technology</p>
            </div>
        </div>
    </body>
    </html>
  `
}
