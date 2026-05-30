import { Link } from 'react-router-dom';
import { BookOpen, Globe, TerminalSquare, Skull } from 'lucide-react';
import './CourseCard.css';
import { useCurrency } from '../hooks/useCurrency';

const CourseCard = ({ course, linkToDetail = true, preview = false }) => {
  const { formatPrice } = useCurrency();
  const detailPath = `/courses/${course.slug || course.id}`;
  
  const isFree = Number(course.price) === 0 || !course.price;
  const priceLabel = isFree ? 'Free' : formatPrice(course.price);

  // Pick an icon based on title/category just for aesthetics (like the screenshot)
  let Icon = BookOpen;
  const lowerTitle = (course.title || '').toLowerCase();
  const lowerCat = (course.category || '').toLowerCase();
  
  if (lowerTitle.includes('web') || lowerCat.includes('web')) {
    Icon = Globe;
  } else if (lowerTitle.includes('ethical') || lowerTitle.includes('hack')) {
    Icon = Skull;
  } else if (lowerTitle.includes('appsec')) {
    Icon = TerminalSquare;
  }

  // Dummy values since we might not have lessons/labs count in the DB yet
  const lessonsCount = course.lessons_count || '3 lessons';
  const labsCount = course.labs_count || '1 labs';

  // Check if enrolled
  const userAuth = localStorage.getItem('userAuth') === 'true';
  const hasStarted = localStorage.getItem(`certnova-course-${course.id}-completed`) !== null;
  const isPurchased = localStorage.getItem(`certnova-course-purchased-${course.id}`) === 'true';
  
  let hasActivity = false;
  try {
    const act = JSON.parse(localStorage.getItem('certnova-last-activity') || 'null');
    if (act && act.courseId === course.id) hasActivity = true;
  } catch (e) {}

  const isEnrolled = userAuth && (hasStarted || isPurchased || hasActivity);

  const content = (
    <>
      <div className="course-card-banner">
        <Icon size={42} className="course-card-icon" />
        <span className="course-card-free-badge">{isFree ? 'Free' : 'Paid'}</span>
      </div>
      
      <div className="course-card-content">
        <div className="course-card-category">
          {course.category || 'Security'}
        </div>
        
        <h2 className="course-card-title">{course.title}</h2>
        
        <p className="course-card-description">
          {course.description}
        </p>
        
        <div className="course-card-stats">
          <span><span className="stat-square"></span> {course.duration || '1 hr'}</span>
          <span><span className="stat-square"></span> {lessonsCount}</span>
          <span><span className="stat-square"></span> {labsCount}</span>
        </div>
      </div>

      <div className="course-card-footer">
        {isEnrolled ? (
          <>
            <span className="footer-price" style={{ color: 'var(--brand-accent)' }}>Enrolled</span>
            <span className="footer-cta">Resume</span>
          </>
        ) : (
          <>
            <span className="footer-price">{priceLabel}</span>
            <span className="footer-cta">{isFree ? 'Start free' : 'Enroll now'}</span>
          </>
        )}
      </div>
    </>
  );

  if (preview || !linkToDetail) {
    return (
      <article className={`course-card${preview ? ' course-card--preview' : ''}`}>
        {content}
      </article>
    );
  }

  return (
    <Link to={detailPath} className="course-card course-card--link">
      {content}
    </Link>
  );
};

export default CourseCard;
