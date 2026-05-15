import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import CourseDetailOverview from '../components/CourseDetailOverview';
import './CourseDetail.css';

const CourseDetail = () => {
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

  return (
    <div className="course-detail-page">
      <div className="course-detail-inner">
        <CourseDetailOverview course={course} />
      </div>
    </div>
  );
};

export default CourseDetail;
