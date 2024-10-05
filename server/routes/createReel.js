const router = require('express').Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const upload = require('../middleware/upload'); 
const { v4: uuidv4 } = require('uuid');

// Set the ffmpeg binary path
ffmpeg.setFfmpegPath(ffmpegPath);

const downloadsPath = path.resolve(__dirname, '../downloads');
const ytDlpPath = path.resolve(__dirname, '../venv/Scripts/yt-dlp');
const detectTimestampsScript = path.resolve(__dirname, '../python_scripts/detectTimestamps.py');
let videoPath, audioWavPath;

const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[^\s]{11}$/;
    return youtubeRegex.test(url);
};

const logError = (title, err, stderr, stdout) => {
    console.error(`${title} Error:`, err);
    console.error(`${title} stderr:`, stderr);
    console.error(`${title} stdout:`, stdout);
};

const runPythonScript = () => new Promise((resolve, reject) => {
    console.log("Finding timestamps....")
    const pythonCommand = `python "${detectTimestampsScript}" "${videoPath}" "${audioWavPath}"`; 
    exec(pythonCommand, (err, stdout, stderr) => {
        if (err) {
            logError('Python Script', err, stderr, stdout);
            reject(new Error('Failed to execute Python script'));
        } else {
            console.log('Python script executed successfully');
            try {
                console.log(stdout);
                const timestamps = JSON.parse(stdout);
                resolve(timestamps);
            } catch (err) {
                reject(new Error('Failed to parse timestamps from Python script'));
            }
        }
    });
});

router.post('/demo', (req,res) =>{
    const { linkUpload } = req.body;
    console.log('Link Upload:', linkUpload);
    mergedFilenames = ["b9_cx_pTaK0_merged_1.mp4", "b9_cx_pTaK0_merged_2.mp4", "b9_cx_pTaK0_merged_3.mp4", "b9_cx_pTaK0_merged_4.mp4"]
    clippedFilenames = ["b9_cx_pTaK0_merged_1.mp4", "b9_cx_pTaK0_merged_2.mp4", "b9_cx_pTaK0_merged_3.mp4", "b9_cx_pTaK0_merged_4.mp4"]
    res.status(200).json({clippedFilenames });
})

router.post('/createFromLocal', upload, async (req,res)=>{
    const videoFile = req.file;
    if(!videoFile){
        return res.status(400).json({error: "No video file uploaded"})
    }

    videoPath = req.file.path;
    audioWavPath = path.join(downloadsPath, `${videoFile.filename}_audio.wav`);
    const videoTitle = path.basename(videoPath, path.extname(videoPath));

    function extractAudio(){
        return new Promise((resolve, reject) => {
            console.log('Extracting audio from video....');
            ffmpeg(videoPath)
                .outputOptions('-vn')
                .audioCodec('pcm_s16le')
                .audioChannels(1) 
                .audioFrequency(44100)
                .output(audioWavPath)
                .on('end', () => {
                    console.log('Audio extracted successfully');
                    resolve();
                })
                .on('error', (err, stdout, stderr) => {
                    logError('FFmpeg Audio Extraction', err, stderr, stdout);
                    reject(new Error('Failed to extract audio from video')); // Reject the promise on error
                })
                .run();
        });
    }

    function clipOrignalVideo(timestamps){
        if (timestamps.length === 0) {
            return reject(new Error('No timestamps to clip video'));
        }

        const clipPromises = timestamps.map((clip, index)=>{
            const {start, duration} = clip;
            const outputClipPath = path.join(downloadsPath, `${videoTitle}_clip_${index + 1}.mp4`);

            return new Promise((clipResolve, clipReject)=>{
                console.log(`Processing original video clip ${index + 1}: Start = ${start}, Duration = ${duration}`);

                ffmpeg(videoPath)
                .setStartTime(start)
                .setDuration(duration)
                .outputOptions('-vf', 'scale=-2:1920,crop=1080:1920')
                .output(outputClipPath)
                .on('end', ()=>{
                    console.log(`Original video clip ${index + 1} created successfully at ${outputClipPath}`);
                    clipResolve(path.basename(outputClipPath));
                })
                .on('error', (err, stdout, stderr) => {
                    console.error(`FFmpeg Original Video Clipping (Clip ${index + 1}) Error:`, err);
                    console.error(`FFmpeg Original Video Clipping (Clip ${index + 1}) stderr:`, stderr);
                    console.error(`FFmpeg Original Video Clipping (Clip ${index + 1}) stdout:`, stdout);
                    clipReject(new Error(`Failed to clip original video ${index + 1}`));
                })
                .run();
            });
        });

        return Promise.all(clipPromises)
        .then((clipPaths) => {
            console.log('All clips created successfully');
            return clipPaths;
        })
        .catch((err) => {
            console.error('Error processing video clips:', err);
            throw err;
        });
    }

    try{
        console.log("Starting processing")
        await extractAudio();
        const timestamps = await runPythonScript(videoPath, audioWavPath);
        const clippedVideos = await clipOrignalVideo(timestamps, videoPath);
        res.status(200).json({clippedFilenames: clippedVideos})
    }
    catch (error) {
        console.error('Error processing video:', error);
        res.status(500).json({ error: 'Failed to process the video' });
    }
})



router.post('/createFromUrl', (req, res) => {
    const { linkUpload } = req.body;
    console.log('Link Upload:', linkUpload);
    if (!linkUpload) {
        return res.status(400).json({ error: 'No URL provided' });
    }

    if (!isValidYouTubeUrl(linkUpload)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    const uniqueId = uuidv4();
    const videoTitle = `video_${uniqueId}`; // Assign video Id as the title
    videoPath = path.join(downloadsPath, `${videoTitle}_video.mp4`);
    const audioPath = path.join(downloadsPath, `${videoTitle}_audio.mp3`);
    audioWavPath = path.join(downloadsPath, `${videoTitle}_audio.wav`);

    const logError = (title, err, stderr, stdout) => {
        console.error(`${title} Error:`, err);
        console.error(`${title} stderr:`, stderr);
        console.error(`${title} stdout:`, stdout);
    };

    const downloadVideo = new Promise((resolve, reject) => {
        exec(`"${ytDlpPath}" -f bestvideo -o "${videoPath}" ${linkUpload}`, (err, stdout, stderr) => {
            if (err) {
                logError('Video Download', err, stderr, stdout);
                reject(new Error('Failed to download video'));
            } else {
                console.log('Video downloaded successfully');
                resolve();
            }
        });
    });

    const downloadAndConvertAudio = new Promise((resolve, reject) => {
        exec(`"${ytDlpPath}" -f ba -o "${audioPath}" ${linkUpload}`, (err, stdout, stderr) => {
            if (err) {
                logError('Audio Download', err, stderr, stdout);
                reject(new Error('Failed to download audio'));
            } else {
                console.log('Audio downloaded successfully');
                ffmpeg()
                    .input(audioPath)
                    .audioCodec('pcm_s16le') // Set audio codec for .wav
                    .audioChannels(1)        // Ensure mono channel
                    .audioFrequency(44100)   // Set audio sampling rate
                    .output(audioWavPath)
                    .on('end', () => {
                        console.log('Audio converted to .wav successfully');
                        resolve();
                    })
                    .on('error', (err, stdout, stderr) => {
                        logError('FFmpeg Audio Conversion', err, stderr, stdout);
                        reject(new Error('Failed to convert audio to .wav'));
                    })
                    .save(audioWavPath);
            }
        });
    });

    const clipVideo = (timestamps) => {
        return new Promise((resolve, reject) => {
            if (timestamps.length === 0) {
                return reject(new Error('No timestamps to clip video'));
            }

            let clipPromises = timestamps.map((clip, index) => {
                const { start, duration } = clip;
                const outputClipPath = path.join(downloadsPath, `${videoTitle}_clip_${index + 1}.mp4`);
                
                return new Promise((clipResolve, clipReject) => {
                    console.log(`Processing video clip ${index + 1}: Start = ${start}, Duration = ${duration}`);
                    
                    ffmpeg(videoPath)
                        .setStartTime(start) // Set clip start time
                        .setDuration(duration) // Set clip duration
                        .output(outputClipPath)
                        .on('end', () => {
                            console.log(`Video clip ${index + 1} created successfully at ${outputClipPath}`);
                            clipResolve(outputClipPath);
                        })
                        .on('error', (err, stdout, stderr) => {
                            console.error(`FFmpeg Video Clipping (Clip ${index + 1}) Error:`, err);
                            console.error(`FFmpeg Video Clipping (Clip ${index + 1}) stderr:`, stderr);
                            console.error(`FFmpeg Video Clipping (Clip ${index + 1}) stdout:`, stdout);
                            clipReject(new Error(`Failed to clip video ${index + 1}`));
                        })
                        .run();
                });
            });

            Promise.all(clipPromises)
                .then((clipPaths) => resolve(clipPaths))
                .catch(err => reject(err));
        });
    };

    const clipAudio = (timestamps) => {
        return new Promise((resolve, reject) => {
            if (timestamps.length === 0) {
                return reject(new Error('No timestamps to clip audio'));
            }

            let clipPromises = timestamps.map((clip, index) => {
                const { start, duration } = clip;
                const outputAudioClipPath = path.join(downloadsPath, `${videoTitle}_audio_clip_${index + 1}.wav`);
                
                return new Promise((clipResolve, clipReject) => {
                    console.log(`Processing audio clip ${index + 1}: Start = ${start}, Duration = ${duration}`);
                    
                    ffmpeg(audioWavPath)
                        .setStartTime(start) // Set clip start time
                        .setDuration(duration) // Set clip duration
                        .output(outputAudioClipPath)
                        .on('end', () => {
                            console.log(`Audio clip ${index + 1} created successfully at ${outputAudioClipPath}`);
                            clipResolve(outputAudioClipPath);
                        })
                        .on('error', (err, stdout, stderr) => {
                            console.error(`FFmpeg Audio Clipping (Clip ${index + 1}) Error:`, err);
                            console.error(`FFmpeg Audio Clipping (Clip ${index + 1}) stderr:`, stderr);
                            console.error(`FFmpeg Audio Clipping (Clip ${index + 1}) stdout:`, stdout);
                            clipReject(new Error(`Failed to clip audio ${index + 1}`));
                        })
                        .run();
                });
            });

            Promise.all(clipPromises)
                .then((clipPaths) => resolve(clipPaths))
                .catch(err => reject(err));
        });
    };

    const mergedPaths = [];

    const mergeAudioVideo = (videoClipPath, audioClipPath, outputPath) => {
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoClipPath)
                .input(audioClipPath)
                .outputOptions('-c:v libx264')
                .outputOptions('-c:a aac') 
                .outputOptions('-vf', 'scale=-2:1920,crop=1080:1920')
                .output(outputPath)
                .on('end', () => {
                    console.log(`Merged video and audio successfully at ${outputPath}`);
                    mergedPaths.push(outputPath);
                    resolve();
                })
                .on('error', (err, stdout, stderr) => {
                    console.error(`FFmpeg Merging Error:`, err);
                    console.error(`FFmpeg Merging stderr:`, stderr);
                    console.error(`FFmpeg Merging stdout:`, stdout);
                    reject(new Error('Failed to merge video and audio'));
                })
                .run();
        });
    };

    // Run video/audio download, Python script, clipping, and merging process
    Promise.all([downloadVideo, downloadAndConvertAudio])
        .then(() => runPythonScript())
        .then(timestamps => {
            return Promise.all([
                clipVideo(timestamps),
                clipAudio(timestamps)
            ]);
        })
        .then(([videoClipPaths, audioClipPaths]) => {
            // Merge corresponding video and audio clips
            let mergePromises = videoClipPaths.map((videoClipPath, index) => {
                const audioClipPath = audioClipPaths[index];
                const mergedOutputPath = path.join(downloadsPath, `${videoTitle}_merged_${index + 1}.mp4`);
                return mergeAudioVideo(videoClipPath, audioClipPath, mergedOutputPath);
            });

            return Promise.all(mergePromises);
        })
        .then(() => {
            // Extract filenames from full paths
            const mergedFilenames = mergedPaths.map(filePath => path.basename(filePath));
            res.status(200).json({mergedFilenames });
        })
        .catch((err) => {
            console.error('Error processing request:', err);
            res.status(500).json({ error: err.message });
        });
});

module.exports = router;