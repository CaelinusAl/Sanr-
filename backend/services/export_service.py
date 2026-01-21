"""
Export Service for CineCursor
FFmpeg-based video export with progress tracking
"""

import os
import subprocess
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)

class ExportService:
    """Service for exporting project videos using FFmpeg"""
    
    def __init__(self, videos_dir: Path, exports_dir: Path):
        self.videos_dir = videos_dir
        self.exports_dir = exports_dir
        self.exports_dir.mkdir(exist_ok=True)
        self.active_exports: Dict[str, Dict[str, Any]] = {}
    
    async def export_project(
        self,
        project_id: str,
        scenes: List[Dict[str, Any]],
        config: Dict[str, Any],
        on_progress: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Export project to video file
        
        Args:
            project_id: Project ID
            scenes: List of scene data
            config: Export configuration
            on_progress: Callback for progress updates
        """
        export_id = str(uuid.uuid4())[:8]
        output_filename = f"{project_id}_{export_id}.{config.get('format', 'mp4')}"
        output_path = self.exports_dir / output_filename
        
        self.active_exports[export_id] = {
            "status": "preparing",
            "progress": 0,
            "message": "Preparing export...",
            "output_path": str(output_path)
        }
        
        try:
            # Stage 1: Prepare clips list
            await self._update_progress(export_id, "preparing", 5, "Analyzing scenes...", on_progress)
            
            clips = await self._prepare_clips(scenes)
            if not clips:
                raise ValueError("No video clips available for export")
            
            # Stage 2: Create concat file
            await self._update_progress(export_id, "preparing", 10, "Creating clip list...", on_progress)
            
            concat_file = await self._create_concat_file(clips, export_id)
            
            # Stage 3: Run FFmpeg
            await self._update_progress(export_id, "encoding", 15, "Starting FFmpeg...", on_progress)
            
            await self._run_ffmpeg_export(
                concat_file, output_path, config, export_id, on_progress
            )
            
            # Stage 4: Complete
            await self._update_progress(export_id, "complete", 100, "Export complete!", on_progress)
            
            # Cleanup
            self._cleanup_temp_files(concat_file)
            
            return {
                "status": "complete",
                "export_id": export_id,
                "output_path": str(output_path),
                "filename": output_filename,
                "size": output_path.stat().st_size if output_path.exists() else 0
            }
            
        except Exception as e:
            logger.error(f"Export error: {str(e)}")
            await self._update_progress(export_id, "failed", 0, str(e), on_progress)
            raise
        finally:
            if export_id in self.active_exports:
                del self.active_exports[export_id]
    
    async def _prepare_clips(self, scenes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Prepare list of clips with valid video files"""
        clips = []
        
        for scene in sorted(scenes, key=lambda s: s.get("start_time", 0)):
            video_path = scene.get("video_path")
            if not video_path:
                continue
            
            # Check if video file exists
            if isinstance(video_path, str):
                full_path = Path(video_path) if Path(video_path).is_absolute() else self.videos_dir / Path(video_path).name
            else:
                continue
            
            if full_path.exists():
                clips.append({
                    "path": str(full_path),
                    "duration": scene.get("duration", 5),
                    "name": scene.get("name", "Untitled"),
                    "start_time": scene.get("start_time", 0)
                })
        
        return clips
    
    async def _create_concat_file(self, clips: List[Dict[str, Any]], export_id: str) -> Path:
        """Create FFmpeg concat demuxer file"""
        concat_file = self.exports_dir / f"concat_{export_id}.txt"
        
        lines = []
        for clip in clips:
            # Escape single quotes in path
            safe_path = clip["path"].replace("'", "'\\''")
            lines.append(f"file '{safe_path}'")
        
        concat_file.write_text("\n".join(lines))
        return concat_file
    
    async def _run_ffmpeg_export(
        self,
        concat_file: Path,
        output_path: Path,
        config: Dict[str, Any],
        export_id: str,
        on_progress: Optional[callable]
    ):
        """Run FFmpeg export with progress tracking"""
        
        # Get config values
        format_type = config.get("format", "mp4")
        resolution = config.get("resolution", "1080p")
        fps = config.get("fps", 30)
        include_audio = config.get("include_audio", True)
        quality = config.get("quality", "high")
        
        # Resolution mapping
        res_map = {
            "480p": "854:480",
            "720p": "1280:720",
            "1080p": "1920:1080",
            "4K": "3840:2160"
        }
        scale = res_map.get(resolution, "1920:1080")
        
        # Quality/bitrate mapping
        bitrate_map = {
            "low": {"480p": "1M", "720p": "2M", "1080p": "4M", "4K": "15M"},
            "medium": {"480p": "1.5M", "720p": "3M", "1080p": "6M", "4K": "20M"},
            "high": {"480p": "2M", "720p": "4M", "1080p": "8M", "4K": "25M"},
            "ultra": {"480p": "2.5M", "720p": "5M", "1080p": "10M", "4K": "35M"}
        }
        bitrate = bitrate_map.get(quality, {}).get(resolution, "6M")
        
        # Codec mapping
        codec_map = {
            "mp4": ("libx264", "aac"),
            "mov": ("libx264", "aac"),
            "webm": ("libvpx-vp9", "libopus"),
            "avi": ("libx264", "aac")
        }
        video_codec, audio_codec = codec_map.get(format_type, ("libx264", "aac"))
        
        # Build FFmpeg command
        cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c:v", video_codec,
            "-preset", "medium" if quality != "ultra" else "slow",
            "-b:v", bitrate,
            "-vf", f"scale={scale}:force_original_aspect_ratio=decrease,pad={scale}:(ow-iw)/2:(oh-ih)/2",
            "-r", str(fps),
        ]
        
        if include_audio:
            cmd.extend(["-c:a", audio_codec, "-b:a", "192k"])
        else:
            cmd.extend(["-an"])
        
        # Add web optimization for mp4
        if format_type == "mp4":
            cmd.extend(["-movflags", "+faststart"])
        
        cmd.append(str(output_path))
        
        # Run FFmpeg
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Monitor progress
        total_duration = 0
        current_time = 0
        
        async for line in process.stderr:
            line_str = line.decode("utf-8", errors="ignore")
            
            # Parse duration
            if "Duration:" in line_str:
                try:
                    duration_match = line_str.split("Duration:")[1].split(",")[0].strip()
                    h, m, s = duration_match.split(":")
                    total_duration = float(h) * 3600 + float(m) * 60 + float(s)
                except:
                    pass
            
            # Parse progress
            if "time=" in line_str:
                try:
                    time_match = line_str.split("time=")[1].split(" ")[0].strip()
                    h, m, s = time_match.split(":")
                    current_time = float(h) * 3600 + float(m) * 60 + float(s)
                    
                    if total_duration > 0:
                        progress = min(95, int(15 + (current_time / total_duration) * 80))
                        await self._update_progress(
                            export_id, "encoding", progress,
                            f"Encoding... {progress}%", on_progress
                        )
                except:
                    pass
        
        await process.wait()
        
        if process.returncode != 0:
            raise RuntimeError(f"FFmpeg exited with code {process.returncode}")
    
    async def _update_progress(
        self,
        export_id: str,
        status: str,
        progress: int,
        message: str,
        callback: Optional[callable]
    ):
        """Update export progress"""
        self.active_exports[export_id] = {
            "status": status,
            "progress": progress,
            "message": message
        }
        
        if callback:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(export_id, status, progress, message)
                else:
                    callback(export_id, status, progress, message)
            except Exception as e:
                logger.error(f"Progress callback error: {e}")
    
    def _cleanup_temp_files(self, concat_file: Path):
        """Clean up temporary files"""
        try:
            if concat_file.exists():
                concat_file.unlink()
        except Exception as e:
            logger.warning(f"Cleanup error: {e}")
    
    def get_export_status(self, export_id: str) -> Dict[str, Any]:
        """Get current export status"""
        return self.active_exports.get(export_id, {"status": "unknown", "progress": 0})
    
    def cancel_export(self, export_id: str) -> bool:
        """Cancel an active export (not fully implemented)"""
        if export_id in self.active_exports:
            self.active_exports[export_id]["status"] = "cancelled"
            return True
        return False
    
    def list_exports(self) -> List[Dict[str, Any]]:
        """List all exported files"""
        exports = []
        for file in self.exports_dir.glob("*.mp4"):
            exports.append({
                "filename": file.name,
                "path": str(file),
                "size": file.stat().st_size,
                "created_at": datetime.fromtimestamp(file.stat().st_ctime, tz=timezone.utc).isoformat()
            })
        for file in self.exports_dir.glob("*.mov"):
            exports.append({
                "filename": file.name,
                "path": str(file),
                "size": file.stat().st_size,
                "created_at": datetime.fromtimestamp(file.stat().st_ctime, tz=timezone.utc).isoformat()
            })
        return sorted(exports, key=lambda x: x["created_at"], reverse=True)
