import React from 'react';
import { Star } from 'lucide-react';
import './ReviewGrid.css';

const reviews = [
  {
    text: 'The platform made Security+ concepts much easier to understand. The lessons are clear, practical, and easy to follow daily.',
    name: 'Nico Hulkenberg',
    role: 'Student',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    text: 'One of the most detailed learning platforms I have used. Labs and mock tests helped me build real exam confidence quickly.',
    name: 'Tamim Iqbal Khan',
    role: 'Student',
    avatarUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    text: 'I finally had a structured path for Security+ prep. The combination of lessons and practice labs made every study session productive.',
    name: 'Dasun Sanaka',
    role: 'Educator',
    avatarUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
  {
    text: 'CertNova keeps everything in one place and removes confusion from exam preparation. It saved me hours every week.',
    name: 'Toto Wolf',
    role: 'Engineer',
    avatarUrl: 'https://randomuser.me/api/portraits/men/66.jpg',
  },
  {
    text: 'The mock exams gave me a clear idea of my weak areas. I improved my score steadily and felt much more prepared.',
    name: 'Neha Sharma',
    role: 'Student',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    text: 'What I liked most was the practical format. It is not just theory; the labs actually helped me understand real scenarios.',
    name: 'Rohit Verma',
    role: 'Cybersecurity Intern',
    avatarUrl: 'https://randomuser.me/api/portraits/men/77.jpg',
  },
];

const LinkedInIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="14"
    height="14"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.48 1h.02C3.87 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zm7 0h3.8v2.1h.1c.53-1 1.84-2.1 3.8-2.1 4.06 0 4.8 2.67 4.8 6.1V23h-4v-7.8c0-1.86-.03-4.25-2.6-4.25-2.6 0-3 2.03-3 4.1V23h-4V8z"
    />
  </svg>
);

const ReviewGrid = () => {
  return (
    <section className="review-grid-section">
      <div className="review-grid">
        {reviews.map((review) => (
          <article className="review-card" key={review.name}>
            <div className="review-stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={16} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <p className="review-text">{review.text}</p>
            <div className="review-author">
              {review.avatarUrl ? (
                <img src={review.avatarUrl} alt={review.name} className="review-avatar-img" />
              ) : (
                <div className="review-avatar">{review.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
              )}
              <div>
                <h4 className="review-name">
                  {review.name}
                  <LinkedInIcon className="review-linkedin-icon" />
                </h4>
                <p>{review.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ReviewGrid;
