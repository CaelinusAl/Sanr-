/**
 * Virtual Timeline Renderer for CineCursor
 * Optimizes rendering by only displaying visible clips
 */

const PIXELS_PER_SECOND = 50;

class VirtualTimelineRenderer {
  constructor() {
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.scrollX = 0;
    this.scrollY = 0;
    this.zoom = 1;
    this.clipHeight = 64;
    this.trackHeight = 80;
    this.headerHeight = 40;
    this.bufferSize = 200; // Extra pixels to render outside viewport
  }

  /**
   * Update viewport dimensions
   */
  setViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Update scroll position
   */
  setScroll(x, y) {
    this.scrollX = x;
    this.scrollY = y;
  }

  /**
   * Update zoom level
   */
  setZoom(zoom) {
    this.zoom = Math.max(0.1, Math.min(4, zoom));
  }

  /**
   * Calculate visible time range
   */
  getVisibleTimeRange() {
    const pixelsPerSecond = PIXELS_PER_SECOND * this.zoom;
    const startTime = Math.max(0, (this.scrollX - this.bufferSize) / pixelsPerSecond);
    const endTime = (this.scrollX + this.viewportWidth + this.bufferSize) / pixelsPerSecond;
    
    return { startTime, endTime };
  }

  /**
   * Calculate visible track indices
   */
  getVisibleTrackIndices(totalTracks) {
    const startTrack = Math.max(0, Math.floor((this.scrollY - this.headerHeight) / this.trackHeight) - 1);
    const endTrack = Math.min(
      totalTracks - 1,
      Math.ceil((this.scrollY + this.viewportHeight) / this.trackHeight) + 1
    );
    
    return { startTrack, endTrack };
  }

  /**
   * Filter clips to only those visible in viewport
   */
  getVisibleClips(clips) {
    const { startTime, endTime } = this.getVisibleTimeRange();
    
    return clips.filter(clip => {
      const clipStart = clip.start_time || 0;
      const clipEnd = clipStart + (clip.duration || 0);
      
      // Check if clip overlaps with visible range
      return !(clipEnd < startTime || clipStart > endTime);
    });
  }

  /**
   * Get clips for specific track that are visible
   */
  getVisibleClipsForTrack(clips, trackIndex) {
    const trackClips = clips.filter(clip => (clip.track_index || 0) === trackIndex);
    return this.getVisibleClips(trackClips);
  }

  /**
   * Calculate clip position and dimensions
   */
  getClipStyle(clip) {
    const pixelsPerSecond = PIXELS_PER_SECOND * this.zoom;
    const startX = (clip.start_time || 0) * pixelsPerSecond;
    const width = Math.max(40, (clip.duration || 1) * pixelsPerSecond);
    
    return {
      left: startX,
      width,
      top: 8,
      height: this.clipHeight
    };
  }

  /**
   * Calculate timeline total width
   */
  getTimelineWidth(totalDuration) {
    const pixelsPerSecond = PIXELS_PER_SECOND * this.zoom;
    return Math.max(1000, totalDuration * pixelsPerSecond + 200);
  }

  /**
   * Calculate timeline total height
   */
  getTimelineHeight(totalTracks) {
    return this.headerHeight + totalTracks * this.trackHeight;
  }

  /**
   * Convert time to pixel position
   */
  timeToPixels(time) {
    return time * PIXELS_PER_SECOND * this.zoom;
  }

  /**
   * Convert pixel position to time
   */
  pixelsToTime(pixels) {
    return pixels / (PIXELS_PER_SECOND * this.zoom);
  }

  /**
   * Snap time to grid (useful for snapping clips)
   */
  snapToGrid(time, gridInterval = 0.1) {
    return Math.round(time / gridInterval) * gridInterval;
  }

  /**
   * Calculate playhead position
   */
  getPlayheadPosition(currentTime) {
    return this.timeToPixels(currentTime);
  }

  /**
   * Check if playhead is visible
   */
  isPlayheadVisible(currentTime) {
    const playheadX = this.getPlayheadPosition(currentTime);
    return playheadX >= this.scrollX - 10 && playheadX <= this.scrollX + this.viewportWidth + 10;
  }

  /**
   * Get scroll position to center on time
   */
  getScrollToCenter(time) {
    const targetX = this.timeToPixels(time) - this.viewportWidth / 2;
    return Math.max(0, targetX);
  }

  /**
   * Calculate time markers for ruler
   */
  getTimeMarkers(totalDuration) {
    const { startTime, endTime } = this.getVisibleTimeRange();
    const markers = [];
    
    // Determine marker interval based on zoom
    let interval;
    if (this.zoom >= 2) {
      interval = 0.5; // Every 0.5 seconds
    } else if (this.zoom >= 1) {
      interval = 1; // Every second
    } else if (this.zoom >= 0.5) {
      interval = 2; // Every 2 seconds
    } else if (this.zoom >= 0.25) {
      interval = 5; // Every 5 seconds
    } else {
      interval = 10; // Every 10 seconds
    }
    
    // Generate markers
    const start = Math.floor(startTime / interval) * interval;
    const end = Math.min(totalDuration, Math.ceil(endTime / interval) * interval);
    
    for (let t = start; t <= end; t += interval) {
      markers.push({
        time: t,
        position: this.timeToPixels(t),
        isMajor: t % (interval * 5) === 0,
        label: this.formatTime(t)
      });
    }
    
    return markers;
  }

  /**
   * Format time for display
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Get render statistics
   */
  getStats(totalClips, visibleClips) {
    return {
      totalClips,
      visibleClips,
      culledClips: totalClips - visibleClips,
      efficiency: totalClips > 0 ? ((totalClips - visibleClips) / totalClips * 100).toFixed(1) : 0
    };
  }
}

// Singleton instance
let instance = null;

export function getVirtualTimeline() {
  if (!instance) {
    instance = new VirtualTimelineRenderer();
  }
  return instance;
}

// React hook for virtual timeline
export function useVirtualTimeline(clips, containerRef, zoom = 1) {
  const [visibleClips, setVisibleClips] = React.useState([]);
  const renderer = getVirtualTimeline();
  
  React.useEffect(() => {
    renderer.setZoom(zoom);
  }, [zoom]);
  
  React.useEffect(() => {
    if (!containerRef?.current) return;
    
    const container = containerRef.current;
    
    const updateVisibleClips = () => {
      const rect = container.getBoundingClientRect();
      renderer.setViewport(rect.width, rect.height);
      renderer.setScroll(container.scrollLeft, container.scrollTop);
      
      const visible = renderer.getVisibleClips(clips);
      setVisibleClips(visible);
    };
    
    // Initial update
    updateVisibleClips();
    
    // Listen to scroll and resize
    container.addEventListener('scroll', updateVisibleClips);
    window.addEventListener('resize', updateVisibleClips);
    
    return () => {
      container.removeEventListener('scroll', updateVisibleClips);
      window.removeEventListener('resize', updateVisibleClips);
    };
  }, [clips, containerRef]);
  
  return {
    visibleClips,
    renderer,
    getClipStyle: (clip) => renderer.getClipStyle(clip),
    timeToPixels: (time) => renderer.timeToPixels(time),
    pixelsToTime: (pixels) => renderer.pixelsToTime(pixels)
  };
}

export default VirtualTimelineRenderer;

import React from 'react';
