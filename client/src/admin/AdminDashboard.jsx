import React, { useState, useEffect } from 'react';
import CourseContentBuilder from '../components/CourseContentBuilder';
import CourseOutlineSidebar from '../components/CourseOutlineSidebar';
import { api, isCardReady, buildCoursePayload } from '../lib/api';
import { courseToContentBlocks, createMarkdownBlock } from '../lib/contentBlocks';
import './AdminDashboard.css';

const TABS = [
  { id: 'card', label: 'Course card' },
  { id: 'detail', label: 'Detail page' },
  { id: 'content', label: 'Course content' },
  { id: 'settings', label: 'Price & publish' },
];

const emptyForm = () => ({
  title: '',
  description: '',
  cover_title: '',
  cover_subtitle: '',
  level: 'Beginner',
  duration: '10h',
  cta_text: 'View Course',
  image_url: '',
  slug: '',
  price: 0,
  published: false,
  detail_description: '',
  learning_outcomes: '',
  instructor_name: '',
  rating: 4.7,
  student_count: '',
  language: 'English',
  content_blocks: [createMarkdownBlock()],
});

const courseToForm = (course) => ({
  title: course.title || '',
  description: course.description || '',
  cover_title: course.cover_title || '',
  cover_subtitle: course.cover_subtitle || '',
  level: course.level || 'Beginner',
  duration: course.duration || '10h',
  cta_text: course.cta_text || 'View Course',
  image_url: course.image_url || '',
  slug: course.slug || '',
  price: course.price ?? 0,
  published: Boolean(course.published),
  detail_description: course.detail_description || '',
  learning_outcomes: course.learning_outcomes || '',
  instructor_name: course.instructor_name || '',
  rating: course.rating ?? 4.7,
  student_count: course.student_count || '',
  language: course.language || 'English',
  content_blocks: courseToContentBlocks(course),
});

const AdminDashboard = () => {
  const [view, setView] = useState('list');
  const [currentSection, setCurrentSection] = useState('courses'); // 'courses' | 'analytics'
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('card');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(null);

  // Dynamic Sidebar Resizing
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('certnova_admin_sidebar_width');
    return saved ? parseInt(saved, 10) : 272;
  });
  const [isResizing, setIsResizing] = useState(false);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isResizing) return;
    const newWidth = Math.max(200, Math.min(450, e.clientX));
    setSidebarWidth(newWidth);
  };

  const handlePointerUp = (e) => {
    if (!isResizing) return;
    setIsResizing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    const finalWidth = Math.max(200, Math.min(450, e.clientX));
    setSidebarWidth(finalWidth);
    localStorage.setItem('certnova_admin_sidebar_width', finalWidth);
  };

  // Lifted Analytics States
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const fetchAnalytics = () => {
    setAnalyticsLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/analytics`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load analytics data.');
        return res.json();
      })
      .then(json => {
        setAnalyticsData(json);
        setAnalyticsError(null);
      })
      .catch(err => {
        setAnalyticsError(err.message);
      })
      .finally(() => setAnalyticsLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Analytics handlers simplified

  const loadCourses = () =>
    api
      .getAllCourses()
      .then(setCourses)
      .catch((err) => showMessage(`Error loading courses: ${err.message}`, true));

  useEffect(() => {
    loadCourses().finally(() => setLoading(false));
  }, []);

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const cardReady = isCardReady(form);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const pickDefaultBlockId = (contentBlocks) =>
    contentBlocks.find((b) => b.type === 'markdown')?.id || contentBlocks[0]?.id || null;

  const openNew = () => {
    const initial = emptyForm();
    setForm(initial);
    setEditingId(null);
    setActiveBlockId(pickDefaultBlockId(initial.content_blocks));
    setActiveTab('card');
    setView('editor');
  };

  const openEdit = (course) => {
    const nextForm = courseToForm(course);
    setForm(nextForm);
    setEditingId(course.id);
    setActiveBlockId(pickDefaultBlockId(nextForm.content_blocks));
    setActiveTab('card');
    setView('editor');
  };

  const handleSave = async () => {
    if (!cardReady) {
      showMessage('Fill title, description, level, and duration to save.', true);
      setActiveTab('card');
      return;
    }

    const wasNew = !editingId;
    setSaving(true);
    try {
      const payload = buildCoursePayload(form);
      const saved = editingId
        ? await api.updateCourse(editingId, payload)
        : await api.createCourse(payload);

      setEditingId(saved.id);
      setForm(courseToForm(saved));
      await loadCourses();
      showMessage(wasNew ? 'Course created.' : 'Course updated.');
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (publish) => {
    if (!editingId) {
      showMessage('Save the course first before publishing.', true);
      return;
    }

    setSaving(true);
    try {
      const saved = await api.setPublished(editingId, publish);
      setForm((prev) => ({ ...prev, published: Boolean(saved.published) }));
      await loadCourses();
      showMessage(publish ? 'Course published on the main site.' : 'Course unpublished.');
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course permanently?')) return;
    try {
      await api.deleteCourse(id);
      if (editingId === id) {
        setView('list');
        setForm(emptyForm());
        setEditingId(null);
      }
      await loadCourses();
      showMessage('Course deleted.');
    } catch (err) {
      showMessage(err.message, true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.href = '/admin-login';
  };

  if (loading) {
    return <AdminLoadingState />;
  }

  const handleSelectOutlineBlock = (blockId) => {
    setActiveBlockId(blockId);
    setActiveTab('content');
  };

  return (
    <div
      className={`admin-container${view === 'list' ? ' admin-container--list' : ''}${
        view === 'editor' ? ' admin-container--course-editor' : ''
      }${currentSection === 'analytics' ? ' admin-container--analytics' : ''}`}
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      {view === 'list' ? (
        <AdminListSidebar 
          onNew={openNew} 
          onLogout={handleLogout} 
          currentSection={currentSection}
          onSelectSection={(sec) => {
            setCurrentSection(sec);
            setView('list');
          }}
          onRefreshAnalytics={fetchAnalytics}
          analyticsLoading={analyticsLoading}
        />
      ) : (
        <>
          <CourseOutlineSidebar
            blocks={form.content_blocks}
            activeBlockId={activeBlockId}
            onSelectBlock={handleSelectOutlineBlock}
            onBlocksChange={(content_blocks) => setForm((prev) => ({ ...prev, content_blocks }))}
            onBack={() => setView('list')}
            courseTitle={form.title || 'New course'}
            onLogout={handleLogout}
          />
          <div
            className={`admin-sidebar-resize-handle ${isResizing ? 'is-resizing' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </>
      )}

      <div className="admin-main">
        <div
          className={`admin-card${view === 'list' ? ' admin-card--list' : ''}${
            view === 'editor' ? ' admin-card--editor' : ''
          }`}
        >
          {message && (
            <div className={`admin-message ${message.isError ? 'error' : 'success'}`}>{message.text}</div>
          )}

          {view === 'list' ? (
            currentSection === 'courses' ? (
              <CourseListView courses={courses} onNew={openNew} onEdit={openEdit} onDelete={handleDelete} />
            ) : (
              <AnalyticsDashboard 
                data={analyticsData}
                loading={analyticsLoading}
                error={analyticsError}
                courses={courses}
              />
            )
          ) : (
            <CourseEditorView
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              cardReady={cardReady}
              saving={saving}
              editingId={editingId}
              activeBlockId={activeBlockId}
              onActiveBlockChange={setActiveBlockId}
              onChange={handleChange}
              onSave={handleSave}
              onPublishToggle={handlePublishToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

function AdminLoadingState() {
  return <div className="admin-loading">Loading…</div>;
}

function AdminListSidebar({ 
  onNew, 
  onLogout, 
  currentSection, 
  onSelectSection,
  onRefreshAnalytics,
  analyticsLoading
}) {
  return (
    <aside className="admin-sidebar admin-sidebar--list">
      <div className="admin-sidebar-head">
        <h3>CertNova Admin</h3>
        <p>Manage courses and publish to the public site.</p>
      </div>
      <nav className="admin-nav">
        <button 
          type="button" 
          className={`admin-nav-item ${currentSection === 'courses' ? 'active' : ''}`}
          onClick={() => onSelectSection('courses')}
        >
          All courses
        </button>
        <button 
          type="button" 
          className={`admin-nav-item ${currentSection === 'analytics' ? 'active' : ''}`}
          onClick={() => onSelectSection('analytics')}
        >
          Analytics
        </button>

        {currentSection === 'analytics' && (
          <div className="admin-sidebar-submenu">
            <span className="submenu-title">Analytics Tools</span>
            <button type="button" className="admin-submenu-item" onClick={onRefreshAnalytics} disabled={analyticsLoading}>
              🔄 {analyticsLoading ? 'Refreshing...' : 'Refresh Stats'}
            </button>
          </div>
        )}

        <button type="button" className="admin-nav-item admin-nav-item--secondary" onClick={onNew}>
          + New course
        </button>
      </nav>
      <div className="admin-sidebar-footer">
        <button type="button" className="admin-sidebar-logout" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}

function CourseListView({ courses, onNew, onEdit, onDelete }) {
  const publishedCount = courses.filter((c) => c.published).length;

  const draftCount = courses.length - publishedCount;

  return (
    <div className="admin-list-shell">
      <header className="admin-list-topbar">
        <div className="admin-list-topbar-text">
          <h2>Course manager</h2>
          <p>
            <span>{courses.length} total</span>
            <span className="admin-list-stat-sep"> · </span>
            <span>{publishedCount} published</span>
            <span className="admin-list-stat-sep"> · </span>
            <span>{draftCount} drafts</span>
          </p>
        </div>
        <button type="button" className="admin-submit-btn admin-submit-btn--compact" onClick={onNew}>
          New course
        </button>
      </header>

      <div className="admin-list-body">
        <CourseTable courses={courses} onEdit={onEdit} onDelete={onDelete} onNew={onNew} />
      </div>

      <footer className="admin-list-footer">
        <a href="/" className="admin-list-site-link">
          Back to main site
        </a>
      </footer>
    </div>
  );
}

function CourseTable({ courses, onEdit, onDelete, onNew }) {
  if (courses.length === 0) {
    return <CourseTableEmpty onNew={onNew} />;
  }

  return (
    <div className="admin-course-table">
      {courses.map((course) => (
        <article className="admin-course-row" key={course.id}>
          <div className="admin-course-row-main">
            <span className={`status-pill ${course.published ? 'published' : 'draft'}`}>
              {course.published ? 'Published' : 'Draft'}
            </span>
            <strong>{course.title || 'Untitled course'}</strong>
            <p>
              {course.level} · {course.duration} ·{' '}
              {Number(course.price) > 0 ? `$${course.price}` : 'Free'}
            </p>
          </div>
          <div className="admin-course-row-actions">
            <button type="button" className="admin-btn admin-btn--primary" onClick={() => onEdit(course)}>
              Edit
            </button>
            <button type="button" className="admin-btn admin-btn--danger" onClick={() => onDelete(course.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function CourseTableEmpty({ onNew }) {
  return (
    <div className="admin-course-empty">
      <strong>No courses yet</strong>
      <p>Create your first course, save it, then publish to show it on the public Courses page.</p>
      <button type="button" className="admin-submit-btn admin-submit-btn--compact" onClick={onNew}>
        Create course
      </button>
    </div>
  );
}

function CourseEditorView({
  form,
  setForm,
  activeTab,
  setActiveTab,
  cardReady,
  saving,
  editingId,
  activeBlockId,
  onActiveBlockChange,
  onChange,
  onSave,
  onPublishToggle,
}) {
  return (
    <div className="admin-editor-shell">
      <div className="admin-editor-topbar">
        <div className="admin-editor-topbar-text">
          <h2>{editingId ? 'Edit course' : 'New course'}</h2>
          <p>
            {cardReady
              ? 'Save your changes, then publish to update the public Courses page.'
              : 'Fill title, description, level, and duration before saving.'}
          </p>
        </div>
        <button
          type="button"
          className="admin-submit-btn admin-submit-btn--compact"
          onClick={onSave}
          disabled={saving || !cardReady}
        >
          {saving ? 'Saving…' : editingId ? 'Save changes' : 'Save course'}
        </button>
      </div>

      <div className="admin-tabs admin-tabs--editor">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`admin-editor-form${activeTab === 'content' ? ' admin-editor-form--content' : ''}`}>
        {activeTab === 'card' && (
          <div className="admin-editor-form-inner">
            <CardTab form={form} onChange={onChange} />
          </div>
        )}
        {activeTab === 'detail' && (
          <div className="admin-editor-form-inner">
            <DetailTab form={form} onChange={onChange} />
          </div>
        )}
        {activeTab === 'content' && (
          <section className="admin-section admin-section--content">
            <CourseContentBuilder
              blocks={form.content_blocks}
              onChange={(content_blocks) => setForm((prev) => ({ ...prev, content_blocks }))}
              activeBlockId={activeBlockId}
              onActiveBlockChange={onActiveBlockChange}
            />
          </section>
        )}
        {activeTab === 'settings' && (
          <div className="admin-editor-form-inner">
            <SettingsTab
              form={form}
              onChange={onChange}
              onPublishToggle={onPublishToggle}
              saving={saving}
              editingId={editingId}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CardTab({ form, onChange }) {
  return (
    <section className="admin-section">
      <h3>Course card (required)</h3>
      <p className="section-hint">These fields power the card on the public courses page.</p>
      <div className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" name="title" value={form.title} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="level">Level *</label>
            <select id="level" name="level" value={form.level} onChange={onChange} required>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description">Short description *</label>
          <textarea id="description" name="description" value={form.description} onChange={onChange} rows={3} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cover_title">Cover title</label>
            <input
              id="cover_title"
              name="cover_title"
              value={form.cover_title}
              onChange={onChange}
              placeholder="Defaults to title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="duration">Duration *</label>
            <input id="duration" name="duration" value={form.duration} onChange={onChange} placeholder="10h" required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="cover_subtitle">Cover subtitle</label>
          <textarea
            id="cover_subtitle"
            name="cover_subtitle"
            value={form.cover_subtitle}
            onChange={onChange}
            rows={2}
            placeholder="Defaults to short description"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cta_text">Button label</label>
            <input id="cta_text" name="cta_text" value={form.cta_text} onChange={onChange} />
          </div>
          <div className="form-group">
            <label htmlFor="image_url">Cover image URL</label>
            <input id="image_url" name="image_url" value={form.image_url} onChange={onChange} placeholder="https://..." />
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailTab({ form, onChange }) {
  return (
    <section className="admin-section">
      <h3>Course detail page</h3>
      <p className="section-hint">
        Shown when learners open a course from the catalog. Course content below is built from the
        Course content tab; save and publish to update the live site.
      </p>
      <div className="admin-form">
        <div className="form-group">
          <label htmlFor="detail_description">Long description (hero)</label>
          <textarea
            id="detail_description"
            name="detail_description"
            value={form.detail_description}
            onChange={onChange}
            rows={4}
            placeholder="Full course pitch on the detail page. Leave empty to use the short card description."
          />
        </div>
        <div className="form-group">
          <label htmlFor="learning_outcomes">What you&apos;ll learn</label>
          <textarea
            id="learning_outcomes"
            name="learning_outcomes"
            value={form.learning_outcomes}
            onChange={onChange}
            rows={6}
            placeholder={'One outcome per line\ne.g. Understand core Security+ domains'}
          />
          <small>One bullet per line.</small>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="instructor_name">Instructor</label>
            <input
              id="instructor_name"
              name="instructor_name"
              value={form.instructor_name}
              onChange={onChange}
              placeholder="e.g. Jonas Schmedtmann"
            />
          </div>
          <div className="form-group">
            <label htmlFor="student_count">Student count label</label>
            <input
              id="student_count"
              name="student_count"
              value={form.student_count}
              onChange={onChange}
              placeholder="e.g. 350k Students"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rating">Rating (0–5)</label>
            <input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <input
              id="language"
              name="language"
              value={form.language}
              onChange={onChange}
              placeholder="English"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SettingsTab({ form, onChange, onPublishToggle, saving, editingId }) {
  return (
    <section className="admin-section">
      <h3>Price & visibility</h3>
      <div className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (USD)</label>
            <input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} />
            <small>Set 0 for free courses.</small>
          </div>
          <div className="form-group">
            <label htmlFor="slug">URL slug</label>
            <input id="slug" name="slug" value={form.slug} onChange={onChange} placeholder="auto-generated from title" />
          </div>
        </div>
        <div className="publish-actions">
          <span className={`status-pill ${form.published ? 'published' : 'draft'}`}>
            {form.published ? 'Published' : 'Draft'}
          </span>
          <button
            type="button"
            className="admin-submit-btn"
            disabled={saving || !editingId}
            onClick={() => onPublishToggle(true)}
          >
            Publish
          </button>
          <button
            type="button"
            className="small-btn"
            disabled={saving || !editingId || !form.published}
            onClick={() => onPublishToggle(false)}
          >
            Unpublish
          </button>
        </div>
        {!editingId && <p className="section-hint">Save the course once, then you can publish it to the main site.</p>}
      </div>
    </section>
  );
}

// ── Analytics Dashboard Component ──
function AnalyticsDashboard({ data, loading, error, courses = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'purchased' | 'non-purchased'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'week'
  const [platformFilter, setPlatformFilter] = useState('all'); // 'all' | 'google' | 'linkedin' | 'github' | 'twitter' | 'direct'
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'paid' | 'free'

  const getReferrerGradient = (name) => {
    switch (name.toLowerCase()) {
      case 'google': return 'linear-gradient(90deg, #ea4335 0%, #fbbc05 50%, #34a853 100%)';
      case 'linkedin': return 'linear-gradient(90deg, #0a66c2 0%, #0077b5 100%)';
      case 'github': return 'linear-gradient(90deg, #0f172a 0%, #475569 100%)';
      case 'twitter': return 'linear-gradient(90deg, #1d9bf0 0%, #7e22ce 100%)';
      default: return 'linear-gradient(90deg, #ff9e7a 0%, #f48b60 100%)';
    }
  };

  // Summarize stats
  const totalVisitors = data.length;
  const purchasers = data.filter(d => {
    try {
      const list = JSON.parse(d.purchased_courses || '[]');
      return list.length > 0;
    } catch {
      return false;
    }
  });
  const totalPurchases = purchasers.length;
  
  
  // Conversion Rate
  const conversionRate = totalVisitors > 0 
    ? ((totalPurchases / totalVisitors) * 100).toFixed(1) 
    : '0.0';

  const activeLearners = data.filter(d => d.active_lesson && d.active_lesson.trim() !== '').length;

  // Process referrers chart data
  const referrerCounts = {};
  data.forEach(d => {
    const ref = d.referrer || 'Direct';
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
  });
  const referrerTotal = Object.values(referrerCounts).reduce((a, b) => a + b, 0);
  const referrerSummary = Object.entries(referrerCounts)
    .map(([name, count]) => ({
      name,
      count,
      percent: referrerTotal > 0 ? Math.round((count / referrerTotal) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Filter visitor rows
  const filteredData = data.filter(d => {
    const nameMatch = (d.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (d.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchSearch = nameMatch || emailMatch;

    let matchFilter = true;
    let purchasedList = [];
    try {
      purchasedList = JSON.parse(d.purchased_courses || '[]');
    } catch {
      purchasedList = [];
    }

    if (filterType === 'purchased') {
      matchFilter = purchasedList.length > 0;
    } else if (filterType === 'non-purchased') {
      matchFilter = purchasedList.length === 0;
    }

    // Platform wise filter
    let matchPlatform = true;
    if (platformFilter !== 'all') {
      matchPlatform = (d.referrer || 'Direct').toLowerCase() === platformFilter.toLowerCase();
    }

    // Day wise filter
    let matchTime = true;
    if (timeFilter !== 'all' && d.updated_at) {
      const visitorDate = new Date(d.updated_at);
      const today = new Date();
      
      if (timeFilter === 'today') {
        matchTime = visitorDate.toDateString() === today.toDateString();
      } else if (timeFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        matchTime = visitorDate.toDateString() === yesterday.toDateString();
      } else if (timeFilter === 'week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        matchTime = visitorDate >= sevenDaysAgo;
      }
    }

    // Payment filter
    let matchPayment = true;
    if (paymentFilter !== 'all') {
      const paidSlugs = (courses || []).filter(c => Number(c.price) > 0).map(c => c.slug);
      const freeSlugs = (courses || []).filter(c => Number(c.price) === 0).map(c => c.slug);
      
      const isPaid = purchasedList.some(slug => paidSlugs.includes(slug));
      const isFree = purchasedList.some(slug => freeSlugs.includes(slug));
      
      if (paymentFilter === 'paid') {
        matchPayment = isPaid;
      } else if (paymentFilter === 'free') {
        matchPayment = isFree;
      }
    }

    return matchSearch && matchFilter && matchPlatform && matchTime && matchPayment;
  });

  return (
    <div className="analytics-shell">
      <header className="analytics-topbar">
        <div className="analytics-topbar-text">
          <h2>Analytics Dashboard</h2>
          <p>Real-time insights into visitor acquisition, conversion rates, and active learning trends.</p>
        </div>
      </header>

      {loading && data.length === 0 ? (
        <div className="analytics-loading-spinner">Loading analytics statistics...</div>
      ) : error ? (
        <div className="analytics-error-box">Error: {error}</div>
      ) : (
        <div className="analytics-content">
          {/* STATS TILES */}
          <div className="analytics-stats-grid">
            <div className="analytics-stat-card">
              <div className="stat-icon-wrapper visitor-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label-text">Total Visitors</span>
                <strong>{totalVisitors}</strong>
                <span className="stat-subtext">Unique persistent sessions</span>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="stat-icon-wrapper conversion-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-2-2"/></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label-text">Conversion Rate</span>
                <strong>{conversionRate}%</strong>
                <span className="stat-subtext">Purchasers of total visitors</span>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="stat-icon-wrapper purchase-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label-text">Paid Purchases</span>
                <strong>{totalPurchases}</strong>
                <span className="stat-subtext">Courses unlocked successfully</span>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="stat-icon-wrapper learner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label-text">Active Learners</span>
                <strong>{activeLearners}</strong>
                <span className="stat-subtext">Currently studying lessons</span>
              </div>
            </div>
          </div>

          <div className="analytics-visuals-grid">
            {/* REFERRER CARD */}
            <div className="analytics-chart-panel">
              <h3>Where Visitors Came From</h3>
              <p className="panel-desc">Top traffic channels by acquisition referrer</p>
              <div className="referrer-list">
                {referrerSummary.length === 0 ? (
                  <p className="no-data-text">No traffic channels recorded yet.</p>
                ) : (
                  referrerSummary.map((ref) => (
                    <div className="referrer-bar-item" key={ref.name}>
                      <div className="ref-label-row">
                        <span className="ref-name">{ref.name}</span>
                        <span className="ref-count-val">{ref.count} ({ref.percent}%)</span>
                      </div>
                      <div className="bar-outer">
                        <div 
                          className="bar-inner" 
                          style={{ 
                            width: `${ref.percent}%`,
                            background: getReferrerGradient(ref.name)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>


          </div>

          {/* RECENT VISITOR ACTIVITY TABLE */}
          <div className="analytics-table-panel">
            <div className="table-panel-header">
              <h3>Recent Visitor Activity</h3>
              <div className="table-controls">
                <input 
                  type="text" 
                  className="table-search-input" 
                  placeholder="Search by name or email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                  className="table-filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Visitors</option>
                  <option value="purchased">Purchased Course</option>
                  <option value="non-purchased">Did Not Purchase</option>
                </select>
                <select 
                  className="table-filter-select"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                </select>
                <select 
                  className="table-filter-select"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="google">Google</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="twitter">Twitter</option>
                  <option value="direct">Direct</option>
                </select>
                <select 
                  className="table-filter-select"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid Purchases</option>
                  <option value="free">Free Course Access</option>
                </select>
              </div>
            </div>

            <div className="analytics-table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Visitor Info</th>
                    <th>Referrer</th>
                    <th>Visits</th>
                    <th>Course Access</th>
                    <th>Current Lesson</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="table-empty-row">
                        No visitors match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((visitor) => {
                      let purchasedList = [];
                      try {
                        purchasedList = JSON.parse(visitor.purchased_courses || '[]');
                      } catch {
                        purchasedList = [];
                      }
                      
                      const isMock = visitor.visitor_id.startsWith('v_mock_');
                      const friendlyTime = new Date(visitor.updated_at).toLocaleString();

                      return (
                        <tr key={visitor.id} className={isMock ? 'mock-row' : ''}>
                          <td>
                            <div className="visitor-profile-cell">
                              <span className="visitor-name-span">{visitor.name || 'Anonymous'}</span>
                              <span className="visitor-email-span">{visitor.email || 'Anonymous'}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`referrer-badge referrer-${(visitor.referrer || 'Direct').toLowerCase()}`}>
                              {visitor.referrer || 'Direct'}
                            </span>
                          </td>
                          <td className="center-cell">{visitor.visit_count}</td>
                          <td>
                            {purchasedList.length === 0 ? (
                              <span className="badge-no-purchase">No Purchases</span>
                            ) : (
                              purchasedList.map(slug => (
                                <span className="badge-purchased-course" key={slug}>
                                  {slug === 'network-security' ? 'Security+ Core' : slug}
                                </span>
                              ))
                            )}
                          </td>
                          <td>
                            <div className="lesson-learning-cell">
                              {visitor.active_lesson ? (
                                <>
                                  <svg className="lesson-learning-bullet" width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#f48b60"/></svg>
                                  <span className="lesson-learning-title" title={visitor.active_lesson}>
                                    {visitor.active_lesson.replace('CompTIA Security+ - ', '')}
                                  </span>
                                </>
                              ) : (
                                <span className="no-lesson-span">Inactive</span>
                              )}
                            </div>
                          </td>
                          <td className="time-cell">{friendlyTime}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
