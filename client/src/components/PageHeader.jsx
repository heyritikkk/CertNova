import './PageHeader.css';

/**
 * A reusable page header component used at the top of main pages.
 * 
 * @param {Object} props
 * @param {string} props.eyebrow - Small uppercase text above the title
 * @param {string} props.title - Large serif title
 * @param {string} props.subtitle - Descriptive subtitle below the title
 */
const PageHeader = ({ eyebrow, title, subtitle }) => {
  return (
    <header className="page-header">
      {eyebrow && <span className="page-header__eyebrow">{eyebrow}</span>}
      <h1 className="page-header__title">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    </header>
  );
};

export default PageHeader;
