import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Bookmark, Award, User, Settings, LogOut, MessageSquare, FileText, Monitor, Flame, Trophy, Shield, Laptop, ExternalLink, ShieldCheck, ChevronRight, Search, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import CtaBanner from '../components/CtaBanner';
import CourseProgressStrip from '../components/CourseProgressStrip';
import Footer from '../components/Footer';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';



const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const validTabs = new Set(['overview', 'lessons', 'progress', 'bookmarks', 'certificates', 'profile', 'billing']);

  const handleSidebarTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'progress') {
      navigate('/progress');
      return;
    }
    if (tab === 'profile') {
      navigate('/profile');
      return;
    }
    if (tab === 'overview') {
      navigate('/dashboard');
      return;
    }
    navigate(`/dashboard?tab=${encodeURIComponent(tab)}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [userName, setUserName] = useState('Learner');
  const [userEmail, setUserEmail] = useState('learner@certnova.com');
  const [lastActivity, setLastActivity] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertCategory, setSelectedCertCategory] = useState('All');
  const [certSearch, setCertSearch] = useState('');

  // Profile Form State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [showCerts, setShowCerts] = useState(true);
  const [showSpaces, setShowSpaces] = useState(true);

  useEffect(() => {
    if (location.pathname === '/progress') {
      setActiveTab('progress');
      return;
    }
    if (location.pathname === '/profile') {
      setActiveTab('profile');
      return;
    }
    if (location.pathname === '/dashboard') {
      const tabFromQuery = new URLSearchParams(location.search).get('tab');
      if (tabFromQuery && validTabs.has(tabFromQuery)) {
        setActiveTab(tabFromQuery);
      } else {
        setActiveTab('overview');
      }
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const fName = localStorage.getItem('firstName') || 'Learner';
    const lName = localStorage.getItem('lastName') || '';
    const email = localStorage.getItem('userEmail') || 'learner@certnova.com';
    
    setUserName(lName ? `${fName} ${lName}` : fName);
    setUserEmail(email);
    setEditFirstName(fName);
    setEditLastName(lName);
    setEditEmail(email);
    setEditNickname(localStorage.getItem('nickname') || '');
    setShowCerts(localStorage.getItem('showCerts') !== 'false');
    setShowSpaces(localStorage.getItem('showSpaces') !== 'false');
    
    try {
      const raw = localStorage.getItem('certnova-last-activity');
      if (raw) setLastActivity(JSON.parse(raw));
    } catch {}

    const fetchData = async () => {
      try {
        const [coursesData, certsRes] = await Promise.all([
          api.getPublishedCourses(),
          fetch(`${API_BASE}/api/certificates?email=${encodeURIComponent(email)}`).then(r => r.json())
        ]);
        setCourses(coursesData.courses || []);
        setCertificates(Array.isArray(certsRes) ? certsRes : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    const fullName = editLastName ? `${editFirstName} ${editLastName}` : editFirstName;
    localStorage.setItem('userName', fullName);
    localStorage.setItem('firstName', editFirstName);
    localStorage.setItem('lastName', editLastName);
    localStorage.setItem('userEmail', editEmail);
    localStorage.setItem('nickname', editNickname);
    localStorage.setItem('showCerts', showCerts);
    localStorage.setItem('showSpaces', showSpaces);
    
    setUserName(fullName);
    setUserEmail(editEmail);
    alert('Profile saved successfully!');
  };

  // Helper to calculate progress for a course
  const getCourseProgress = (course) => {
    try {
      const raw = localStorage.getItem(`certnova-lesson-progress-${course.id}`);
      if (!raw) return { percent: 0, done: 0, total: 0 };
      const completedIds = new Set(JSON.parse(raw));
      
      let blocks = [];
      try { blocks = JSON.parse(course.content_blocks_json || '[]'); } catch { blocks = course.content_blocks || []; }
      
      const visible = blocks.filter((b) => {
        if (b.hidden) return false;
        const sec = b.sectionTitle?.trim();
        const nav = b.navTitle?.trim();
        const isParent = b.type === 'markdown' && sec && nav && sec === nav;
        return !isParent;
      });
      
      const total = visible.length;
      if (total === 0) return { percent: 0, done: 0, total: 0 };
      const done = visible.filter(b => completedIds.has(b.id)).length;
      return { percent: Math.round((done / total) * 100), done, total };
    } catch {
      return { percent: 0, done: 0, total: 0 };
    }
  };

  // Active Courses
  const activeCourses = courses.map(c => ({ ...c, progress: getCourseProgress(c) })).filter(c => {
    const isPurchased = localStorage.getItem(`certnova-course-purchased-${c.id}`) === 'true';
    const hasStarted = localStorage.getItem(`certnova-course-${c.id}-completed`) !== null;
    let hasActivity = false;
    try {
      const act = JSON.parse(localStorage.getItem('certnova-last-activity') || 'null');
      if (act && act.courseId === c.id) hasActivity = true;
    } catch (e) {}

    return c.progress.percent > 0 || isPurchased || hasStarted || hasActivity;
  });
  
  // Bookmarks (Mocked via localStorage)
  const getBookmarks = () => {
    try {
      const raw = localStorage.getItem('certnova-bookmarks');
      const ids = JSON.parse(raw || '[]');
      return courses.filter(c => ids.includes(c.id));
    } catch { return []; }
  };
  const bookmarkedCourses = getBookmarks();

  // Real-time Activity
  const getRecentActivity = () => {
    const activities = [];
    if (certificates.length > 0) {
      activities.push({ id: 'cert', text: `Earned ${certificates[0].title || 'a'} certificate`, time: 'Recently', type: 'cert' });
    }
    if (lastActivity) {
      const type = lastActivity.progressPercent > 0 ? 'complete' : 'start';
      const text = lastActivity.progressPercent > 0 ? `Continued ${lastActivity.courseTitle}` : `Started ${lastActivity.courseTitle}`;
      activities.push({ id: 'last', text, time: 'Today', type });
    }
    activeCourses.forEach(c => {
      if (c.progress.done > 0 && c.id !== lastActivity?.courseId) {
        activities.push({ id: `course-${c.id}`, text: `Completed lessons in ${c.title}`, time: 'Recently', type: 'complete' });
      }
    });
    if (activities.length === 0) {
      activities.push({ id: 'empty', text: 'No recent activity yet', time: '', type: 'start' });
    }
    return activities.slice(0, 5);
  };

  // Real-time Streak
  const getStreakDays = () => {
    let count = 0;
    try {
      const raw = localStorage.getItem('certnova-streak');
      if (raw) {
        const data = JSON.parse(raw);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (data.lastDate === today || data.lastDate === yesterday) {
          count = data.count || 0;
        }
      }
    } catch {}
    
    return {
      count,
      heatmap: Array.from({ length: 30 }, (_, i) => {
        const isToday = i === 29;
        if (isToday) return count > 0 ? 2 : 0;
        const daysAgo = 29 - i;
        return daysAgo < count ? 1 : 0;
      })
    };
  };

  const streakData = getStreakDays();
  const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // ----- TAB RENDERERS -----

  const renderOverview = () => (
    <>
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>Welcome back, {userName} 👋</h1>
          <p>{streakData.count > 0 ? `You are on a ${streakData.count}-day streak. Keep it going!` : 'Start a lesson to begin your learning streak!'}</p>
        </div>
        <div className="header-profile">
          <span>{userName}</span>
          <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
        </div>
      </header>

      <section className="dashboard-stats">
        <div className="stat-box">
          <div className="stat-icon-wrapper"><FileText size={20} className="stat-icon" /></div>
          <div className="stat-content">
            <p className="stat-label">LESSONS DONE</p>
            <h3>{activeCourses.reduce((acc, c) => acc + c.progress.done, 0)} <span>total</span></h3>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon-wrapper"><Trophy size={20} className="stat-icon" style={{ color: '#eab308' }} /></div>
          <div className="stat-content">
            <p className="stat-label">CERTIFICATES</p>
            <h3>{certificates.length} <span>earned</span></h3>
          </div>
        </div>
      </section>

      <section className="dashboard-courses">
        <div className="section-header">
          <h2>Continue learning</h2>
          <button className="text-btn" onClick={() => setActiveTab('lessons')}>View all</button>
        </div>
        
        <div className="course-cards-grid">
          {lastActivity ? (
            <div className="dash-course-card">
              <div className="card-top">
                <div className="course-icon"><Shield size={24} /></div>
                <div>
                  <span className="course-category">{lastActivity.courseTitle}</span>
                  <h4 className="course-title">{lastActivity.lessonTitle}</h4>
                </div>
              </div>
              <div className="card-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${lastActivity.progressPercent}%` }}></div>
                </div>
              </div>
              <div className="card-footer">
                <span className="progress-text">{lastActivity.progressPercent}% complete</span>
                <Link to={`/courses/${lastActivity.courseSlug}/learn${lastActivity.lessonHash || ''}`} className="btn-continue">Continue</Link>
              </div>
            </div>
          ) : (
              <div className="dash-course-card">
                <div className="card-top">
                  <div className="course-icon"><Shield size={24} /></div>
                  <div>
                    <span className="course-category">Network Security</span>
                    <h4 className="course-title">Start your first lesson</h4>
                  </div>
                </div>
                <div className="card-footer" style={{ marginTop: '2rem' }}>
                  <span className="progress-text">0% complete</span>
                  <Link to="/courses" className="btn-continue">Start</Link>
                </div>
              </div>
          )}

          <div className="dash-course-card">
            <div className="card-top">
              <div className="course-icon"><Laptop size={24} /></div>
              <div>
                <span className="course-category">AppSec Engineering</span>
                <h4 className="course-title">DevSecOps Pipeline</h4>
              </div>
            </div>
            <div className="card-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div className="card-footer">
              <span className="progress-text">30% complete</span>
              <Link to="/courses" className="btn-continue">Continue</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-bottom-row">
        <section className="recent-activity">
          <h2>Recent activity</h2>
          <div className="activity-timeline">
            {getRecentActivity().map(act => (
              <div key={act.id} className="activity-item">
                <div className={`activity-dot ${act.type}`}></div>
                <div className="activity-text">{act.text}</div>
                <div className="activity-time">{act.time}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="learning-streak">
          <h2>Learning streak for {currentMonthYear}</h2>
          <div className="heatmap-grid">
            {streakData.heatmap.map((val, i) => (
              <div key={i} className={`heatmap-cell val-${val}`}></div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span className="legend-item"><div className="heatmap-cell val-0"></div> No activity</span>
            <span className="legend-item"><div className="heatmap-cell val-1"></div> Completed</span>
            <span className="legend-item"><div className="heatmap-cell val-2"></div> Today</span>
          </div>
        </section>
      </div>
    </>
  );

  const renderLessons = () => (
    <div className="tab-view">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>My Lessons</h1>
          <p>Pick up right where you left off.</p>
        </div>
      </header>
      
      {loading ? <p>Loading...</p> : activeCourses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h2>No active courses</h2>
          <p>Start a course to track your progress here.</p>
          <Link to="/courses" className="btn-continue">Browse Courses</Link>
        </div>
      ) : (
        <div className="course-cards-grid">
          {activeCourses.map(course => (
            <div key={course.id} className="dash-course-card">
              <div className="card-top">
                <div className="course-icon"><Shield size={24} /></div>
                <div>
                  <span className="course-category">{course.level}</span>
                  <h4 className="course-title">{course.title}</h4>
                </div>
              </div>
              <div className="card-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress.percent}%` }}></div>
                </div>
              </div>
              <div className="card-footer">
                <span className="progress-text">{course.progress.percent}% complete</span>
                <Link to={`/courses/${course.slug}/learn`} className="btn-continue">Continue</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookmarks = () => (
    <div className="tab-view">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>Bookmarks</h1>
          <p>Courses you've saved for later.</p>
        </div>
      </header>
      
      {loading ? <p>Loading...</p> : bookmarkedCourses.length === 0 ? (
        <div className="empty-state">
          <Bookmark size={48} />
          <h2>No bookmarks yet</h2>
          <p>Save courses to quickly find them later.</p>
          <Link to="/courses" className="btn-continue">Explore</Link>
        </div>
      ) : (
        <div className="course-cards-grid">
          {bookmarkedCourses.map(course => (
            <div key={course.id} className="dash-course-card">
              <div className="card-top">
                <div className="course-icon"><Bookmark size={24} /></div>
                <div>
                  <span className="course-category">{course.level}</span>
                  <h4 className="course-title">{course.title}</h4>
                </div>
              </div>
              <div className="card-footer" style={{ marginTop: '2rem' }}>
                <span className="progress-text">{course.duration}</span>
                <Link to={`/courses/${course.slug}`} className="btn-continue">View Course</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCertificates = () => {
    const categoryLabelForCourse = (course) => {
      return (
        course.category?.trim() ||
        course.track?.trim() ||
        course.domain?.trim() ||
        course.level?.trim() ||
        'General'
      );
    };

    const categories = ['All', ...Array.from(new Set(courses.map(categoryLabelForCourse)))];
    const searchTerm = certSearch.trim().toLowerCase();
    const filteredCourses = courses.filter((course) => {
      const category = categoryLabelForCourse(course);
      const categoryMatch = selectedCertCategory === 'All' || category === selectedCertCategory;
      const searchMatch = !searchTerm || course.title?.toLowerCase().includes(searchTerm);
      return categoryMatch && searchMatch;
    });

    return (
      <div className="tab-view" style={{ maxWidth: '1000px' }}>
        <div className="cert-filter-bar">
          <div className="cert-filter-tags">
            {categories.map((category) => (
              <button
                key={category}
                className={`cert-tag ${selectedCertCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCertCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="cert-filter-actions">
            <div className="cert-status-dropdown">
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Status</span>
              <select>
                <option>All</option>
                <option>Earned</option>
                <option>Available</option>
              </select>
            </div>
            <div className="cert-search">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="cert-list-container">
          {filteredCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p>No exams found for the selected filters.</p>
            </div>
          )}
          {filteredCourses.map((course, idx) => {
            const colors = ['#e34f26', '#264de4', '#f7df1e', '#336791', '#3776ab', '#f89820'];
            const color = colors[idx % colors.length];
            const isPopular = idx === 0 || idx === 3;
            
            return (
              <div key={course.id} className="cert-list-row">
                <div className="cert-row-left">
                  <div className="cert-row-icon" style={{ background: color, color: color === '#f7df1e' ? '#000' : '#fff' }}>
                    <Award size={28} />
                  </div>
                  <div className="cert-row-info">
                    <span className="cert-row-type">Exam</span>
                    <h4 className="cert-row-title">{course.title}</h4>
                  </div>
                </div>
                <div className="cert-row-right">
                  {isPopular && <span className="cert-popular-badge">POPULAR</span>}
                  <button className="btn-buy-cert">Buy Certificate</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="tab-view">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>Profile Settings</h1>
          <p>Manage your account details.</p>
        </div>
      </header>
      
      <div className="dashboard-form profile-container">
        <div className="upgrade-banner">
          <div className="banner-text">
            <h3>Upgrade to Plus</h3>
            <p>ad-free, focused, and packed with extras.</p>
          </div>
          <Link to="/pricing" className="btn-continue upgrade-btn">Upgrade</Link>
        </div>

        <form onSubmit={handleProfileSave}>
          <div className="form-section">
            <h4>Basic information</h4>
            <div className="form-group">
              <label>Nickname</label>
              <input type="text" value={editNickname} onChange={(e) => setEditNickname(e.target.value)} placeholder="Enter nickname" />
              <small>Your nickname will appear on the League and be visible to others.</small>
            </div>
            
            <div className="form-toggle">
              <div className="toggle-text">
                <label>Show Certificates in Profile</label>
                <small>Show the certificates you've earned on your profile.</small>
              </div>
              <input type="checkbox" checked={showCerts} onChange={(e) => setShowCerts(e.target.checked)} />
            </div>

            <div className="form-toggle">
              <div className="toggle-text">
                <label>Show Spaces in Profile</label>
                <small>Show the spaces you've created on your profile.</small>
              </div>
              <input type="checkbox" checked={showSpaces} onChange={(e) => setShowSpaces(e.target.checked)} />
            </div>
          </div>

          <div className="form-section">
            <h4>Account information</h4>
            <div className="form-row">
              <div className="form-group half">
                <label>First Name*</label>
                <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
              </div>
              <div className="form-group half">
                <label>Last Name*</label>
                <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required />
              </div>
            </div>
            <small style={{ display: 'block', marginBottom: '1.5rem', marginTop: '-0.5rem', color: 'var(--text-muted)' }}>The name you enter here will appear on your certificates.</small>

            <div className="form-group">
              <label>Email*</label>
              <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required disabled />
              <small>Email is managed by your Google account.</small>
            </div>

            <div className="form-group">
              <label style={{ marginBottom: '0.2rem' }}>Password</label>
              <button type="button" className="text-btn" style={{ alignSelf: 'flex-start' }}>Change Password</button>
            </div>

            <div className="form-actions">
              <button type="button" className="text-btn danger-btn">Delete Account</button>
              <button type="submit" className="btn-continue" style={{ border: 'none', cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="tab-view">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>Billing & Plan</h1>
          <p>Manage your subscription.</p>
        </div>
      </header>
      
      <div className="dash-course-card billing-card">
        <div className="card-top" style={{ marginBottom: '0.5rem' }}>
          <div className="course-icon"><Settings size={24} /></div>
          <div>
            <span className="course-category">Current Plan</span>
            <h4 className="course-title">Free Tier</h4>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          You currently have access to our free lessons and basic labs. Upgrade to Pro for full access to all courses, advanced labs, and certificates.
        </p>
        <Link to="/pricing" className="btn-continue">Upgrade to Pro</Link>
      </div>
    </div>
  );

  const renderProgress = () => {
    // Calculate stats
    const totalLessonsDone = activeCourses.reduce((acc, c) => acc + getCourseProgress(c).done, 0);
    const totalXP = totalLessonsDone * 10;
    
    // Sort courses by progress
    const sortedCourses = [...activeCourses].sort((a, b) => {
      return getCourseProgress(b).percent - getCourseProgress(a).percent;
    });

    return (
      <div className="tab-view profile-container" style={{ maxWidth: '100%' }}>
        <div className="form-section" style={{ padding: '2rem 2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>My Progress</h2>
          <p style={{ color: 'var(--text-muted, #64748b)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Track your progress across different courses</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="progress-stat">
              <div className="stat-label">Total XP</div>
              <div className="stat-value">{totalXP}</div>
            </div>
            <div className="progress-stat">
              <div className="stat-label">Lessons</div>
              <div className="stat-value">{totalLessonsDone}</div>
            </div>
            <div className="progress-stat">
              <div className="stat-label">Exercises</div>
              <div className="stat-value">0</div>
            </div>
            <div className="progress-stat">
              <div className="stat-label">Quizzes</div>
              <div className="stat-value">0</div>
            </div>
            <div className="progress-stat">
              <div className="stat-label">Challenges</div>
              <div className="stat-value">0</div>
            </div>
            <div className="progress-stat">
              <div className="stat-label">Exams</div>
              <div className="stat-value">0</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Sort by:</span>
          <select style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 500, outline: 'none' }}>
            <option>Most progress</option>
            <option>Least progress</option>
            <option>Recently active</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedCourses.length === 0 && (
            <div className="form-section" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>You haven't started any courses yet.</p>
              <Link to="/courses" className="btn-continue" style={{ display: 'inline-block', marginTop: '1rem' }}>Browse Courses</Link>
            </div>
          )}
          
          {sortedCourses.map(course => {
            const { percent } = getCourseProgress(course);
            return (
              <Link to={`/courses/${course.slug}/learn`} key={course.id} className="form-section progress-course-row" style={{ display: 'flex', alignItems: 'center', padding: '1.25rem 1.5rem', margin: 0, textDecoration: 'none', gap: '1.5rem', transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
                <div className="course-icon" style={{ background: '#4f46e5', width: '48px', height: '48px', borderRadius: '12px', color: '#fff' }}>
                  <BookOpen size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', border: 'none', padding: 0 }}>{course.title}</h4>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{percent}% <ChevronRight size={14} style={{ verticalAlign: 'middle', marginLeft: '0.2rem' }} /></span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="progress-fill" style={{ height: '100%', width: `${percent}%`, background: '#22c55e', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  let stripData = null;
  if (courses.length > 0) {
    let activeCourse = null;
    let lessonTitle = '';
    
    if (lastActivity) {
      activeCourse = courses.find(c => c.id === lastActivity.courseId);
      lessonTitle = lastActivity.lessonTitle || 'Continue Learning';
    }
    
    // Fallback if no last activity or course not found
    if (!activeCourse) {
      activeCourse = courses[0]; // e.g. Network Security
      lessonTitle = 'Start your first lesson';
    }

    if (activeCourse) {
      const progress = getCourseProgress(activeCourse);
      stripData = {
        courseTitle: activeCourse.title,
        courseSlug: activeCourse.slug,
        currentLessonTitle: lessonTitle,
        totalLessons: progress.total > 0 ? progress.total : 1, // Avoid 0 denominator
        completedCount: progress.done
      };
    } else {
      stripData = {
        courseTitle: 'Dashboard',
        courseSlug: '', // Will handle this below
        currentLessonTitle: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
        totalLessons: 0, // Hides the progress bar
        completedCount: 0
      };
    }
  }

  return (
    <div className="site-container dashboard-page-shell" style={{ paddingBottom: '3rem' }}>
      <div className="site-container-inner">
        {stripData && (
          <div style={{ marginBottom: '1.5rem', zIndex: 140 }}>
            <CourseProgressStrip 
              {...stripData} 
              style={{ top: 'calc(var(--navbar-offset, 80px) + 0.5rem)' }} 
            />
          </div>
        )}
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-section" style={{ marginTop: '1rem' }}>
              <nav>
                <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleSidebarTabChange('overview')}>
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button className={`sidebar-link ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => handleSidebarTabChange('lessons')}>
                  <BookOpen size={16} /> My Lessons
                  {activeCourses.length > 0 && <span className="sidebar-badge">{activeCourses.length}</span>}
                </button>
                <button className={`sidebar-link ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => handleSidebarTabChange('progress')}>
                  <TrendingUp size={16} /> My Progress
                </button>
                <button className={`sidebar-link ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => handleSidebarTabChange('bookmarks')}>
                  <Bookmark size={16} /> Bookmarks
                </button>
                <button className={`sidebar-link ${activeTab === 'certificates' ? 'active' : ''}`} onClick={() => handleSidebarTabChange('certificates')}>
                  <Award size={16} /> Certificates
                </button>
              </nav>
            </div>

            <hr className="sidebar-divider" style={{ border: 'none', borderTop: '1px solid var(--brand-accent-border, #ffd4c2)', margin: '1rem 0' }} />

            <div className="sidebar-section">
              <nav>
                <button className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleSidebarTabChange('profile')}>
                  <User size={16} /> Profile
                </button>
                <button className={`sidebar-link ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => handleSidebarTabChange('billing')}>
                  <Settings size={16} /> Billing
                </button>
                <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--brand-accent, #f48b60)' }}>
                  <LogOut size={16} /> Log out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="dashboard-main">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'lessons' && renderLessons()}
            {activeTab === 'progress' && renderProgress()}
            {activeTab === 'bookmarks' && renderBookmarks()}
            {activeTab === 'certificates' && renderCertificates()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'billing' && renderBilling()}
          </div>
        </div>
      </div>
      <div className="dashboard-extra-sections">
        <CtaBanner />
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
