import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import CourseLessonLayout from '../components/CourseLessonLayout';
import './CourseDetail.css';

const CourseLearn = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .getCourse(slug)
      .then(setCourse)
      .catch((err) => setError(err.message || 'Course not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="course-detail-status">Loading course…</p>;
  }

  if (error || !course) {
    return (
      <div className="course-detail-status">
        <p>{error || 'Course not found.'}</p>
        <Link to="/courses" className="course-detail-back">
          <ArrowLeft size={18} /> Back to courses
        </Link>
      </div>
    );
  }

  const detailPath = `/courses/${course.slug || course.id}`;

  return (
    <div className="course-detail-page course-detail-page--lesson">
      <div className="course-detail-inner">
        <Link to={detailPath} className="course-detail-back">
          <ArrowLeft size={18} /> Course overview
        </Link>
        <CourseLessonLayout course={course} />
      </div>
    </div>
  );
};

export default CourseLearn;
