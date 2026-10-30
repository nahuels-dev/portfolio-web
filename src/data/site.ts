import content from '../content/settings/profile.json';
import { profileSchema } from '../content/schemas';
export const profile = profileSchema.parse(content);

export { projects } from './projects';

export const stack = [
  { name: 'Angular', icon: 'angular', color: '#ff4252' },
  { name: 'React', icon: 'react', color: '#61dafb' },
  { name: 'Next.js', icon: 'nextjs', color: '#ffffff' },
  { name: 'Astro', icon: 'astro', color: '#f3e8ff' },
  { name: 'Vue', icon: 'vue', color: '#42d392' },
  { name: 'JavaScript', icon: 'javascript', color: '#f7df1e' },
  { name: 'TypeScript', icon: 'typescript', color: '#58a6ff' },
  { name: 'Node.js', icon: 'nodejs', color: '#5fa04e' },
  { name: 'MongoDB', icon: 'mongodb', color: '#00d89a' },
  { name: 'HTML5', icon: 'html5', color: '#e34f26' },
  { name: 'CSS3', icon: 'css3', color: '#1572b6' },
  { name: 'SCSS', icon: 'sass', color: '#ef9dd0' },
  { name: 'GSAP', icon: 'gsap', color: '#b3ff38' },
  { name: 'Figma', icon: 'figma', color: '#f24e1e' },
  { name: 'Photoshop', icon: 'photoshop', color: '#31a8ff' },
  { name: 'Illustrator', icon: 'illustrator', color: '#ff9a00' },
] as const;
