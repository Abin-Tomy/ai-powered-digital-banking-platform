/**
 * Generate consistent avatar colors and initials for users
 */

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  email?: string;
}

const colors = [
  'bg-red-500',
  'bg-blue-500', 
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500'
];

export function getAvatarColor(name: string): string {
  // Generate consistent color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

export function getAvatarSize(size: string = 'md'): string {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  return sizes[size as keyof typeof sizes] || sizes.md;
}

export function generateGravatarUrl(email: string, size: number = 40): string {
  // Simple MD5-like hash for demo (in production, use crypto.md5)
  let hash = 0;
  if (email.length === 0) return `https://www.gravatar.com/avatar/0?s=${size}&d=identicon`;
  
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hashStr = Math.abs(hash).toString(16);
  return `https://www.gravatar.com/avatar/${hashStr}?s=${size}&d=identicon&r=pg`;
}