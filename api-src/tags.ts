// noops that help prettier format
// and extensions like es6-string-html to syntax highlight
import escapeHtml from 'escape-html';

export const html = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  sanitize(strings, values, escapeHtmlValue);

export const css = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  sanitize(strings, values, escapeCSSValue);

export const js = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  sanitize(strings, values, escapeJSValue);

export const attrs = (attrs: Record<string, unknown>): string[] =>
  Object.keys(attrs).map((attr) => html` ${attr}="${attrs[attr]}"`);

export const json = (data: object) => {
  let json = JSON.stringify(data, null, 2);

  // Escape anything that might break out of <script> in older browsers or obscure cases.
  // - <\/script> ensures </script> cannot close the tag
  // - <\!-- ensures <!-- cannot start an HTML comment
  json = json.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

  return unsafeContent(json);
};

export const unsafeContent = (value: string): string => new SanitizedString(value) as unknown as string;

export function escapeHtmlValue(value: unknown): string {
  return escapeHtml(String(value));
}

const allowedDomains = ['image.mux.com'];

function escapeCSSValue(value: unknown): string {
  // Allow numbers
  if (!isNaN(Number(value))) return String(value);

  // Disallow non-strings
  if (typeof value !== 'string') return '';

  // Disallow unsafe URIs
  if (isJavascriptURI(value) || (value.startsWith('data:') && !isSafeDataURI(value))) {
    return 'removed';
  }

  // Only allow safe domains
  if (value.startsWith('http')) {
    try {
      const url = new URL(value, 'https://example.com');
      if (!allowedDomains.includes(url.hostname)) return 'removed';
    } catch (e) {
      // Not a valid URL, could be a relative path which we'll allow
    }
  }

  return value;
}

function isJavascriptURI(value: string): boolean {
  return /^javascript:/i.test(value);
}

function isSafeDataURI(value: string): boolean {
  return /^data:image\/(png|gif|jpeg|jpg|webp|svg\+xml);/i.test(value);
}

export function escapeJSValue(value: unknown): string {
  return JSON.stringify(String(value));
}

class SanitizedString extends String {}

function sanitize(strings: TemplateStringsArray, values: unknown[], escape: (value: unknown) => string): string {
  function escapeValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map(escapeValue).join('');
    } else {
      return value instanceof SanitizedString ? (value as string) : escape(String(value));
    }
  }

  const escapedString = String.raw({ raw: strings }, ...values.map(escapeValue));

  return new SanitizedString(escapedString) as unknown as string;
}
