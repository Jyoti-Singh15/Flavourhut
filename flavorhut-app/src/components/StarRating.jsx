import React, { useState } from 'react';

function StarRating({ rating, onRate, maxStars = 5, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  const starColor = "text-yellow-400";
  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const currentRating = hoverRating || rating;

  const renderStar = (index, isFull, isHalf = false) => {
    const starClass = `${starSizes[size]} ${isFull ? starColor : 'text-gray-300'} transition-colors duration-200`;
    
    if (isHalf) {
      return (
        <svg className={starClass} fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`halfGradient-${index}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="lightgray" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path fill={`url(#halfGradient-${index})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
        </svg>
      );
    }

    return (
      <svg className={starClass} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
      </svg>
    );
  };

  return (
    <div className="flex items-center">
      {/* Display Stars */}
      {!onRate && (
        <>
          {[...Array(fullStars)].map((_, i) => (
            <span key={`full-${i}`}>
              {renderStar(i, true)}
            </span>
          ))}
          {hasHalfStar && (
            <span key="half">
              {renderStar(fullStars, false, true)}
            </span>
          )}
          {[...Array(emptyStars)].map((_, i) => (
            <span key={`empty-${i}`}>
              {renderStar(fullStars + (hasHalfStar ? 1 : 0) + i, false)}
            </span>
          ))}
        </>
      )}

      {/* Interactive Rating Stars */}
      {onRate && (
        <div className="flex">
          {[...Array(maxStars)].map((_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= currentRating;
            const isHalf = currentRating === starValue - 0.5;
            
            return (
              <button
                key={`rate-${i}`}
                onClick={() => onRate(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 rounded-full p-1 hover:scale-110 transition-transform duration-200"
                aria-label={`Rate ${starValue} stars`}
              >
                {renderStar(i, isFilled, isHalf)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StarRating;