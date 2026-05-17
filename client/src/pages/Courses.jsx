import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { api } from '../lib/api';
import './Courses.css';

const FILTERS = [
  { id: 'all', label: 'All courses' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

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

  const filteredCourses = useMemo(() => {
    if (activeFilter === 'free') {
      return courses.filter((c) => !Number(c.price));
    }
    if (activeFilter === 'paid') {
      return courses.filter((c) => Number(c.price) > 0);
    }
    return courses;
  }, [courses, activeFilter]);

  const freeCount = courses.filter((c) => !Number(c.price)).length;
  const paidCount = courses.length - freeCount;

  return (
    <div className="courses-page">
      <div className="courses-inner">
        <header className="courses-hero">
          <span className="courses-eyebrow">Course catalog</span>
          <h1>Security+ courses built for exam day</h1>
          <p>
            Browse published courses with clear syllabi, lesson counts, and pricing—updated live when
            your team publishes from admin.
          </p>
        </header>

        <div className="courses-toolbar">
          <div className="courses-filters" role="tablist" aria-label="Filter courses">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter.id}
                className={`courses-filter${activeFilter === filter.id ? ' is-active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {!loading && courses.length > 0 && (
            <p className="courses-count">
              Showing {filteredCourses.length} of {courses.length}
              <span className="courses-count__meta">
                · {freeCount} free · {paidCount} paid
              </span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="courses-grid courses-grid--loading" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => (
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
          <p className="courses-empty courses-empty--inline">
            No {activeFilter} courses right now. Try another filter.
          </p>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
