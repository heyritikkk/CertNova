import { blocksToLegacyFields } from './contentBlocks';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getAdminAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  getPublishedCourses: () => request('/api/courses'),
  getAllCourses: () => request('/api/courses?all=1', { headers: getAdminAuthHeaders() }),
  getCourse: (idOrSlug, { admin = false } = {}) =>
    request(
      `/api/courses/${idOrSlug}${admin ? '?all=1' : ''}`,
      admin ? { headers: getAdminAuthHeaders() } : {}
    ),
  createCourse: (body) =>
    request('/api/courses', { method: 'POST', headers: getAdminAuthHeaders(), body: JSON.stringify(body) }),
  updateCourse: (id, body) =>
    request(`/api/courses/${id}`, { method: 'PUT', headers: getAdminAuthHeaders(), body: JSON.stringify(body) }),
  setPublished: (id, published) =>
    request(`/api/courses/${id}/publish`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ published }),
    }),
  deleteCourse: (id) => request(`/api/courses/${id}`, { method: 'DELETE', headers: getAdminAuthHeaders() }),
};

export function isCardReady(course) {
  return Boolean(
    course?.title?.trim() &&
    course?.description?.trim() &&
    course?.level?.trim() &&
    course?.duration?.trim()
  );
}

export function buildCoursePayload(form) {
  const legacy = blocksToLegacyFields(form.content_blocks || []);

  return {
    title: form.title?.trim(),
    description: form.description?.trim(),
    cover_title: (form.cover_title || form.title)?.trim(),
    cover_subtitle: (form.cover_subtitle || form.description)?.trim(),
    level: form.level?.trim() || 'Beginner',
    duration: form.duration?.trim() || '10h',
    cta_text: form.cta_text?.trim() || 'View Course',
    image_url: form.image_url?.trim() || '',
    slug: form.slug?.trim(),
    price: Number(form.price) || 0,
    published: Boolean(form.published),
    content_markdown: legacy.content_markdown,
    quiz: legacy.quiz,
    content_blocks: legacy.content_blocks,
    detail_description: form.detail_description?.trim() || form.description?.trim(),
    learning_outcomes: form.learning_outcomes?.trim() || '',
    instructor_name: form.instructor_name?.trim() || '',
    rating: Number(form.rating) || 4.7,
    student_count: form.student_count?.trim() || '',
    language: form.language?.trim() || 'English',
  };
}
