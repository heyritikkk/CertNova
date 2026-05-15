import React, { useEffect, useState } from 'react';
import { ArrowRight, Clock3 } from 'lucide-react';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = (isInitial = false) => {
      fetch('http://localhost:5000/api/courses')
        .then((res) => res.json())
        .then((data) => {
          setCourses(data || []);
          if (isInitial) {
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to load courses:', err);
          if (isInitial) {
            setLoading(false);
          }
        });
    };

    loadCourses(true);
    const pollId = window.setInterval(() => loadCourses(false), 10000);
    return () => window.clearInterval(pollId);
  }, []);

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div className="courses-intro">
          <h1>Courses</h1>
          <p>Choose from our core Security+ tracks to build practical skills and hands-on confidence.</p>
        </div>
      </div>

      {loading ? (
        <p className="courses-loading">Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="courses-loading">No courses available yet.</p>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <article key={course.id} className="course-card">
              <div className="course-card-cover">
                <div className="course-card-cover-overlay">
                  <div className="course-card-cover-text">
                    <h3>{course.cover_title || course.title}</h3>
                    <p>{course.cover_subtitle || course.description}</p>
                  </div>
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.cover_title || course.title} className="course-card-cover-image" />
                  ) : (
                    <div className="course-card-cover-fallback" aria-hidden="true">
                      🤖
                    </div>
                  )}
                </div>
              </div>

              <div className="course-card-body">
                <div className="course-meta">
                  <span className="course-level">{course.level || 'Advanced'}</span>
                  <span className="course-duration"><Clock3 size={18} />{course.duration || '10h'}</span>
                </div>
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <button className="course-cta">{course.cta_text || 'View Course'} <ArrowRight size={24} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
