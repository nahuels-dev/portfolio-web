import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { getImage } from 'astro:assets';
import type { Element, Root, RootContent } from 'hast';
import { validateBlogImage } from './images';

export interface Heading {
  id: string;
  label: string;
  level: number;
}

const safeLink = (value: string) => {
  if (/[\u0000-\u0020\u007f\\]/.test(value) || value.startsWith('//')) return false;
  if (
    value.startsWith('#') ||
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../')
  )
    return true;
  try {
    return ['https:', 'http:', 'mailto:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const textContent = (node: RootContent): string =>
  node.type === 'text'
    ? node.value
    : 'children' in node
      ? node.children.map(textContent).join('')
      : '';

export async function renderMarkdown(markdown: string) {
  const headings: Heading[] = [];
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(() => async (tree: Root) => {
      async function walk(parent: Root | Element) {
        for (let index = 0; index < parent.children.length; index++) {
          const node = parent.children[index];
          if (node.type !== 'element') continue;
          if (node.tagName === 'h1') node.tagName = 'h2';
          if (/^h[23]$/.test(node.tagName)) {
            const id = `heading-${headings.length + 1}`;
            node.properties.id = id;
            headings.push({
              id: `post-${id}`,
              label: textContent(node),
              level: Number(node.tagName[1]),
            });
          }
          if (node.tagName === 'a') {
            const href = String(node.properties.href ?? '');
            if (!safeLink(href)) delete node.properties.href;
            else if (/^https?:/i.test(href)) node.properties.rel = ['noopener', 'noreferrer'];
          }
          if (node.tagName === 'img') {
            const src = String(node.properties.src ?? '');
            const image = await validateBlogImage(src);
            const widths = [480, 800, 1200, 1440].filter((width) => width < image.width);
            widths.push(Math.min(image.width, 1440));
            const options = { src: image, width: widths.at(-1), widths, quality: 80 };
            const avif = await getImage({ ...options, format: 'avif' });
            const webp = await getImage({ ...options, format: 'webp' });
            parent.children[index] = {
              type: 'element',
              tagName: 'picture',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'source',
                  properties: {
                    type: 'image/avif',
                    srcSet: avif.srcSet.attribute,
                    sizes: '(max-width: 760px) 90vw, 760px',
                  },
                  children: [],
                },
                {
                  type: 'element',
                  tagName: 'img',
                  properties: {
                    src: webp.src,
                    srcSet: webp.srcSet.attribute,
                    sizes: '(max-width: 760px) 90vw, 760px',
                    alt: String(node.properties.alt ?? ''),
                    width: webp.attributes.width,
                    height: webp.attributes.height,
                    loading: 'lazy',
                    decoding: 'async',
                  },
                  children: [],
                },
              ],
            };
          } else await walk(node);
        }
      }
      await walk(tree);
    })
    .use(rehypeSanitize, {
      ...defaultSchema,
      clobberPrefix: 'post-',
      tagNames: [
        'p',
        'br',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'a',
        'em',
        'strong',
        'del',
        'blockquote',
        'ul',
        'ol',
        'li',
        'pre',
        'code',
        'hr',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'picture',
        'source',
        'img',
      ],
      attributes: {
        a: ['href', 'title', 'rel'],
        h2: ['id'],
        h3: ['id'],
        code: [['className', /^language-[a-z0-9-]+$/i]],
        ol: ['start'],
        th: ['align'],
        td: ['align'],
        source: ['type', 'srcSet', 'sizes'],
        img: ['src', 'srcSet', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding'],
      },
      protocols: { href: ['http', 'https', 'mailto'], src: ['https'] },
    })
    .use(rehypeStringify);
  const result = await processor.process(markdown);
  return { html: String(result), headings };
}
