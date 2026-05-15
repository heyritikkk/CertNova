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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('card');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(null);

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
      }`}
    >
      {view === 'list' ? (
        <AdminListSidebar onNew={openNew} onLogout={handleLogout} />
      ) : (
        <CourseOutlineSidebar
          blocks={form.content_blocks}
          activeBlockId={activeBlockId}
          onSelectBlock={handleSelectOutlineBlock}
          onBlocksChange={(content_blocks) => setForm((prev) => ({ ...prev, content_blocks }))}
          onBack={() => setView('list')}
          courseTitle={form.title || 'New course'}
          onLogout={handleLogout}
        />
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
            <CourseListView courses={courses} onNew={openNew} onEdit={openEdit} onDelete={handleDelete} />
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

function AdminListSidebar({ onNew, onLogout }) {
  return (
    <aside className="admin-sidebar admin-sidebar--list">
      <div className="admin-sidebar-head">
        <h3>CertNova Admin</h3>
        <p>Manage courses and publish to the public site.</p>
      </div>
      <nav className="admin-nav">
        <button type="button" className="admin-nav-item active">
          All courses
        </button>
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

export default AdminDashboard;
