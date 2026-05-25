import PageHeader from '../components/PageHeader';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="site-container-inner">
        <PageHeader 
          eyebrow="CONTACT US"
          title="We'd love to hear from you"
          subtitle="Have a question about our courses, bulk licensing, or anything else? Drop us a line and we'll get back to you shortly."
        />

        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-card">
              <h3>Support</h3>
              <p>For help with your account or course access.</p>
              <a href="mailto:support@certnova.com">support@certnova.com</a>
            </div>
            <div className="contact-card">
              <h3>Sales</h3>
              <p>For team licensing and enterprise inquiries.</p>
              <a href="mailto:sales@certnova.com">sales@certnova.com</a>
            </div>
          </div>

          <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" required placeholder="Jane Doe" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" required placeholder="jane@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows="5" required placeholder="How can we help?"></textarea>
            </div>
            <button type="submit" className="contact-submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
