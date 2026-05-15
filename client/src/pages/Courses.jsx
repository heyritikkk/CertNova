import React, { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';
import { api } from '../lib/api';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="courses-page">
      <div className="courses-inner">
        <header className="courses-header">
          <h1>Courses</h1>
          <p>Choose from our Security+ tracks — updated live when your team publishes new content.</p>
        </header>

        {loading ? (
          <p className="courses-loading">Loading courses…</p>
        ) : courses.length === 0 ? (
          <p className="courses-loading">No published courses yet. Check back soon.</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
