import React, { useState, useEffect } from 'react';
import { Target, Skull, Cloud, Eye, Shield, Search, ArrowRight, Map, CheckCircle2, Rocket, Coffee, BookOpen, Clock, Lock, Award } from 'lucide-react';
import './RoadmapPage.css';

import PageHeader from '../components/PageHeader';

const ROLES = [
  {
    id: 'appsec',
    title: 'AppSec Engineer',
    icon: Target,
    desc: 'Secure software from the inside. Work with dev teams to build security into code.',
    salary: '₹12-22 LPA India | AED 15k Dubai',
    stats: {
      india: '₹12-22 LPA',
      dubai: 'AED 14,000-20,000',
      timeToJob: '6-10 months',
      demand: 'Very High demand'
    }
  },
  {
    id: 'pentester',
    title: 'Penetration Tester',
    icon: Skull,
    desc: 'Get paid to hack. Find vulnerabilities before attackers do.',
    salary: '₹8-18 LPA India | AED 12k Dubai',
    stats: {
      india: '₹8-18 LPA',
      dubai: 'AED 12,000-18,000',
      timeToJob: '8-12 months',
      demand: 'High demand'
    }
  },
  {
    id: 'cloudsec',
    title: 'Cloud Security Engineer',
    icon: Cloud,
    desc: 'Secure AWS, Azure and GCP. The highest demand role of 2025.',
    salary: '₹14-25 LPA India | AED 18k Dubai',
    stats: {
      india: '₹14-25 LPA',
      dubai: 'AED 18,000-25,000',
      timeToJob: '6-9 months',
      demand: 'Extreme demand'
    }
  },
  {
    id: 'soc',
    title: 'SOC Analyst',
    icon: Eye,
    desc: 'Monitor, detect and respond to threats in real time. The entry point for many.',
    salary: '₹5-12 LPA India | AED 8k Dubai',
    stats: {
      india: '₹5-12 LPA',
      dubai: 'AED 8,000-12,000',
      timeToJob: '3-6 months',
      demand: 'High demand'
    }
  },
  {
    id: 'redteam',
    title: 'Red Team Operator',
    icon: Shield,
    desc: 'Advanced offensive security. Full attack simulations for enterprises.',
    salary: '₹15-30 LPA India | AED 20k Dubai',
    stats: {
      india: '₹15-30 LPA',
      dubai: 'AED 20,000-30,000',
      timeToJob: '12-18 months',
      demand: 'Medium demand'
    }
  },
  {
    id: 'dfir',
    title: 'DFIR Analyst',
    icon: Search,
    desc: 'Investigate breaches, recover evidence, respond to incidents.',
    salary: '₹8-16 LPA India | AED 12k Dubai',
    stats: {
      india: '₹8-16 LPA',
      dubai: 'AED 12,000-16,000',
      timeToJob: '8-12 months',
      demand: 'High demand'
    }
  },
];

const LEVELS = [
  { id: 'beginner', title: 'Complete beginner', desc: 'I am new to IT and Cybersecurity.' },
  { id: 'it_pro', title: 'IT Professional', desc: 'I have some IT/networking experience.' },
  { id: 'developer', title: 'Developer', desc: 'I write code and know how apps work.' }
];

const TIMES = [
  { id: '1hour', title: '1 hour / day', desc: 'Before college or after dinner. Perfect for students with lectures. 5-7 days/week.', eta: '~20 weeks to job-ready', icon: Coffee },
  { id: '2hours', title: '2 hours / day', desc: 'Dedicated learning sessions. One module per week roughly. Best balance.', eta: '~12 weeks to job-ready', icon: BookOpen },
  { id: 'fulltime', title: 'Full time', desc: 'Bootcamp mode — all in. Complete the path in half the time. Unemployed or on break.', eta: '~8 weeks to job-ready', icon: Rocket }
];

const STEPS = [
  { id: 1, label: 'Your goal' },
  { id: 2, label: 'Current level' },
  { id: 3, label: 'Time available' },
  { id: 4, label: 'Your roadmap', icon: Map },
];

const RoadmapPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadingStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setTimeout(() => {
          setIsGenerating(false);
          setCurrentStep(4);
        }, 800);
      }
    }, 600);
  };

  const activeRole = ROLES.find(r => r.id === selectedRole);
  const activeLevel = LEVELS.find(l => l.id === selectedLevel);
  const activeTime = TIMES.find(t => t.id === selectedTime);

  return (
    <div className="roadmap-page">
      {/* Dark Hero Section */}
      <section className="roadmap-hero">
        <PageHeader 
          eyebrow="ROADMAP" 
          title="Your cybersecurity roadmap in 60 seconds" 
          subtitle="Tell us your goal and current skills. We will build a step-by-step learning path, timeline and certification guide just for you." 
        />
      </section>

      {/* Stepper Section */}
      <div className="stepper-wrapper">
        <div className="stepper-container">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id || (currentStep === 4 && step.id === 4);
            const Icon = step.icon;

            return (
              <div className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} key={step.id}>
                <div className="step-circle">
                  {isCompleted ? <CheckCircle2 size={20} className="check-icon" /> : (Icon && step.id === 4 ? <Icon size={16} /> : step.id)}
                </div>
                <span className="step-label">{step.id === 4 && isCompleted ? 'Completed' : step.label}</span>
                {idx < STEPS.length - 1 && <div className="step-connector"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      <section className="roadmap-content-section">
        
        {/* Loading State */}
        {isGenerating && (
          <div className="loading-roadmap">
            <Rocket size={48} className="rocket-icon" />
            <h2>Building your personalised roadmap...</h2>
            <p>Mapping your goal, skills and time into a step-by-step plan</p>
            
            <div className="loading-checklist">
              <div className={`check-item ${loadingStep >= 1 ? 'done' : ''}`}>
                <span className="box">{loadingStep >= 1 && <CheckCircle2 size={16} />}</span>
                Analysing your goal...
              </div>
              <div className={`check-item ${loadingStep >= 2 ? 'done' : ''}`}>
                <span className="box">{loadingStep >= 2 && <CheckCircle2 size={16} />}</span>
                Calculating your learning path...
              </div>
              <div className={`check-item ${loadingStep >= 3 ? 'done' : ''}`}>
                <span className="box">{loadingStep >= 3 && <CheckCircle2 size={16} />}</span>
                Mapping course sequence...
              </div>
              <div className={`check-item ${loadingStep >= 4 ? 'done' : ''}`}>
                <span className="box">{loadingStep >= 4 && <CheckCircle2 size={16} />}</span>
                Adjusting for your experience...
              </div>
              <div className={`check-item ${loadingStep >= 5 ? 'done' : ''}`}>
                <span className="box">{loadingStep >= 5 && <CheckCircle2 size={16} />}</span>
                Generating your timeline...
              </div>
            </div>
          </div>
        )}

        {!isGenerating && currentStep === 1 && (
          <div className="step-content animate-in">
            <div className="step-header">
              <h2>What do you want to become?</h2>
              <p>Pick the role that excites you most. Don't overthink it, you can always change direction later.</p>
            </div>

            <div className="roles-grid">
              {ROLES.map((role) => (
                <div
                  key={role.id}
                  className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="role-icon-wrapper">
                    <role.icon size={28} className="role-icon" />
                  </div>
                  <h3>{role.title}</h3>
                  <p>{role.desc}</p>
                  <div className="role-salary">{role.salary}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isGenerating && currentStep === 2 && (
          <div className="step-content animate-in">
            <div className="step-header">
              <span className="step-badge">STEP 2 OF 3</span>
              <h2>What is your current experience level?</h2>
              <p>Tell us where you are starting from so we can tailor the fundamentals.</p>
            </div>
            
            <div className="selection-grid">
              {LEVELS.map((level) => (
                <div
                  key={level.id}
                  className={`selection-card ${selectedLevel === level.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLevel(level.id)}
                >
                  {selectedLevel === level.id && <div className="selected-check"><CheckCircle2 size={18} /></div>}
                  <h3>{level.title}</h3>
                  <p>{level.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isGenerating && currentStep === 3 && (
          <div className="step-content animate-in">
            <div className="step-header">
              <span className="step-badge">STEP 3 OF 3</span>
              <h2>How much time can you give daily?</h2>
              <p>We adjust your timeline based on this. Consistency matters more than speed — even 1 hour a day gets you job-ready.</p>
            </div>
            
            <div className="selection-grid time-grid">
              {TIMES.map((time) => (
                <div
                  key={time.id}
                  className={`selection-card ${selectedTime === time.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time.id)}
                >
                  {selectedTime === time.id && <div className="selected-check"><CheckCircle2 size={18} /></div>}
                  <div className="card-icon"><time.icon size={32} /></div>
                  <h3>{time.title}</h3>
                  <p className="time-subtitle">{time.desc}</p>
                  <div className="time-eta">{time.eta}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isGenerating && currentStep === 4 && activeRole && (
          <div className="generated-roadmap animate-in">
            {/* Header Card */}
            <div className="roadmap-header-card">
              <div className="header-top">
                <span className="eyebrow">YOUR PERSONALISED ROADMAP</span>
                <button className="start-over-btn" onClick={() => setCurrentStep(1)}>Start over</button>
              </div>
              <h1>{activeRole.title} Roadmap</h1>
              <p>{activeRole.desc}</p>
              
              <div className="header-pills">
                <span className="pill dark">~{activeTime?.id === 'fulltime' ? '8' : activeTime?.id === '2hours' ? '12' : '20'} weeks</span>
                <span className="pill dark">{activeRole.stats.demand}</span>
                <span className="pill dark">{activeRole.stats.india}</span>
                <span className="pill dark">Dubai: {activeRole.stats.dubai}/mo</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="roadmap-stats-grid">
              <div className="stat-box">
                <span className="stat-label">YOUR GOAL</span>
                <span className="stat-value">{activeRole.title}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">CURRENT LEVEL</span>
                <span className="stat-value">{activeLevel?.title}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">TIME PER DAY</span>
                <span className="stat-value">{activeTime?.title}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">TARGET ROLE</span>
                <span className="stat-value">{activeRole.title}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">INDIA SALARY</span>
                <span className="stat-value highlight-green">{activeRole.stats.india}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">DUBAI SALARY</span>
                <span className="stat-value highlight-purple">{activeRole.stats.dubai}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">FIRST JOB IN</span>
                <span className="stat-value">{activeRole.stats.timeToJob}</span>
              </div>
            </div>

            <h3 className="section-title">Your step-by-step learning path</h3>
            
            {/* Timeline */}
            <div className="timeline-container">
              
              <div className="timeline-item current">
                <div className="node"><div className="inner-node"></div></div>
                <div className="content">
                  <span className="week-label">WEEK 1-2 <span className="you-are-here">YOU ARE HERE</span></span>
                  <h4>Cybersecurity Fundamentals</h4>
                  <p>Networking, how the web works, common attack types. Non-negotiable foundation.</p>
                  <div className="progress-bar"><div className="fill blue" style={{width: '0%'}}></div></div>
                  <div className="progress-labels">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="skills-gained">
                    <span>SKILLS YOU GAIN</span>
                    <div className="skill-pills">
                      <span className="skill">Networking</span>
                      <span className="skill">HTTP</span>
                      <span className="skill">Linux basics</span>
                    </div>
                  </div>
                  <div className="course-links">
                    <span className="link-pill free">Free</span>
                    <span className="link-pill type">Course</span>
                    <span className="link-pill title blue">Cybersecurity Fundamentals</span>
                    <div className="status-right">
                      <button className="continue-btn">Start now</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="timeline-item locked">
                <div className="node"><div className="inner-node"></div></div>
                <div className="content">
                  <span className="week-label">WEEK 3-5</span>
                  <h4>Web Application Security</h4>
                  <p>OWASP Top 10, Burp Suite basics, how web apps get hacked. Essential before AppSec.</p>
                  <div className="progress-bar"><div className="fill" style={{width: '0%'}}></div></div>
                  <div className="progress-labels">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="skills-gained">
                    <span>SKILLS YOU GAIN</span>
                    <div className="skill-pills">
                      <span className="skill">OWASP</span>
                      <span className="skill">Burp Suite</span>
                      <span className="skill">SQL injection</span>
                    </div>
                  </div>
                  <div className="course-links">
                    <span className="link-pill type">Course</span>
                    <span className="link-pill type">THM Lab</span>
                    <span className="link-pill title locked-text">Web Application Security</span>
                    <div className="status-right">
                      <span className="coming-up">Locked</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="timeline-item locked">
                <div className="node"><div className="inner-node"></div></div>
                <div className="content">
                  <span className="week-label">WEEK 6-12</span>
                  <h4>AppSec Engineering</h4>
                  <p>Secure SDLC, threat modelling, API security, DevSecOps. This is the main path.</p>
                  <div className="progress-bar"><div className="fill" style={{width: '0%'}}></div></div>
                  <div className="progress-labels">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="skills-gained">
                    <span>SKILLS YOU GAIN</span>
                    <div className="skill-pills">
                      <span className="skill">Threat modelling</span>
                      <span className="skill">API security</span>
                      <span className="skill">DevSecOps</span>
                    </div>
                  </div>
                  <div className="course-links">
                    <span className="link-pill type">Course</span>
                    <span className="link-pill type">THM Lab</span>
                    <span className="link-pill title locked-text">AppSec Engineering</span>
                    <div className="status-right">
                      <span className="coming-up">Locked</span>
                      <span className="price">₹49</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="timeline-item locked">
                <div className="node"><div className="inner-node"></div></div>
                <div className="content">
                  <span className="week-label">WEEK 13-15</span>
                  <h4>Cloud Security Basics</h4>
                  <p>AWS and Azure fundamentals, IAM, secrets management. Most AppSec roles need cloud.</p>
                  <div className="skills-gained">
                    <span>SKILLS YOU GAIN</span>
                    <div className="skill-pills">
                      <span className="skill">AWS IAM</span>
                      <span className="skill">Azure</span>
                      <span className="skill">Misconfigs</span>
                    </div>
                  </div>
                  <div className="course-links">
                    <span className="link-pill type">Course</span>
                    <span className="link-pill title locked-text">Cloud Security Engineering</span>
                    <div className="status-right">
                      <span className="coming-up">Locked</span>
                      <span className="price">₹49</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="timeline-item locked">
                <div className="node"><div className="inner-node"></div></div>
                <div className="content">
                  <span className="week-label">WEEK 16-20</span>
                  <h4>Interview Prep and Portfolio</h4>
                  <p>50 AppSec interview questions, mock interviews, resume review, salary negotiation.</p>
                  <div className="skills-gained">
                    <span>SKILLS YOU GAIN</span>
                    <div className="skill-pills">
                      <span className="skill">Interview skills</span>
                      <span className="skill">Resume</span>
                      <span className="skill">Portfolio</span>
                    </div>
                  </div>
                  <div className="course-links">
                    <span className="link-pill type">Course</span>
                    <span className="link-pill title locked-text">Interview Prep Kit</span>
                    <div className="status-right">
                      <span className="coming-up"><Lock size={14} /> Locked</span>
                      <span className="price">₹499</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="certifications-section">
              <h4>Certifications to aim for</h4>
              <div className="certs-grid">
                <div className="cert-card">
                  <div className="cert-icon-wrapper">
                    <Award size={24} className="cert-lucide" />
                  </div>
                  <div className="cert-details">
                    <h5>CEH</h5>
                    <p>Certified Ethical Hacker</p>
                  </div>
                </div>
                <div className="cert-card">
                  <div className="cert-icon-wrapper">
                    <Award size={24} className="cert-lucide" />
                  </div>
                  <div className="cert-details">
                    <h5>GWEB</h5>
                    <p>GIAC Web App Defender</p>
                  </div>
                </div>
                <div className="cert-card">
                  <div className="cert-icon-wrapper">
                    <Award size={24} className="cert-lucide" />
                  </div>
                  <div className="cert-details">
                    <h5>CSSLP</h5>
                    <p>Certified Secure Software</p>
                  </div>
                </div>
              </div>
            </div>



          </div>
        )}
      </section>

      {/* Bottom Navigation */}
      {currentStep < 4 && !isGenerating && (
        <div className="roadmap-actions">
          {currentStep > 1 && (
             <button className="back-step-btn" onClick={handleBack}>
               Back
             </button>
          )}
          
          {currentStep < 3 ? (
            <button
              className="next-step-btn"
              disabled={(currentStep === 1 && !selectedRole) || (currentStep === 2 && !selectedLevel)}
              onClick={handleNext}
            >
              Next: {STEPS[currentStep]?.label} <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className="generate-btn"
              disabled={!selectedTime}
              onClick={handleGenerate}
            >
              Generate my roadmap
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
