import { useRef, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { FiPlay, FiPause } from 'react-icons/fi';
import { VideoItem } from '../types';

const { width, height } = Dimensions.get('window');

interface Props {
  video: VideoItem;
  isActive: boolean;
  muted: boolean;
}

export function VideoPlayer({ video, isActive, muted }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>();

  const videoSrc = video.webVideoUrl
    ?? (video.muxPlaybackId ? `https://stream.mux.com/${video.muxPlaybackId}.m3u8` : null);

  // Play/pause when active changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
    }
  }, [isActive]);

  // Sync muted from parent
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  const handleClick = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
    // Flash icon
    setShowFlash(true);
    clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setShowFlash(false), 700);
  };

  return (
    // @ts-ignore — web-only div
    <div
      onClick={handleClick}
      style={{
        width,
        height,
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {videoSrc ? (
        // @ts-ignore
        <video
          ref={videoRef}
          src={videoSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          autoPlay
          loop
          muted={muted}
          playsInline
        />
      ) : video.thumbnailUrl ? (
        // @ts-ignore
        <img
          src={video.thumbnailUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt={video.place ?? ''}
        />
      ) : (
        // @ts-ignore
        <div style={{ width: '100%', height: '100%', backgroundColor: '#111' }} />
      )}

      {/* Play/Pause flash indicator */}
      {showFlash && (
        // @ts-ignore
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.45)',
            borderRadius: '50%',
            width: 72,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            animation: 'fadeOut 0.7s ease forwards',
          }}
        >
          {paused
            ? <FiPause color="#fff" size={32} />
            : <FiPlay color="#fff" size={32} style={{ marginLeft: 3 }} />}
        </div>
      )}
    </div>
  );
}
