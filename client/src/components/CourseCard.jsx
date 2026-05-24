import { Link } from 'react-router-dom';
import { ArrowRight, Clock3 } from 'lucide-react';
import './CourseCard.css';
import { useCurrency } from '../hooks/useCurrency';

const CourseCard = ({ course, linkToDetail = true, preview = false }) => {
  const { formatPrice } = useCurrency();
  const detailPath = `/courses/${course.slug || course.id}`;
  const priceLabel = formatPrice(course.price);

  const coverTitle = course.cover_title?.trim() || '';
  const coverSubtitle = course.cover_subtitle?.trim() || '';
  const showCoverText =
    (coverTitle && coverTitle !== course.title) ||
    (coverSubtitle && coverSubtitle !== course.description);

  const hasCoverImage = Boolean(course.image_url?.trim());

  const content = (
    <>
      <div className={`course-card-cover${hasCoverImage ? ' course-card-cover--has-image' : ''}`}>
        {hasCoverImage && (
          <img
            src={course.image_url}
            alt={course.cover_title || course.title}
            className="course-card-cover-bg"
          />
        )}
        {(showCoverText || !hasCoverImage) && (
          <div
            className={`course-card-cover-overlay${
              hasCoverImage ? ' course-card-cover-overlay--on-image' : ''
            }${!showCoverText && !hasCoverImage ? ' course-card-cover-overlay--visual-only' : ''}`}
          >
            {showCoverText && (
              <div className="course-card-cover-text">
                <h3>{coverTitle || course.title}</h3>
                {coverSubtitle ? <p>{coverSubtitle}</p> : null}
              </div>
            )}
            {!hasCoverImage && (
              <div className="course-card-cover-fallback" aria-hidden="true">
                🤖
              </div>
            )}
          </div>
        )}
      </div>
      <div className="course-card-body">
        <div className="course-meta">
          <span className="course-level">{course.level || 'Beginner'}</span>
          <span className="course-duration">
            <Clock3 size={14} />
            {course.duration || '10h'}
          </span>
          {!preview && <span className="course-price">{priceLabel}</span>}
        </div>
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <span className="course-cta">
          {course.cta_text || 'View Course'} <ArrowRight size={18} />
        </span>
      </div>
    </>
  );

  if (preview || !linkToDetail) {
    return (
      <article className={`course-card${preview ? ' course-card--preview' : ''}`}>{content}</article>
    );
  }

  return (
    <Link to={detailPath} className="course-card course-card--link">
      {content}
    </Link>
  );
};

export default CourseCard;
