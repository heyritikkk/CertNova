import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'career-guides', label: 'Career Guides' },
  { id: 'technical-tutorials', label: 'Technical Tutorials' },
  { id: 'breach-breakdowns', label: 'Breach Breakdowns' },
  { id: 'security-news', label: 'Security News' },
];

/** Bump when replacing files under public/blog/ to bust browser cache. */
const BLOG_IMAGE_VERSION = 2;

function blogImageSrc(path) {
  if (!path) return null;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}v=${BLOG_IMAGE_VERSION}`;
}

import { POSTS } from '../data/blogPosts';

function categorySlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

function BlogPostThumb({ post, category, variant = 'square' }) {
  const slug = categorySlug(category);
  const wide = variant === 'wide';
  const src = blogImageSrc(post?.image);
  const alt = post?.imageAlt ?? `${category} article cover`;

  return (
    <div
      className={`blog-thumb blog-thumb--${slug}${wide ? ' blog-thumb--wide' : ''}${src ? ' blog-thumb--has-image' : ''}`}
    >
      {src ? (
        <img
          className="blog-thumb__img"
          src={src}
          alt={alt}
          loading={wide ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : null}
      <span className="blog-thumb__label">{category}</span>
    </div>
  );
}

function BlogFeatured({ post }) {
  return (
    <article className="blog-featured">
      <div className="blog-featured__content">
        <span className="blog-eyebrow">Featured</span>
        <h2 className="blog-featured__title">
          {post.titleLines ? (
            post.titleLines.map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))
          ) : (
            post.title
          )}
        </h2>
        <p className="blog-featured__meta">
          <time dateTime={post.date}>{post.date}</time>
          <span> {post.category}</span>
        </p>
        <Link to={`/blog/${post.slug}`} className="blog-read-btn">
          Read blog
        </Link>
      </div>
      <BlogPostThumb post={post} category={post.category} variant="wide" />
    </article>
  );
}

const Blog = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const featuredPost = useMemo(() => POSTS.find((post) => post.featured), []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return POSTS;
    return POSTS.filter((post) => post.filterId === activeFilter);
  }, [activeFilter]);

  const gridPosts = useMemo(() => {
    if (activeFilter === 'all' && featuredPost) {
      return filteredPosts.filter((post) => post.id !== featuredPost.id);
    }
    return filteredPosts;
  }, [activeFilter, filteredPosts, featuredPost]);

  const showFeatured = activeFilter === 'all' && featuredPost;

  return (
    <div className="blog-page">
      <div className="blog-inner">
        <header className="blog-hero">
          <span className="blog-eyebrow">Blog</span>
          <h1>Security+ study guides and exam insights</h1>
          <p>Study tips and exam-focused articles for your Security+ path.</p>
        </header>

        {showFeatured && <BlogFeatured post={featuredPost} />}

        <div className="blog-tabs-wrap">
          <div className="blog-tabs" role="tablist" aria-label="Filter posts by topic">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter.id}
                className={`blog-tab${activeFilter === filter.id ? ' is-active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {gridPosts.length > 0 ? (
          <div className="blog-grid">
            {gridPosts.map((post) => (
              <article key={post.id} className="blog-row">
                <div className="blog-row__content">
                  <h2 className="blog-row__title">{post.title}</h2>
                  <p className="blog-row__meta">
                    <time dateTime={post.date}>{post.date}</time>
                    <span className="blog-row__meta-sep" aria-hidden>
                      {' '}
                    </span>
                    <span>{post.category}</span>
                  </p>
                  <Link to={`/blog/${post.slug}`} className="blog-read-btn">
                    Read blog
                  </Link>
                </div>
                <BlogPostThumb post={post} category={post.category} />
              </article>
            ))}
          </div>
        ) : !showFeatured ? (
          <p className="blog-empty">
            No articles in {FILTERS.find((f) => f.id === activeFilter)?.label ?? 'this topic'}{' '}
            yet. Check back soon.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Blog;
