import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { POSTS } from '../data/blogPosts';
import './BlogPost.css';

/** Bump when replacing files under public/blog/ to bust browser cache. */
const BLOG_IMAGE_VERSION = 2;

function blogImageSrc(path) {
  if (!path) return null;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}v=${BLOG_IMAGE_VERSION}`;
}

const BlogPost = () => {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const src = blogImageSrc(post.image);
  const alt = post.imageAlt ?? `${post.category} article cover`;

  return (
    <div className="blog-post-page">
      <div className="blog-post-inner">
        <header className="blog-post-header">
          <div className="blog-post-meta">
            <span className="blog-post-category">{post.category}</span>
            <span className="blog-post-meta-sep">·</span>
            <time className="blog-post-date" dateTime={post.date}>{post.date}</time>
          </div>
          
          <h1 className="blog-post-title">{post.title}</h1>
          
          <div className="blog-post-author">
            {post.author || 'The Antigravity Team'}
          </div>
        </header>

        {src && (
          <div className="blog-post-hero-image">
            <img src={src} alt={alt} />
          </div>
        )}

        <article 
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
};

export default BlogPost;
