import React, { useState } from 'react';
import { getAvatarColor, getInitials, getAvatarSize, generateGravatarUrl } from '@/lib/utils/avatar';

interface UserAvatarProps {
  name: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGravatar?: boolean;
}

export default function UserAvatar({ 
  name, 
  email, 
  size = 'md', 
  className = '',
  showGravatar = true 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);
  const sizeClasses = getAvatarSize(size);
  const gravatarUrl = email && showGravatar ? generateGravatarUrl(email, 80) : null;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Show gravatar if available and not errored
  if (gravatarUrl && !imageError) {
    return (
      <div className={`${sizeClasses} rounded-full overflow-hidden flex items-center justify-center ${className}`}>
        {imageLoading && (
          <div className={`${avatarColor} w-full h-full flex items-center justify-center text-white font-semibold`}>
            {initials}
          </div>
        )}
        <img
          src={gravatarUrl}
          alt={`${name} avatar`}
          className={`w-full h-full object-cover ${imageLoading ? 'hidden' : 'block'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div className={`${sizeClasses} ${avatarColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {initials}
    </div>
  );
}