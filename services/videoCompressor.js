/**
 * services/videoCompressor.js
 * ===========================
 * Service for video duration validation (max 15 mins),
 * file size validation (max 50 MB), and automated MP4 compression using FFmpeg.
 */

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

// Configure static ffmpeg & ffprobe binaries
if (ffmpegInstaller && ffmpegInstaller.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}
if (ffprobeInstaller && ffprobeInstaller.path) {
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_DURATION_SECONDS = 15 * 60; // 15 minutes (900 seconds)
const DURATION_BUFFER_SECONDS = 5; // 5 seconds grace buffer for fractional timestamps

/**
 * Probe video metadata (duration, resolution, format)
 * @param {string} filePath
 * @returns {Promise<{duration: number, width: number, height: number, size: number}>}
 */
function probeVideo(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      const duration = metadata?.format?.duration ? parseFloat(metadata.format.duration) : 0;
      const size = metadata?.format?.size ? parseInt(metadata.format.size, 10) : 0;
      const videoStream = (metadata?.streams || []).find((s) => s.codec_type === 'video');
      const width = videoStream?.width || 0;
      const height = videoStream?.height || 0;
      resolve({ duration, width, height, size });
    });
  });
}

/**
 * Compresses an input video file to web-optimized MP4 with faststart.
 * @param {string} inputPath
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
function runFfmpegCompression(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-crf 26',
        '-preset faster',
        '-vf scale=min(1280\\,iw):-2',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
      ])
      .on('error', (err) => {
        console.error('[VideoCompressor] Compression error:', err);
        reject(err);
      })
      .on('end', () => {
        resolve();
      })
      .save(outputPath);
  });
}

/**
 * Processes incoming base64 video:
 * 1. Validates max file size (<= 50MB)
 * 2. Writes temporary file
 * 3. Probes duration and validates max duration (<= 15 minutes)
 * 4. Compresses with FFmpeg (H.264 / AAC / FastStart)
 * 5. Syncs output to public uploads directories
 * @param {string} base64DataUrl
 * @returns {Promise<string>} Public URL path (e.g. /uploads/darshan-video-xxx.mp4)
 */
async function processAndCompressVideo(base64DataUrl) {
  if (!base64DataUrl || typeof base64DataUrl !== 'string' || !base64DataUrl.startsWith('data:video')) {
    return base64DataUrl;
  }

  const matches = base64DataUrl.match(/^data:video\/([a-zA-Z0-9]+);base64,(.+)$/);
  if (!matches) {
    return base64DataUrl;
  }

  const ext = matches[1] || 'mp4';
  const buffer = Buffer.from(matches[2], 'base64');

  // 1. Validate max file size (50MB)
  if (buffer.length > MAX_VIDEO_BYTES) {
    const sizeInMb = (buffer.length / (1024 * 1024)).toFixed(1);
    throw new Error(`வீடியோ கோப்பு 50MB-ஐ விட அதிகமாக உள்ளது (${sizeInMb}MB). அதிகபட்சம் 50MB மட்டுமே அனுமதிக்கப்படும் (Video file exceeds 50MB limit).`);
  }

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const tempRawFile = path.join(uploadsDir, `temp-raw-${timestamp}.${ext}`);
  const finalFileName = `darshan-video-${timestamp}.mp4`;
  const finalCompressedPath = path.join(uploadsDir, finalFileName);

  try {
    // Write raw video to temp file
    fs.writeFileSync(tempRawFile, buffer);
    const rawSize = buffer.length;

    // 2. Probe and validate duration (max 15 mins)
    let meta = { duration: 0 };
    try {
      meta = await probeVideo(tempRawFile);
    } catch (probeErr) {
      console.warn('[VideoCompressor] ffprobe warning (continuing with compression):', probeErr.message);
    }

    if (meta.duration && meta.duration > (MAX_VIDEO_DURATION_SECONDS + DURATION_BUFFER_SECONDS)) {
      const minutes = Math.floor(meta.duration / 60);
      const seconds = Math.floor(meta.duration % 60);
      throw new Error(`வீடியோவின் கால அளவு 15 நிமிடங்களுக்கு அதிகமாக உள்ளது (${minutes} நிமிடம் ${seconds} விநாடி). அதிகபட்சம் 15 நிமிடங்கள் மட்டுமே அனுமதிக்கப்படும் (Video duration exceeds 15 minutes limit).`);
    }

    // 3. Run FFmpeg compression
    console.log(`[VideoCompressor] Compressing video (${(rawSize / (1024 * 1024)).toFixed(2)} MB, duration: ${meta.duration ? meta.duration.toFixed(1) + 's' : 'unknown'})...`);
    
    let compressionSucceeded = false;
    try {
      await runFfmpegCompression(tempRawFile, finalCompressedPath);
      compressionSucceeded = fs.existsSync(finalCompressedPath) && fs.statSync(finalCompressedPath).size > 0;
    } catch (compErr) {
      console.error('[VideoCompressor] FFmpeg compression failed, falling back to raw video:', compErr.message);
    }

    if (compressionSucceeded) {
      const compSize = fs.statSync(finalCompressedPath).size;
      const reduction = (((rawSize - compSize) / rawSize) * 100).toFixed(1);
      console.log(`[VideoCompressor] Success! Compressed from ${(rawSize / (1024 * 1024)).toFixed(2)} MB to ${(compSize / (1024 * 1024)).toFixed(2)} MB (${reduction}% reduction).`);
      
      // Clean up temp raw file
      try { fs.unlinkSync(tempRawFile); } catch (e) {}
    } else {
      // If compression failed or produced empty file, rename raw file to final path
      if (fs.existsSync(finalCompressedPath)) {
        try { fs.unlinkSync(finalCompressedPath); } catch (e) {}
      }
      fs.renameSync(tempRawFile, finalCompressedPath);
    }

    // 4. Sync compressed file to public directories
    const frontendUploads = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads');
    if (!fs.existsSync(frontendUploads)) fs.mkdirSync(frontendUploads, { recursive: true });
    try { fs.copyFileSync(finalCompressedPath, path.join(frontendUploads, finalFileName)); } catch (e) {}

    const adminUploads = path.join(__dirname, '..', '..', 'admin', 'public', 'uploads');
    if (!fs.existsSync(adminUploads)) fs.mkdirSync(adminUploads, { recursive: true });
    try { fs.copyFileSync(finalCompressedPath, path.join(adminUploads, finalFileName)); } catch (e) {}

    return `/uploads/${finalFileName}`;
  } catch (error) {
    // Clean up temporary files on error
    if (fs.existsSync(tempRawFile)) {
      try { fs.unlinkSync(tempRawFile); } catch (e) {}
    }
    if (fs.existsSync(finalCompressedPath)) {
      try { fs.unlinkSync(finalCompressedPath); } catch (e) {}
    }
    throw error;
  }
}

module.exports = {
  MAX_VIDEO_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  probeVideo,
  processAndCompressVideo
};
