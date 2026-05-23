import { Link, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Video, FileText, Smartphone, Award as AwardIcon, Share2 } from 'lucide-react';
import { buildCourseSyllabus, countVisibleLessons } from '../lib/contentBlocks';
import './CourseDetailOverview.css';

function StarRating({ value = 4.7 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="course-detail-stars" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < full ? 'is-filled' : i === full && half ? 'is-half' : 'is-empty'
          }
          fill={i < full ? 'currentColor' : 'none'}
        />
      ))}
      <span className="course-detail-rating-num">{Number(value).toFixed(1)}</span>
    </span>
  );
}

const CourseDetailOverview = ({ course }) => {
  const slug = course.slug || course.id;
  const learnPath = `/courses/${slug}/learn`;
  const loginHref = `/login?redirect=${encodeURIComponent(learnPath)}`;
  const priceLabel =
    Number(course.price) > 0 ? `$${Number(course.price).toFixed(2)}` : 'Free';
  const heroText = course.detail_description?.trim() || course.description;
  const outcomes =
    course.learning_outcomes_list?.length > 0
      ? course.learning_outcomes_list
      : parseOutcomesFallback(course.learning_outcomes);
  const syllabus = buildCourseSyllabus(course);
  const lectureCount = countVisibleLessons(course);

  return (
    <div className="course-detail-overview">
      <section className="course-detail-hero">
        <div className="course-detail-hero-main">
          <h1>{course.title}</h1>
          <p className="course-detail-hero-desc">{heroText}</p>
          <div className="course-detail-hero-actions">
            <Link to={loginHref} className="course-detail-btn course-detail-btn--primary">
              Get started
            </Link>
            <StarRating value={course.rating ?? 4.7} />
            {course.instructor_name ? (
              <span className="course-detail-instructor-pill">{course.instructor_name}</span>
            ) : null}
            {course.student_count ? (
              <span className="course-detail-students">{course.student_count}</span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="course-detail-layout">
        <div className="course-detail-main">
          <section className="course-detail-panel">
            <h2>What you&apos;ll learn</h2>
            {outcomes.length > 0 ? (
              <>
                <p className="course-detail-panel-intro">
                  By the end of this course you will be able to master the topics below.
                </p>
                <ul className="course-detail-learn-list">
                  {outcomes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="course-detail-panel-intro">
                Add learning outcomes in admin under <strong>Detail page</strong> (one per line).
                Lessons are built under <strong>Course content</strong>.
              </p>
            )}
          </section>

          <section className="course-detail-panel">
            <h2>Course content</h2>
            {syllabus.length > 0 && lectureCount > 0 ? (
              <div className="course-detail-syllabus">
                {syllabus.map((mod) => (
                  <div className="course-detail-module" key={mod.id}>
                    <div className="course-detail-module-head">
                      <strong>{mod.title}</strong>
                      <span>
                        {mod.lessonCount} item{mod.lessonCount === 1 ? '' : 's'}
                      </span>
                    </div>
                    <ul>
                      {mod.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className={
                            lesson.isSection ? 'course-detail-syllabus-section' : undefined
                          }
                        >
                          <span>{lesson.title}</span>
                          <span className="course-detail-lesson-meta">{lesson.durationLabel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="course-detail-panel-intro">
                No published lessons yet. Add content in admin, then publish the course.
              </p>
            )}
          </section>
        </div>

        <aside className="course-detail-sidebar">
          <div className="course-detail-purchase-card">
            {/* Price row */}
            <div className="cdpc-price-row">
              <p className="course-detail-price">{priceLabel}</p>
              {Number(course.price) > 0 && (
                <span className="cdpc-rating-pill">
                  <Star size={13} fill="currentColor" /> {Number(course.rating ?? 4.7).toFixed(1)}
                </span>
              )}
            </div>

            {/* Buy button */}
            <Link
              to={Number(course.price) > 0 ? `/payment/${slug}` : loginHref}
              className="course-detail-btn course-detail-btn--buy"
            >
              {Number(course.price) > 0 ? 'Buy now' : 'Start for free'}
            </Link>

            {/* Trust badge */}
            {Number(course.price) > 0 && (
              <p className="cdpc-trust">
                <ShieldCheck size={14} /> 30-Day Money-Back Guarantee
              </p>
            )}

            {/* Facts */}
            <dl className="course-detail-facts">
              <div>
                <dt>Total duration</dt>
                <dd>{course.duration || '2 hours'}</dd>
              </div>
              <div>
                <dt>Lectures</dt>
                <dd>{lectureCount || 25}</dd>
              </div>
              <div>
                <dt>Skill level</dt>
                <dd>{course.level || 'Beginner'}</dd>
              </div>
              <div>
                <dt>Language</dt>
                <dd>{course.language || 'English'}</dd>
              </div>
              <div>
                <dt>Certificate</dt>
                <dd>Yes</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>Lifetime</dd>
              </div>
            </dl>

            {/* This course includes */}
            <div className="cdpc-includes">
              <h4>This course includes</h4>
              <ul>
                <li><Video size={15} /> {course.duration || '2h'} on-demand video</li>
                <li><FileText size={15} /> Downloadable resources</li>
                <li><Smartphone size={15} /> Mobile &amp; desktop access</li>
                <li><AwardIcon size={15} /> Certificate of completion</li>
              </ul>
            </div>

            {/* Share row */}
            <div className="cdpc-share">
              <button className="cdpc-share-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                <Share2 size={14} /> Share course
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

function parseOutcomesFallback(raw) {
  if (!raw) return [];
  return String(raw)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default CourseDetailOverview;
