import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

/**
 * SafeHTML component that sanitizes HTML content before rendering.
 * Prevents XSS attacks by only allowing safe HTML tags and attributes.
 */
const SafeHTML = ({ html, className }: SafeHTMLProps) => {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'a', 'span', 'div', 'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
  
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
};

export default SafeHTML;
