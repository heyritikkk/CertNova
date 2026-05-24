import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Trophy } from 'lucide-react';
import './CourseProgressStrip.css';

/**
 * CourseProgressStrip — thin bar between navbar and lesson content.
 * Shows breadcrumb, progress bar, circular ring, and streak.
 */
export default function CourseProgressStrip({
  courseTitle,
  courseSlug,
  currentLessonTitle,
  totalLessons,
  completedCount,
}) {
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  /* SVG ring maths (radius 16, circumference ≈ 100.53) */
  const R = 16;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;

  /* Simple streak from localStorage */
  const streak = useMemo(() => {
    try {
      const raw = localStorage.getItem('certnova-streak');
      if (!raw) return 1;
      const data = JSON.parse(raw);
      const today = new Date().toDateString();
      if (data.lastDate === today) return data.count || 1;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (data.lastDate === yesterday) {
        const next = { count: (data.count || 0) + 1, lastDate: today };
        localStorage.setItem('certnova-streak', JSON.stringify(next));
        return next.count;
      }
      localStorage.setItem('certnova-streak', JSON.stringify({ count: 1, lastDate: today }));
      return 1;
    } catch {
      return 1;
    }
  }, []);

  return (
    <div className="cpstrip" role="navigation" aria-label="Course progress">
      {/* Left — Breadcrumb */}
      <div className="cpstrip__crumbs">
        <Link to="/courses" className="cpstrip__crumb">Courses</Link>
        <span className="cpstrip__sep">›</span>
        <Link to={`/courses/${courseSlug}`} className="cpstrip__crumb">{courseTitle}</Link>
        <span className="cpstrip__sep">›</span>
        <span className="cpstrip__crumb cpstrip__crumb--active">{currentLessonTitle}</span>
      </div>

      {/* Center — Progress bar */}
      <div className="cpstrip__progress">
        <span className="cpstrip__progress-label">
          {completedCount} of {totalLessons} lessons completed
        </span>
        <div className="cpstrip__bar">
          <div className="cpstrip__bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Right — Ring + Streak */}
      <div className="cpstrip__right">
        <div className="cpstrip__ring-wrap" title={`${pct}% complete`}>
          <svg className="cpstrip__ring" viewBox="0 0 36 36" width="36" height="36">
            <circle className="cpstrip__ring-bg" cx="18" cy="18" r={R} />
            <circle
              className="cpstrip__ring-fg"
              cx="18"
              cy="18"
              r={R}
              strokeDasharray={C}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="cpstrip__ring-pct">{pct}%</span>
        </div>

        {pct === 100 ? (
          <span className="cpstrip__streak cpstrip__streak--done">
            <Trophy size={14} /> Done!
          </span>
        ) : (
          <span className="cpstrip__streak">
            <Flame size={14} /> {streak} day streak
          </span>
        )}
      </div>
    </div>
  );
}
