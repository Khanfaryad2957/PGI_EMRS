import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiCamera, FiX, FiImage, FiFile, FiVideo } from 'react-icons/fi';
import Button from './Button';

const FileUpload = ({ 
  files = [], 
  onFilesChange, 
  maxFiles = 20, 
  maxSizeMB = 10,
  accept = "image/*,application/pdf,.doc,.docx,.txt",
  patientId = null,
  disabled = false
}) => {
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle file selection - accepts either event object or array of files
  const handleFileSelect = async (eOrFiles) => {
    // Support both event object (from file input) and direct file array (from camera capture)
    let selectedFiles = [];
    if (Array.isArray(eOrFiles)) {
      // Direct file array (from camera capture)
      selectedFiles = eOrFiles;
    } else if (eOrFiles?.target?.files) {
      // Event object (from file input)
      selectedFiles = Array.from(eOrFiles.target.files);
    } else {
      console.error('Invalid file selection input');
      return;
    }
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - files.length} more file(s).`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed ${maxSizeMB}MB limit. Please select smaller files.`);
      return;
    }

    // Create previews for images
    const newPreviews = [];
    for (const file of selectedFiles) {
      if (file.type.startsWith('image/')) {
        const preview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ file, preview: e.target.result });
          reader.readAsDataURL(file);
        });
        newPreviews.push(preview);
      } else {
        newPreviews.push({ file, preview: null });
      }
    }

    setPreviews([...previews, ...newPreviews]);
    onFilesChange([...files, ...selectedFiles]);
    
    // Reset input if it's an event object
    if (eOrFiles?.target) {
      eOrFiles.target.value = '';
    }
  };

  // Handle camera capture from file input (fallback)
  const handleCameraCapture = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelect({ target: { files: [file] } });
    }
  };

  // Open camera using MediaDevices API
  const openCamera = async (e) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setCameraError(null);
      setShowCameraModal(true);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      
      // Show video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(
        error.name === 'NotAllowedError' 
          ? 'Camera access denied. Please allow camera access in your browser settings.'
          : error.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Failed to access camera. Please try again or use file upload instead.'
      );
      
      // Fallback to file input if MediaDevices API fails
      setTimeout(() => {
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
      }, 100);
    }
  };

  // Capture photo from video stream
  const capturePhoto = (e) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const file = new File(
          [blob],
          `camera-capture-${Date.now()}.jpg`,
          { type: 'image/jpeg' }
        );
        
        // Add to files - pass file array directly
        handleFileSelect([file]);
      }
      
      // Close camera
      closeCamera();
    }, 'image/jpeg', 0.9);
  };

  // Close camera and stop stream
  const closeCamera = (e) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
    setCameraError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Remove file
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* File Upload Button */}
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-lg cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
            disabled || files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FiUpload className="w-5 h-5" />
          <span>Upload Files</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || files.length >= maxFiles}
            className="hidden"
          />
        </label>

        {/* Camera Capture Button - Try MediaDevices API first, fallback to file input */}
        <button
          type="button"
          onClick={openCamera}
          disabled={disabled || files.length >= maxFiles}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
            disabled || files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <FiCamera className="w-5 h-5" />
          <span>Capture Photo</span>
        </button>
        
        {/* Hidden file input as fallback */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          disabled={disabled || files.length >= maxFiles}
          className="hidden"
        />
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700">
            Selected Files ({files.length}/{maxFiles})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative bg-white/70 backdrop-blur-md border border-white/40 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all"
              >
                {/* Remove Button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-all"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}

                {/* Preview or Icon */}
                {previews[index]?.preview ? (
                  <div className="mb-3">
                    <img
                      src={previews[index].preview}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                    {file.type === 'application/pdf' ? (
                      <FiFile className="w-12 h-12 text-red-500" />
                    ) : (
                      <FiImage className="w-12 h-12 text-blue-500" />
                    )}
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-800 truncate" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {file.type || 'Unknown type'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500">
        <p>• Maximum {maxFiles} files, {maxSizeMB}MB per file</p>
        <p>• Supported: Images (JPEG, PNG, GIF, WebP), PDF, Word documents, Text files</p>
        <p>• Use "Capture Photo" to take pictures directly with your device camera</p>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Camera Capture</h3>
              <button
                type="button"
                onClick={closeCamera}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {cameraError ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{cameraError}</p>
                </div>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="w-full px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto max-h-[60vh]"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FiCamera className="w-5 h-5" />
                    <span>Capture</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;


