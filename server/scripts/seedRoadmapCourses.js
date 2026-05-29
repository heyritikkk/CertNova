require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');
const { slugify } = require('../courseHelpers');

async function seedRoadmapCourses() {
  const newCourses = [
    {
      title: 'Cybersecurity Fundamentals',
      description: 'Networking, how the web works, common attack types. Non-negotiable foundation.',
      cover_title: 'Cybersecurity Fundamentals',
      cover_subtitle: 'The Non-Negotiable Foundation',
      level: 'Beginner',
      duration: '2 Weeks',
      price: 0, // Free as per roadmap
      slug: 'cybersecurity-fundamentals'
    },
    {
      title: 'Web Application Security',
      description: 'OWASP Top 10, Burp Suite basics, how web apps get hacked. Essential before AppSec.',
      cover_title: 'Web Application Security',
      cover_subtitle: 'Hack Web Apps Like a Pro',
      level: 'Intermediate',
      duration: '3 Weeks',
      price: 49,
      slug: 'web-application-security'
    },
    {
      title: 'AppSec Engineering',
      description: 'Secure SDLC, threat modelling, API security, DevSecOps. This is the main path.',
      cover_title: 'AppSec Engineering',
      cover_subtitle: 'Build Secure Software',
      level: 'Advanced',
      duration: '6 Weeks',
      price: 49,
      slug: 'appsec-engineering'
    },
    {
      title: 'Cloud Security Engineering',
      description: 'AWS and Azure fundamentals, IAM, secrets management. Most AppSec roles need cloud.',
      cover_title: 'Cloud Security Engineering',
      cover_subtitle: 'Secure the Cloud Infrastructure',
      level: 'Advanced',
      duration: '3 Weeks',
      price: 49,
      slug: 'cloud-security-engineering'
    }
  ];

  try {
    console.log('Starting seed for roadmap courses...');

    for (const course of newCourses) {
      console.log(`Checking if '${course.title}' exists...`);
      const existing = await db.query('SELECT id FROM courses WHERE slug = $1', [course.slug]);

      if (existing.rows && existing.rows.length > 0) {
        console.log(`Course '${course.title}' already exists. Updating...`);
        await db.query(
          `UPDATE courses 
           SET price = $1, description = $2, published = 1, updated_at = CURRENT_TIMESTAMP
           WHERE slug = $3`,
          [course.price, course.description, course.slug]
        );
      } else {
        console.log(`Creating new course: '${course.title}'...`);
        
        // basic placeholder block
        const contentBlocksJson = JSON.stringify([
          {
            id: `intro-${course.slug}`,
            type: "markdown",
            content: `## Welcome to ${course.title}\n\nThis course is currently under development. Stay tuned for exciting content!`
          }
        ]);

        await db.query(
          `INSERT INTO courses (
            title, description, cover_title, cover_subtitle, level, duration,
            cta_text, image_url, slug, price, published, content_markdown, quiz_json,
            content_blocks_json, detail_description, learning_outcomes, instructor_name,
            rating, student_count, language, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )`,
          [
            course.title,
            course.description,
            course.cover_title,
            course.cover_subtitle,
            course.level,
            course.duration,
            'Start Learning',
            '/images/course-placeholder.jpg',
            course.slug,
            course.price,
            1, // Published
            '', 
            '{}', 
            contentBlocksJson,
            `Detailed syllabus for ${course.title} is coming soon.`,
            JSON.stringify([`Master ${course.title} concepts`, "Gain practical skills", "Advance your career"]),
            'CertNova Team',
            '4.8',
            100,
            'English'
          ]
        );
      }
    }
    console.log('✅ Roadmap courses seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed roadmap courses:', error.message);
  } finally {
    process.exit(0);
  }
}

seedRoadmapCourses();
