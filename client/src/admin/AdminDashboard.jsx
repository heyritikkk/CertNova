import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const emptyCourse = {
  cover_title: '',
  cover_subtitle: '',
  level: '',
  duration: '',
  title: '',
  description: '',
  cta_text: 'View Course',
  image_url: '',
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [editingCourseId, setEditingCourseId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then((res) => res.json())
      .then((coursesData) => {
        setCourses(coursesData || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin data:', err);
        setLoading(false);
      });
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.description) return;
    setSaving(true);

    const payload = {
      ...courseForm,
      cover_title: courseForm.cover_title || courseForm.title,
      cover_subtitle: courseForm.cover_subtitle || courseForm.description,
      level: courseForm.level || 'Advanced',
      duration: courseForm.duration || '10h',
      cta_text: courseForm.cta_text || 'View Course',
      image_url: courseForm.image_url || '',
    };

    const method = editingCourseId ? 'PUT' : 'POST';
    const url = editingCourseId
      ? `http://localhost:5000/api/courses/${editingCourseId}`
      : 'http://localhost:5000/api/courses';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Failed to save course.');
        }
        return data;
      })
      .then((data) => {
        if (editingCourseId) {
          setCourses((prev) => prev.map((course) => (course.id === editingCourseId ? { ...course, ...payload } : course)));
          showMessage('Course updated successfully!');
        } else {
          setCourses((prev) => [...prev, data]);
          showMessage('Course created successfully!');
        }
        setCourseForm(emptyCourse);
        setEditingCourseId(null);
        setSaving(false);
      })
      .catch((err) => {
        console.error('Failed to save course:', err);
        setSaving(false);
        showMessage(`Error saving course: ${err.message}`);
      });
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      cover_title: course.cover_title || '',
      cover_subtitle: course.cover_subtitle || '',
      level: course.level || '',
      duration: course.duration || '',
      title: course.title || '',
      description: course.description || '',
      cta_text: course.cta_text || 'View Course',
      image_url: course.image_url || '',
    });
    setEditingCourseId(course.id);
    setActiveSection('courses');
  };

  const handleDeleteCourse = (courseId) => {
    fetch(`http://localhost:5000/api/courses/${courseId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then(() => {
        setCourses((prev) => prev.filter((course) => course.id !== courseId));
        if (editingCourseId === courseId) {
          setCourseForm(emptyCourse);
          setEditingCourseId(null);
        }
        showMessage('Course deleted successfully!');
      })
      .catch((err) => {
        console.error('Failed to delete course:', err);
        showMessage('Error deleting course.');
      });
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.href = '/admin-login';
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>CertNova Admin</h3>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveSection('courses')}
          >
            Courses
          </button>
        </nav>

        <button type="button" className="admin-sidebar-logout" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <div className="admin-main">
        <div className="admin-card">
          <div className="admin-header">
            <div>
              <h2>Admin Portal</h2>
              <p>Manage your course cards and course details.</p>
            </div>
          </div>

          {message && (
            <div className={`admin-message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {activeSection === 'dashboard' && (
            <section className="admin-section">
              <h3>Dashboard Overview</h3>
              <div className="admin-stats">
                <div className="stat-card">
                  <p className="stat-label">Courses</p>
                  <strong>{courses.length}</strong>
                  <span>Active course cards</span>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'courses' && (
            <section className="admin-section">
              <h3>Course Cards</h3>
              <div className="admin-grid">
                <div className="admin-panel">
                  <form onSubmit={handleCourseSubmit} className="admin-form">
                    <div className="form-group">
                      <label htmlFor="course-cover-title">Cover Title</label>
                      <input id="course-cover-title" name="cover_title" value={courseForm.cover_title} onChange={handleCourseChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="course-cover-subtitle">Cover Subtitle</label>
                      <textarea id="course-cover-subtitle" name="cover_subtitle" value={courseForm.cover_subtitle} onChange={handleCourseChange} rows="3" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="course-level">Level</label>
                      <input id="course-level" name="level" value={courseForm.level} onChange={handleCourseChange} placeholder="Advanced" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="course-duration">Duration</label>
                      <input id="course-duration" name="duration" value={courseForm.duration} onChange={handleCourseChange} placeholder="10h" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="course-title">Title</label>
                      <input id="course-title" name="title" value={courseForm.title} onChange={handleCourseChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="course-description">Description</label>
                      <textarea id="course-description" name="description" value={courseForm.description} onChange={handleCourseChange} rows="4" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="course-cta-text">CTA Text</label>
                      <input id="course-cta-text" name="cta_text" value={courseForm.cta_text} onChange={handleCourseChange} placeholder="View Course" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="course-image-url">Top Image URL (optional)</label>
                      <input id="course-image-url" name="image_url" value={courseForm.image_url} onChange={handleCourseChange} placeholder="https://..." />
                    </div>
                    <button type="submit" className="admin-submit-btn" disabled={saving}>{editingCourseId ? 'Update Course' : 'Add Course'}</button>
                  </form>
                </div>
                <div className="admin-list">
                  {courses.length === 0 ? (
                    <div className="list-empty">
                      <strong>No courses yet</strong>
                      <p>Add your first course from the form on the left.</p>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <div className="list-item" key={course.id}>
                        <div>
                          <small>{course.cover_title}</small>
                          <strong>{course.title}</strong>
                          <p>{course.description}</p>
                        </div>
                        <div className="list-actions">
                          <button type="button" className="small-btn" onClick={() => handleEditCourse(course)}>Edit</button>
                          <button type="button" className="small-btn danger" onClick={() => handleDeleteCourse(course.id)}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          <div className="admin-footer">
            <a href="/" className="back-link">Back to Main Site</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
