// Frontend constants that mirror backend file type configurations
// These should match the SUPPORTED_FILE_TYPES in server/config/constants.js

export const SUPPORTED_FILE_TYPES = {
  VIDEO: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska'],
    maxSize: 25 * 1024 * 1024, // 25MB in bytes
    description: 'Videos (MP4, AVI, MOV, WMV, FLV, WebM, MKV) - Max 25MB'
  },
  DOCUMENT: {
    extensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'],
    maxSize: 5 * 1024 * 1024, // 5MB in bytes
    description: 'Documents (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT) - Max 5MB'
  }
};

// Helper function to get file extension from filename
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : '';
};

// Helper function to validate file type and size
export const validateFileUpload = (file, contentType) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  const fileConfig = contentType === 'video' ? SUPPORTED_FILE_TYPES.VIDEO : SUPPORTED_FILE_TYPES.DOCUMENT;
  const fileExtension = getFileExtension(file.name);

  // Check file extension
  if (!fileConfig.extensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Invalid file type. ${fileConfig.description}`
    };
  }

  // Check MIME type
  if (!fileConfig.mimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file format. ${fileConfig.description}`
    };
  }

  // Check file size
  if (file.size > fileConfig.maxSize) {
    const maxSizeMB = Math.round(fileConfig.maxSize / (1024 * 1024));
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size too large. Maximum allowed size is ${maxSizeMB}MB. Your file is ${fileSizeMB}MB.`
    };
  }

  return { isValid: true, error: null };
};

// Helper function to get accept attribute for file input
export const getAcceptAttribute = (contentType) => {
  const fileConfig = contentType === 'video' ? SUPPORTED_FILE_TYPES.VIDEO : SUPPORTED_FILE_TYPES.DOCUMENT;
  return fileConfig.mimeTypes.join(',');
};