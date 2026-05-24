import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Search, Check } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { api } from '../lib/api';
import './Courses.css';

const CATEGORIES = [
  'Network Security',
  'Web Security',
  'Cryptography',
  'Cloud Security',
  'Incident Response',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const DURATIONS = ['< 5 hours', '5-10 hours', '> 10 hours'];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedLevels, setSelectedLevels] = useState(new Set());
  const [selectedDurations, setSelectedDurations] = useState(new Set());

  useEffect(() => {
    const loadCourses = (isInitial = false) => {
      api
        .getPublishedCourses()
        .then((data) => setCourses(data || []))
        .catch((err) => console.error('Failed to load courses:', err))
        .finally(() => {
          if (isInitial) setLoading(false);
        });
    };

    loadCourses(true);
    const pollId = window.setInterval(() => loadCourses(false), 10000);
    return () => window.clearInterval(pollId);
  }, []);

  const toggleSet = (set, item) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // 1. Search term
      if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      // 2. Level filter
      if (selectedLevels.size > 0 && !selectedLevels.has(c.level)) return false;
      // 3. Duration filter
      if (selectedDurations.size > 0) {
        const h = parseInt(c.duration) || 0;
        let dMatch = false;
        if (selectedDurations.has('< 5 hours') && h < 5) dMatch = true;
        if (selectedDurations.has('5-10 hours') && h >= 5 && h <= 10) dMatch = true;
        if (selectedDurations.has('> 10 hours') && h > 10) dMatch = true;
        if (!dMatch) return false;
      }
      // Note: Categories are UI-only right now as requested.
      return true;
    });
  }, [courses, searchTerm, selectedLevels, selectedDurations]);

  const Checkbox = ({ label, checked, onChange }) => (
    <label className="filter-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} className="filter-checkbox__input" />
      <span className="filter-checkbox__custom">
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="filter-checkbox__label">{label}</span>
    </label>
  );

  return (
    <div className="courses-page-new">
      <div className="courses-layout">
        
        {/* Left Sidebar */}
        <aside className="courses-sidebar">
          <div className="courses-search">
            <Search size={18} className="courses-search__icon" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <h3 className="filter-section__title">Category</h3>
            <div className="filter-section__list">
              {CATEGORIES.map(cat => (
                <Checkbox 
                  key={cat} 
                  label={cat} 
                  checked={selectedCategories.has(cat)} 
                  onChange={() => setSelectedCategories(toggleSet(selectedCategories, cat))} 
                />
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-section__title">Level</h3>
            <div className="filter-section__list">
              {LEVELS.map(lvl => (
                <Checkbox 
                  key={lvl} 
                  label={lvl} 
                  checked={selectedLevels.has(lvl)} 
                  onChange={() => setSelectedLevels(toggleSet(selectedLevels, lvl))} 
                />
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-section__title">Duration</h3>
            <div className="filter-section__list">
              {DURATIONS.map(dur => (
                <Checkbox 
                  key={dur} 
                  label={dur} 
                  checked={selectedDurations.has(dur)} 
                  onChange={() => setSelectedDurations(toggleSet(selectedDurations, dur))} 
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="courses-main">
          
          <div className="courses-hero-banner">
            <div className="courses-hero-banner__content">
              <h2>Courses</h2>
              <h1>Level up your skills with our courses</h1>
            </div>
            <div className="courses-hero-banner__art">
              <div className="banner-circle banner-circle-1" />
              <div className="banner-circle banner-circle-2" />
              <BookOpen size={64} className="banner-icon" />
            </div>
          </div>

          <div className="courses-main-header">
            <h3>Recommended for You</h3>
            {!loading && (
              <span className="courses-count-pill">
                Showing {filteredCourses.length} results
              </span>
            )}
          </div>

          {loading ? (
            <div className="courses-grid courses-grid--loading" aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="courses-skeleton" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="courses-empty">
              <BookOpen size={40} aria-hidden />
              <h2>No published courses yet</h2>
              <p>When your team publishes a course in admin, it will appear here automatically.</p>
              <Link to="/about" className="courses-empty__link">
                Learn about CertNova <ArrowRight size={16} />
              </Link>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="courses-empty courses-empty--no-match">
              <h2>No matches found</h2>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Courses;
