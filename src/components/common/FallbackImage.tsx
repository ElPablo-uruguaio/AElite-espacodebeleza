import React, { useEffect, useState } from 'react';

const FALLBACK_IMAGE = '/salon-image-fallback.svg';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const FallbackImage: React.FC<FallbackImageProps> = ({ src, onError, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImageSrc(src || FALLBACK_IMAGE);
  }, [src]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imageSrc !== FALLBACK_IMAGE) {
      setImageSrc(FALLBACK_IMAGE);
    }
    onError?.(event);
  };

  return <img {...props} src={imageSrc} onError={handleError} />;
};