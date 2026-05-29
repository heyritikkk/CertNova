import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Check, ListFilter } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import PageHeader from '../components/PageHeader';
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

const PRICES = ['Free', 'Paid'];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedLevels, setSelectedLevels] = useState(new Set());
  const [selectedDurations, setSelectedDurations] = useState(new Set());
  const [selectedPrices, setSelectedPrices] = useState(new Set());

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
      // 4. Price filter
      if (selectedPrices.size > 0) {
        const isFree = Number(c.price) === 0 || !c.price;
        const isPaid = !isFree;
        let pMatch = false;
        if (selectedPrices.has('Free') && isFree) pMatch = true;
        if (selectedPrices.has('Paid') && isPaid) pMatch = true;
        if (!pMatch) return false;
      }
      // 5. Category filter
      if (selectedCategories.size > 0) {
        let match = false;
        for (const cat of selectedCategories) {
           if (c.title && c.title.toLowerCase().includes(cat.toLowerCase())) {
             match = true;
             break;
           }
        }
        if (!match) return false;
      }
      
      return true;
    });
  }, [courses, searchTerm, selectedCategories, selectedLevels, selectedDurations, selectedPrices]);

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
      <div className="site-container-inner">
        <PageHeader 
          eyebrow="COURSES"
          title="Cybersecurity courses built for CS students"
          subtitle="Structured paths from beginner to job-ready with quizzes and TryHackMe labs."
        />
      </div>

      <div className="site-container-inner">
        <div className="courses-alert-banner">
          <div className="alert-checkbox-icon">
            <Check size={16} strokeWidth={3} />
          </div>
          <span>Every path has a free beginner module. No account needed - start learning right now, no card required.</span>
        </div>

        <div className="courses-horizontal-filters">
          <div className="filter-label">
            <ListFilter size={18} />
            <span>Filter:</span>
          </div>
          <div className="filter-options" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <button 
              className={`filter-btn ${selectedCategories.size === 0 && selectedLevels.size === 0 && !searchTerm ? 'active' : ''}`} 
              onClick={() => {
                setSelectedCategories(new Set());
                setSelectedLevels(new Set());
                setSearchTerm('');
              }}
            >
              All paths
            </button>

            <button 
              className={`filter-btn ${searchTerm === 'Knowledge Check' ? 'active' : ''}`}
              onClick={() => {
                setSearchTerm('Knowledge Check');
                setSelectedCategories(new Set());
                setSelectedLevels(new Set());
              }}
            >
              Check your knowledge
            </button>

            <button 
              className={`filter-btn ${selectedCategories.has('Interview') ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategories(new Set(['Interview']));
                setSelectedLevels(new Set());
                setSearchTerm('');
              }}
            >
              Interview kit
            </button>

            <button 
              className={`filter-btn ${selectedLevels.has('Beginner') ? 'active' : ''}`}
              onClick={() => {
                setSelectedLevels(new Set(['Beginner']));
                setSelectedCategories(new Set());
                setSearchTerm('');
              }}
            >
              Beginner level
            </button>
            
            {['Network Security', 'Web Security', 'Cryptography'].map(cat => (
              <button 
                key={cat}
                className={`filter-btn ${selectedCategories.has(cat) ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategories(new Set([cat]));
                  setSelectedLevels(new Set());
                  setSearchTerm('');
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className={`filter-btn filter-btn--pill ${selectedPrices.has('Free') ? 'active' : ''}`} onClick={() => setSelectedPrices(toggleSet(selectedPrices, 'Free'))}>
            Free only
          </button>
        </div>

        <main className="courses-main-full">
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

