import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Copy, ArrowRight, Image as ImageIcon, Loader2, Download, Trash2, Settings2, Wand2, QrCode, RefreshCw, X, Archive, Link as LinkIcon } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { UploadedFile } from './types';
import { ImageCard } from './components/ImageCard';

const IMAGEKIT_PUBLIC = "public_W8pXprjPHYrYwlWMf811dtUm2Og=";
const IMAGEKIT_PRIVATE = "private_Wu/w/ZEmydjv/FbRgVKOffRxtNY=";
const IMGBB_API_KEY = 'a26bed1b2fd07ba03bff75343d0834fe';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const fetchImageWithProxies = async (url: string): Promise<File | null> => {
  try {
    let response: Response | null = null;
    const proxies = [
      '', // Direct
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://api.codetabs.com/v1/proxy?quest='
    ];

    for (const proxy of proxies) {
      try {
        const fetchUrl = proxy ? `${proxy}${encodeURIComponent(url)}` : url;
        response = await fetch(fetchUrl);
        if (response.ok) {
          break; // Success!
        }
      } catch (e) {
        // Ignore and try the next proxy
      }
    }

    if (response && response.ok) {
      const blob = await response.blob();
      if (blob.type.startsWith('image/')) {
        const filename = url.split('/').pop()?.split('?')[0] || `pasted-image-${Date.now()}.jpg`;
        return new File([blob], filename, { type: blob.type });
      }
    } else {
      console.error('Failed to fetch pasted image URL even with proxies', url);
    }
  } catch (err) {
    console.error('Failed to fetch pasted image URL', url, err);
  }
  return null;
};

const compressImage = (file: File, targetSizeKB: number, format: string, filter: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1600; 
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas context not found"));
      
      const isTransparent = file.type === 'image/png' || file.type === 'image/webp';
      const outputType = format === 'auto' 
        ? (isTransparent ? 'image/webp' : 'image/jpeg')
        : `image/${format}`;

      ctx.clearRect(0, 0, width, height);
      if (outputType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }
      if (filter !== 'none') {
        ctx.filter = filter;
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      let quality = 0.9;

      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Compression error"));
          if (blob.size <= (targetSizeKB * 1024) || quality <= 0.1) {
            resolve(blob);
          } else {
            quality = Math.max(0.1, quality - 0.1);
            tryCompress(); 
          }
        }, outputType, quality);
      };
      tryCompress();
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
  });
};

const uploadToImageKit = async (blob: Blob | File, type: string, keys: { public: string, private: string }) => {
  try {
    const extension = type.split('/')[1] || 'jpg';
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('fileName', `lite_${Date.now()}.${extension}`);
    formData.append('publicKey', keys.public);
    formData.append('useUniqueFileName', 'true');

    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: { 
        'Authorization': 'Basic ' + btoa(keys.private + ':') 
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || `ImageKit error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.url) throw new Error("ImageKit response missing URL");
    return data.url;
  } catch (error: any) {
    console.error("ImageKit Upload Error:", error);
    throw error;
  }
};

const uploadToImgBB = async (blob: Blob | File, type: string, apiKey: string) => {
  try {
    const extension = type.split('/')[1] || 'jpg';
    const formData = new FormData();
    formData.append('image', blob, `image.${extension}`);
    
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`ImgBB error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error?.message || "ImgBB Upload Failed");
    }
    return data.data.url;
  } catch (error: any) {
    console.error("ImgBB Upload Error:", error);
    throw error;
  }
};

export default function App() {
  const [server, setServer] = useState<'imagekit' | 'imgbb'>('imgbb');
  const [compressEnabled, setCompressEnabled] = useState(false);
  const [multipleEnabled, setMultipleEnabled] = useState(false);
  const [targetSize, setTargetSize] = useState(150);
  const [outputFormat, setOutputFormat] = useState<'auto' | 'webp' | 'jpeg' | 'png'>('auto');
  const [imageFilter, setImageFilter] = useState<string>('none');
  const [autoCopy, setAutoCopy] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  
  const [showBGRemover, setShowBGRemover] = useState(false);
  const [bgInputUrl, setBgInputUrl] = useState('');
  const [bgBlob, setBgBlob] = useState<Blob | null>(null);
  const [bgResultImg, setBgResultImg] = useState<string | null>(null);
  const [isRemovingBgInternal, setIsRemovingBgInternal] = useState(false);

  const handleRemoveBGUrl = async (url: string, fileSource?: Blob | null) => {
    if (!url && !fileSource) return;
    setIsRemovingBgInternal(true);
    setBgResultImg(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const formData = new FormData();
      const source = fileSource || bgBlob;

      if (source) {
        formData.append("image_file", source, "image.png");
      } else if (url) {
        formData.append("image_url", url);
      }
      formData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "kWeEsu1kfsLT4dDHFwQzKPbf",
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.errors?.[0]?.title || errorMsg;
        } catch (e) {
          // If not JSON, show status
        }
        
        if (response.status === 402) {
          throw new Error("API credits khatam ho gaye hain. Naya account use karein.");
        } else if (response.status === 403) {
          throw new Error("API key invalid hai.");
        }
        throw new Error(errorMsg);
      }

      const resultBlob = await response.blob();
      if (resultBlob.size < 100) throw new Error("Invalid image result received");
      
      const resultUrl = URL.createObjectURL(resultBlob);
      setBgResultImg(resultUrl);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Remove.bg error:", error);
      if (error.name === 'AbortError') {
        alert("❌ Request timed out (60s). Internet slow ho sakta hai ya API busy hai.");
      } else {
        alert(`❌ ${error.message}`);
      }
    } finally {
      setIsRemovingBgInternal(false);
    }
  };

  const [ikPublic, setIkPublic] = useState(localStorage.getItem('ik_public') || IMAGEKIT_PUBLIC);
  const [ikPrivate, setIkPrivate] = useState(localStorage.getItem('ik_private') || IMAGEKIT_PRIVATE);
  const [ibbKey, setIbbKey] = useState(localStorage.getItem('ibb_key') || IMGBB_API_KEY);

  useEffect(() => {
    localStorage.setItem('ik_public', ikPublic);
    localStorage.setItem('ik_private', ikPrivate);
    localStorage.setItem('ibb_key', ibbKey);
  }, [ikPublic, ikPrivate, ibbKey]);
  const [uploads, setUploads] = useState<UploadedFile[]>(() => {
    const saved = sessionStorage.getItem('imagelite_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // We can't persist Blob URLs, so we'll use the final URL as preview if available
        return parsed.map((u: any) => ({
          ...u,
          previewUrl: u.url || u.previewUrl,
          status: u.status === 'success' ? 'success' : 'error' // Reset pending/uploading to error if they were interrupted
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const toSave = uploads.filter(u => u.status === 'success').map(u => ({
      id: u.id,
      originalFile: { name: u.originalFile.name, type: u.originalFile.type },
      originalSize: u.originalSize,
      compressedSize: u.compressedSize,
      status: u.status,
      url: u.url,
      originalUrl: u.originalUrl
    }));
    sessionStorage.setItem('imagelite_history', JSON.stringify(toSave));
  }, [uploads]);

  const [isDragging, setIsDragging] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeQR, setActiveQR] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  
  // Bulk links state
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [isFetchingLinks, setIsFetchingLinks] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef({ server, compressEnabled, multipleEnabled, targetSize, outputFormat, imageFilter, autoCopy });

  useEffect(() => {
    settingsRef.current = { server, compressEnabled, multipleEnabled, targetSize, outputFormat, imageFilter, autoCopy };
  }, [server, compressEnabled, multipleEnabled, targetSize, outputFormat, imageFilter, autoCopy]);

  const updateUploadStatus = useCallback((id: string, updates: Partial<UploadedFile>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const processSingleFile = useCallback(async (id: string, file: File, currentSettings: any, originalUrl?: string, forceUpload?: boolean) => {
    try {
      let fileToUpload: Blob | File = file;
      let outputType = file.type;

      // Skip compression if it's from a URL (originalUrl exists) or if compression is disabled
      if (currentSettings.compressEnabled && !originalUrl) {
        updateUploadStatus(id, { status: 'compressing' });
        const isTransparent = outputType === 'image/png' || outputType === 'image/webp';
        outputType = currentSettings.outputFormat === 'auto' 
          ? (isTransparent ? 'image/webp' : 'image/jpeg')
          : `image/${currentSettings.outputFormat}`;
        
        fileToUpload = await compressImage(fileToUpload as File, currentSettings.targetSize, currentSettings.outputFormat, currentSettings.imageFilter);
        updateUploadStatus(id, { compressedBlob: fileToUpload, compressedSize: fileToUpload.size });
      }

      // If we have an originalUrl, we just use it directly and don't upload, UNLESS forceUpload is true
      if (originalUrl && !forceUpload) {
        updateUploadStatus(id, { 
          status: 'success', 
          url: originalUrl 
        });
        return;
      }

      updateUploadStatus(id, { status: 'uploading' });
      
      let url;
      let lastError = "";
      try {
        const ikKeys = { public: ikPublic, private: ikPrivate };
        if (currentSettings.server === 'imagekit') {
          try {
            url = await uploadToImageKit(fileToUpload, outputType, ikKeys);
          } catch (e: any) {
            lastError = `ImageKit: ${e.message}`;
            console.warn("ImageKit failed, falling back to ImgBB", e);
            url = await uploadToImgBB(fileToUpload, outputType, ibbKey);
          }
        } else {
          try {
            url = await uploadToImgBB(fileToUpload, outputType, ibbKey);
          } catch (e: any) {
            lastError = `ImgBB: ${e.message}`;
            console.warn("ImgBB failed, falling back to ImageKit", e);
            url = await uploadToImageKit(fileToUpload, outputType, ikKeys);
          }
        }
      } catch (finalError: any) {
        const errorMessage = lastError 
          ? `${lastError} | Fallback: ${finalError.message}`
          : finalError.message;
        throw new Error(`Upload failed: ${errorMessage}`);
      }

      updateUploadStatus(id, { status: 'success', url });
      if (settingsRef.current.autoCopy && url) {
        navigator.clipboard.writeText(url);
      }
    } catch (error: any) {
      updateUploadStatus(id, { status: 'error', error: error.message || 'Upload failed' });
    }
  }, [updateUploadStatus]);

  const processFiles = useCallback((files: File[], originalUrls?: string[]) => {
    const currentSettings = settingsRef.current;
    if (files.length === 0) return;

    const filesToProcess = currentSettings.multipleEnabled ? files : [files[0]];
    const urlsToProcess = originalUrls ? (currentSettings.multipleEnabled ? originalUrls : [originalUrls[0]]) : [];
    
    // Filter out files that are already in the uploads list by originalUrl
    const existingUrls = new Set(uploads.map(u => u.originalUrl).filter(Boolean));
    
    const newUploads: UploadedFile[] = [];
    
    filesToProcess.forEach((file, index) => {
      const url = urlsToProcess[index];
      if (url && existingUrls.has(url)) return;
      
      newUploads.push({
        id: Math.random().toString(36).substring(7),
        originalFile: file,
        originalSize: file.size,
        status: 'pending',
        previewUrl: URL.createObjectURL(file),
        originalUrl: url
      });
    });

    if (newUploads.length === 0) return;

    if (!currentSettings.multipleEnabled) {
      setUploads(newUploads);
    } else {
      setUploads(prev => [...prev, ...newUploads]);
    }

    newUploads.forEach(upload => {
      processSingleFile(upload.id, upload.originalFile, currentSettings, upload.originalUrl);
    });
  }, [processSingleFile]);

  const handleLoadLinks = async () => {
    if (!pasteText.trim()) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = pasteText.match(urlRegex);
    
    if (!urls || urls.length === 0) return;
    
    // Normalize and filter URLs
    const normalizeUrl = (url: string) => {
      try {
        // Special handling for Pinterest to get original quality and avoid duplicates
        if (url.includes('i.pinimg.com')) {
          return url.replace(/\/(?:236x|474x|564x|736x)\//, '/originals/');
        }
        // Remove tracking params
        const u = new URL(url);
        u.search = '';
        return u.toString();
      } catch (e) {
        return url;
      }
    };

    const uniqueUrlsMap = new Map<string, string>();
    urls.forEach(url => {
      const normalized = normalizeUrl(url);
      const filename = normalized.split('/').pop()?.split('?')[0] || normalized;
      
      // If we already have this filename, prefer the normalized/original version
      if (!uniqueUrlsMap.has(filename) || normalized.includes('/originals/')) {
        uniqueUrlsMap.set(filename, url);
      }
    });
    
    const urlsToFetch = Array.from(uniqueUrlsMap.values());

    setIsFetchingLinks(true);
    setFetchProgress({ current: 0, total: urlsToFetch.length });
    
    // Ensure multiple mode is on if we are loading multiple links
    if (urlsToFetch.length > 1 && !multipleEnabled) {
      setMultipleEnabled(true);
    }

    const batchSize = 5;
    for (let i = 0; i < urlsToFetch.length; i += batchSize) {
      const batch = urlsToFetch.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (url) => {
        const file = await fetchImageWithProxies(url);
        if (file) {
          processFiles([file], [url]);
        }
        setFetchProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }));
    }
    
    setIsFetchingLinks(false);
    setPasteText(''); // Clear after loading
    setShowPasteArea(false); // Hide area after loading
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (!e.clipboardData) return;
      
      // Check for files directly
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
          e.preventDefault();
          processFiles(files);
          return;
        }
      }

      // Check items (for images copied from browser)
      const items = Array.from(e.clipboardData.items);
      const filesFromItems = items
        .filter(item => item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter(Boolean) as File[];
      
      if (filesFromItems.length > 0) {
        e.preventDefault();
        processFiles(filesFromItems);
        return;
      }

      const text = e.clipboardData.getData('text');
      if (text) {
        if (text.startsWith('data:image/')) {
          e.preventDefault();
          try {
            const arr = text.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], 'pasted-image.png', { type: mime });
            processFiles([file]);
          } catch (err) {
            console.error('Failed to parse base64 image', err);
          }
        } else {
          // Extract all URLs from the pasted text
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const urls = text.match(urlRegex);
          
          if (urls && urls.length > 0) {
            e.preventDefault();
            
    const normalizeUrl = (url: string) => {
      try {
        if (url.includes('i.pinimg.com')) {
          return url.replace(/\/(?:236x|474x|564x|736x)\//, '/originals/');
        }
        const u = new URL(url);
        u.search = '';
        return u.toString();
      } catch (e) {
        return url;
      }
    };

    const uniqueUrlsMap = new Map<string, string>();
    urls.forEach(url => {
      const normalized = normalizeUrl(url);
      const filename = normalized.split('/').pop()?.split('?')[0] || normalized;
      if (!uniqueUrlsMap.has(filename) || normalized.includes('/originals/')) {
        uniqueUrlsMap.set(filename, url);
      }
    });
    
    const urlsToFetch = Array.from(uniqueUrlsMap.values());

            const fetchedFiles: File[] = [];
            const fetchedUrls: string[] = [];
            
            // Process in batches to speed up fetching
            const batchSize = 5;
            for (let i = 0; i < urlsToFetch.length; i += batchSize) {
              const batch = urlsToFetch.slice(i, i + batchSize);
              
              const results = await Promise.all(batch.map(async (url) => {
                const file = await fetchImageWithProxies(url);
                return { file, url };
              }));
              
              for (const res of results) {
                if (res.file) {
                  fetchedFiles.push(res.file);
                  fetchedUrls.push(res.url);
                }
              }
            }
            
            if (fetchedFiles.length > 0) {
              processFiles(fetchedFiles, fetchedUrls);
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
      processFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((f: File) => f.type.startsWith('image/'));
      processFiles(files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyAllLinks = () => {
    const successfulUploads = uploads.filter(u => u.status === 'success' && u.url);
    if (successfulUploads.length === 0) return;

    const textToCopy = successfulUploads.map((u, index) => `Image ${index + 1}: ${u.url}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = (upload: UploadedFile) => {
    const isHistoryItem = !(upload.originalFile instanceof File);
    
    if (isHistoryItem && upload.url) {
      window.open(upload.url, '_blank');
      return;
    }

    const blob = upload.compressedBlob || upload.originalFile;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let ext = upload.originalFile.name.split('.').pop() || 'jpg';
    if (compressEnabled) {
      if (outputFormat === 'webp') ext = 'webp';
      else if (outputFormat === 'jpeg') ext = 'jpg';
      else if (outputFormat === 'png') ext = 'png';
      else if (outputFormat === 'auto') {
        const isTransparent = upload.originalFile.type === 'image/png' || upload.originalFile.type === 'image/webp';
        ext = isTransparent ? 'webp' : 'jpg';
      }
    }
    
    a.download = `optimized_${upload.originalFile.name.split('.')[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadExtension = async () => {
    const zip = new JSZip();
    
    const manifest = {
      "manifest_version": 3,
      "name": "Image Lite Pro Extractor",
      "version": "1.2",
      "description": "Extract image links from any webpage and fetch them to Image Lite Pro.",
      "permissions": ["activeTab", "scripting", "contextMenus", "clipboardWrite"],
      "action": {
        "default_popup": "popup.html",
        "default_title": "Extract Images"
      },
      "background": {
        "service_worker": "background.js"
      }
    };
    
    const appUrl = window.location.origin + window.location.pathname;
    
    const backgroundJs = `
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "uploadImage",
    title: "Upload Image to Get URL",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "uploadImage" && info.srcUrl) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: (url, appUrl) => {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        window.open(appUrl + '#autoPaste=true', '_blank');
      },
      args: [info.srcUrl, '${appUrl}']
    });
  }
});
    `;

    const popupHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 350px;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      color: #1e293b;
      margin: 0;
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: #0f172a;
    }
    .section {
      margin-bottom: 16px;
    }
    .label {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    textarea {
      width: 100%;
      height: 100px;
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 11px;
      font-family: monospace;
      resize: none;
      background-color: #f8fafc;
      box-sizing: border-box;
    }
    .button-group {
      display: flex;
      justify-content: flex-end;
      margin-top: 6px;
    }
    button {
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    .btn-copy {
      background-color: #3b82f6;
      color: white;
    }
    .btn-copy:hover {
      background-color: #2563eb;
    }
    .btn-fetch {
      width: 100%;
      padding: 10px;
      background-color: #10b981;
      color: white;
      font-size: 14px;
      margin-top: 8px;
    }
    .btn-fetch:hover {
      background-color: #059669;
    }
    .loading {
      text-align: center;
      padding: 20px;
      font-size: 13px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <h2>Extract image links from webpage.</h2>
  
  <div id="content" style="display: none;">
    <div class="section">
      <div class="label">🔢 With numbering:</div>
      <textarea id="withNumbering" readonly></textarea>
      <div class="button-group">
        <button id="copyNumbered" class="btn-copy">Copy</button>
      </div>
    </div>

    <div class="section">
      <div class="label">≡ Without numbering:</div>
      <textarea id="withoutNumbering" readonly></textarea>
      <div class="button-group">
        <button id="copyPlain" class="btn-copy">Copy</button>
      </div>
    </div>

    <button id="fetchBtn" class="btn-fetch">Fetch to Image Lite Pro</button>
  </div>

  <div id="loader" class="loading">
    Extracting images...
  </div>

  <script src="popup.js"></script>
</body>
</html>
    `;

    const popupJs = `
const appUrl = '${appUrl}';

function extractImages() {
  const imageMap = new Map(); // Use map to deduplicate by filename
  
  const addUrl = (url) => {
    if (!url || !url.startsWith('http')) return;
    
    let normalized = url;
    // Pinterest normalization
    if (url.includes('i.pinimg.com')) {
      normalized = url.replace(/\\/(?:236x|474x|564x|736x)\\//, '/originals/');
    }
    
    const filename = normalized.split('/').pop().split('?')[0];
    if (!imageMap.has(filename) || normalized.includes('/originals/')) {
      imageMap.set(filename, url);
    }
  };

  document.querySelectorAll('img').forEach(img => {
    const sources = [
      img.src,
      img.dataset.src,
      img.dataset.original,
      img.dataset.lazy,
      img.getAttribute('data-src'),
      img.getAttribute('data-original-src')
    ];
    
    sources.forEach(addUrl);
    
    if (img.srcset) {
      const parts = img.srcset.split(',');
      const bestPart = parts[parts.length - 1].trim().split(' ')[0];
      addUrl(bestPart);
    }
  });
  
  const containers = document.querySelectorAll('div, section, header, footer, main, article, aside, [class*="bg-"], [class*="image"]');
  containers.forEach(el => {
    try {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url(')) {
        const match = bg.match(/url\\\\(["']?([^"']+)["']?\\\\)/);
        if (match && match[1]) addUrl(match[1]);
      }
    } catch (e) {}
  });
  
  document.querySelectorAll('source').forEach(source => {
    if (source.srcset) {
      const parts = source.srcset.split(',');
      const bestPart = parts[parts.length - 1].trim().split(' ')[0];
      addUrl(bestPart);
    }
  });

  document.querySelectorAll('a').forEach(a => {
    const href = a.href;
    if (href && href.match(/\\\\.(jpeg|jpg|gif|png|webp|svg)(\\\\?.*)?$/i)) {
      addUrl(href);
    }
  });

  return Array.from(imageMap.values());
}

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.scripting.executeScript({
    target: {tabId: tabs[0].id},
    function: extractImages
  }, (results) => {
    const images = results[0].result;
    document.getElementById('loader').style.display = 'none';
    document.getElementById('content').style.display = 'block';

    if (!images || images.length === 0) {
      document.getElementById('content').innerHTML = '<div class="loading">No images found on this page.</div>';
      return;
    }

    const numberedText = images.map((url, i) => (i + 1) + ". " + url).join('\\n');
    const plainText = images.join('\\n');

    document.getElementById('withNumbering').value = numberedText;
    document.getElementById('withoutNumbering').value = plainText;

    document.getElementById('copyNumbered').onclick = () => {
      navigator.clipboard.writeText(numberedText);
      const btn = document.getElementById('copyNumbered');
      btn.innerText = 'Copied!';
      setTimeout(() => btn.innerText = 'Copy', 2000);
    };

    document.getElementById('copyPlain').onclick = () => {
      navigator.clipboard.writeText(plainText);
      const btn = document.getElementById('copyPlain');
      btn.innerText = 'Copied!';
      setTimeout(() => btn.innerText = 'Copy', 2000);
    };

    document.getElementById('fetchBtn').onclick = () => {
      navigator.clipboard.writeText(plainText).then(() => {
        window.open(appUrl + '#autoPaste=true', '_blank');
      });
    };
  });
});
    `;
    
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    zip.file("background.js", backgroundJs.trim());
    zip.file("popup.html", popupHtml.trim());
    zip.file("popup.js", popupJs.trim());
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'image-extractor-extension.zip');
  };

  const handleDownloadAll = async () => {
    const successfulUploads = uploads.filter(u => (u.status === 'success' || u.status === 'error') && (u.originalFile instanceof File || u.compressedBlob));
    if (successfulUploads.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      successfulUploads.forEach((upload, index) => {
        const blob = (upload.compressedBlob || upload.originalFile) as Blob;
        let ext = upload.originalFile.name.split('.').pop() || 'jpg';
        
        if (compressEnabled) {
          if (outputFormat === 'webp') ext = 'webp';
          else if (outputFormat === 'jpeg') ext = 'jpg';
          else if (outputFormat === 'png') ext = 'png';
          else if (outputFormat === 'auto') {
            const isTransparent = upload.originalFile.type === 'image/png' || upload.originalFile.type === 'image/webp';
            ext = isTransparent ? 'webp' : 'jpg';
          }
        }
        
        const filename = `optimized_${upload.originalFile.name.split('.')[0]}_${index + 1}.${ext}`;
        zip.file(filename, blob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'optimized_images.zip');
    } catch (error) {
      console.error('Failed to create zip file', error);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDeleteUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  const handleReplaceClick = (id: string) => {
    setReplacingId(id);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleForceUpload = useCallback(async (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload) {
      updateUploadStatus(id, { status: 'uploading' });
      
      try {
        let blobToUse: Blob | File | undefined = upload.compressedBlob || upload.originalFile;
        
        // Handle stub files after reload
        if (blobToUse && !(blobToUse instanceof Blob) && (upload.url || upload.previewUrl)) {
          const resp = await fetch(upload.url || upload.previewUrl);
          if (resp.ok) {
            blobToUse = await resp.blob();
          }
        }

        if (!blobToUse || !(blobToUse instanceof Blob)) {
          throw new Error("Local image data missing. Please re-upload.");
        }

        // Use name from originalFile stub if necessary
        const fileName = (upload.originalFile as any).name || 'image.png';
        const fileToUpload = new File([blobToUse], fileName, { type: blobToUse.type });
        processSingleFile(id, fileToUpload, settingsRef.current, upload.originalUrl, true);
      } catch (error: any) {
        updateUploadStatus(id, { status: 'error', error: `Upload Failed: ${error.message}` });
      }
    }
  }, [uploads, processSingleFile, updateUploadStatus]);

  const handleRemoveBG = useCallback(async (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (!upload) return;

    updateUploadStatus(id, { status: 'removing_bg' });

    try {
      const formData = new FormData();
      let source: Blob | File | undefined = upload.compressedBlob || upload.originalFile;
      
      // If originalFile is just a metadata object (happens after reload), try to fetch from URL
      if (source && !(source instanceof Blob) && (upload.url || upload.previewUrl)) {
        try {
          const resp = await fetch(upload.url || upload.previewUrl);
          if (resp.ok) {
            source = await resp.blob();
          }
        } catch (e) {
          console.warn("Failed to fetch image for BG removal fallback", e);
        }
      }

      if (!source || !(source instanceof Blob)) {
        throw new Error("Local image data not found. Please re-upload the image.");
      }
      
      formData.append("image_file", source, "image.png");
      formData.append("size", "auto");

      // Using the provided Remove.bg API key
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "kWeEsu1kfsLT4dDHFwQzKPbf",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.title || `API Error: ${response.status}`);
      }

      const resultBlob = await response.blob();
      const newPreviewUrl = URL.createObjectURL(resultBlob);
      
      const noBgFile = new File([resultBlob], `nobg_${Date.now()}.png`, { type: 'image/png' });

      updateUploadStatus(id, { 
        compressedBlob: resultBlob,
        compressedSize: resultBlob.size,
        previewUrl: newPreviewUrl,
        status: 'uploading'
      });

      // Automatically re-upload the processed image to update the live URL
      await processSingleFile(id, noBgFile, settingsRef.current, undefined, true);

    } catch (error: any) {
      console.error("Inline BG REMOVAL FAILED:", error);
      updateUploadStatus(id, { status: 'error', error: `BG REMOVAL FAILED: ${error.message}` });
    }
  }, [uploads, updateUploadStatus, processSingleFile]);

  const handleRemoveAllBG = async () => {
    const pendingUploads = uploads.filter(u => u.status === 'success');
    for (const upload of pendingUploads) {
      await handleRemoveBG(upload.id);
    }
  };

  const handleReplaceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && replacingId) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setUploads(prev => prev.map(u => {
          if (u.id === replacingId) {
            return {
              ...u,
              originalFile: file,
              originalSize: file.size,
              status: 'pending',
              previewUrl: URL.createObjectURL(file),
              compressedBlob: undefined,
              compressedSize: undefined,
              url: undefined,
              error: undefined
            };
          }
          return u;
        }));
        processSingleFile(replacingId, file, settingsRef.current);
      }
    }
    if (replaceInputRef.current) replaceInputRef.current.value = '';
    setReplacingId(null);
  };

  const mainContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === '#autoPaste=true') {
      // Clear the hash
      window.history.replaceState(null, '', window.location.pathname);
      
      // Try to read clipboard
      setTimeout(async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            setShowPasteArea(true);
            setPasteText(text);
          }
        } catch (err) {
          console.error('Failed to read clipboard automatically', err);
        }
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (mainContainerRef.current) {
      mainContainerRef.current.focus();
    }
  }, []);

  const totalOriginalSize = uploads.reduce((acc, u) => acc + u.originalSize, 0);
  const totalCompressedSize = uploads.reduce((acc, u) => acc + (u.compressedSize || u.originalSize), 0);

  return (
    <div 
      ref={mainContainerRef}
      tabIndex={-1}
      className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans focus:outline-none"
    >
      <div className="bg-slate-900/80 backdrop-blur-xl w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col md:flex-row h-auto md:h-[700px]">
        
        {/* Left Panel */}
        <div className="w-full md:w-5/12 p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col">
          <div className="mb-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">
                  Image<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Lite</span>
                </h1>
                <p className="text-slate-400 text-xs text-center md:text-left">Smart Image Compressor & Uploader</p>
              </div>
              <button 
                onClick={() => {
                  setBgInputUrl('');
                  setBgBlob(null);
                  setBgResultImg(null);
                  setShowBGRemover(!showBGRemover);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 rounded-lg text-xs font-bold transition-all border border-purple-500/30 group"
                title="AI Background Remover"
              >
                <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="xl:inline">BG Remover</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {uploads.length > 0 && (
                <button 
                  onClick={() => setUploads([])}
                  className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors group"
                  title="Clear All"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 mb-6 space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <Settings2 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Settings</span>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={handleDownloadExtension}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-md transition-colors"
                  title="Download Chrome Extension to extract images from any website"
                >
                  <Download className="w-3 h-3" />
                  Extension
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Bulk Links</span>
                  <button 
                    onClick={() => setShowPasteArea(!showPasteArea)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${showPasteArea ? 'bg-purple-500' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showPasteArea ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Compress</span>
                  <button 
                    onClick={() => setCompressEnabled(!compressEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${compressEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${compressEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Multiple</span>
                  <button 
                    onClick={() => setMultipleEnabled(!multipleEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${multipleEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${multipleEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Auto-Copy</span>
                  <button 
                    onClick={() => setAutoCopy(!autoCopy)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${autoCopy ? 'bg-orange-500' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoCopy ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {showPasteArea && (
              <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                  Paste Image URLs (one per line or space-separated)
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.png"
                  className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
                  disabled={isFetchingLinks}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-medium">
                    {isFetchingLinks ? `Loading ${fetchProgress.current} of ${fetchProgress.total}...` : ''}
                  </div>
                  <button
                    onClick={handleLoadLinks}
                    disabled={isFetchingLinks || !pasteText.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    {isFetchingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isFetchingLinks ? 'Loading...' : 'Load Images'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Server</span>
                <select 
                  value={server} 
                  onChange={(e) => setServer(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="imagekit">ImageKit</option>
                  <option value="imgbb">ImgBB</option>
                </select>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Format</span>
                <select 
                  value={outputFormat} 
                  onChange={(e) => setOutputFormat(e.target.value as any)}
                  disabled={!compressEnabled}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="auto">Auto (Smart)</option>
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>

              <div className="flex flex-col col-span-2 pt-2">
                <button 
                  onClick={() => setShowKeys(!showKeys)}
                  className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase transition-colors"
                >
                  <LinkIcon className="w-3 h-3" />
                  {showKeys ? 'Hide API Keys' : 'Manage API Keys'}
                </button>
                
                {showKeys && (
                  <div className="mt-3 space-y-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">ImageKit Public Key</label>
                      <input 
                        type="password"
                        value={ikPublic}
                        onChange={(e) => setIkPublic(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">ImageKit Private Key</label>
                      <input 
                        type="password"
                        value={ikPrivate}
                        onChange={(e) => setIkPrivate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">ImgBB API Key</label>
                      <input 
                        type="password"
                        value={ibbKey}
                        onChange={(e) => setIbbKey(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        setIkPublic(IMAGEKIT_PUBLIC);
                        setIkPrivate(IMAGEKIT_PRIVATE);
                        setIbbKey(IMGBB_API_KEY);
                      }}
                      className="w-full text-[10px] font-bold text-red-400 hover:text-red-300 uppercase pt-1"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col col-span-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Image Filter (Requires Compress)</span>
                <select 
                  value={imageFilter} 
                  onChange={(e) => setImageFilter(e.target.value)}
                  disabled={!compressEnabled}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="none">Normal</option>
                  <option value="grayscale(100%)">Grayscale</option>
                  <option value="sepia(100%)">Sepia</option>
                  <option value="invert(100%)">Invert</option>
                  <option value="blur(4px)">Blur</option>
                </select>
              </div>
            </div>

            <div className={`flex flex-col transition-opacity ${!compressEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Target Size</span>
                <span className="text-[10px] font-bold text-blue-400">{targetSize} KB</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="50"
                value={targetSize} 
                onChange={(e) => setTargetSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <div 
            tabIndex={0}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500/50
              ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple={multipleEnabled}
              onChange={handleFileInput}
            />
            <input 
              type="file" 
              ref={replaceInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple={false}
              onChange={handleReplaceInput}
            />
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-slate-200">Upload Image{multipleEnabled ? 's' : ''}</h3>
            <p className="text-xs text-slate-500 mt-2">Drag & Drop or CTRL+V</p>
          </div>

          {uploads.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Original</p>
                <p className="text-base font-mono mt-1 text-slate-300">{formatBytes(totalOriginalSize)}</p>
              </div>
              <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/50">
                <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Total Output</p>
                <p className="text-base font-mono mt-1 text-emerald-400">{formatBytes(totalCompressedSize)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-7/12 bg-slate-950/50 flex flex-col relative overflow-hidden">
          {uploads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
              <ImageIcon className="w-20 h-20 text-slate-600 mb-4" />
              <p className="font-medium text-slate-400">Optimized results will appear here</p>
            </div>
          ) : uploads.length === 1 ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden p-6">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="font-semibold text-slate-200 truncate pr-4">{uploads[0].originalFile.name}</h2>
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => handleReplaceClick(uploads[0].id)}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                    title="Replace Image"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUpload(uploads[0].id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="shrink-0 flex items-center gap-2 border-l border-slate-700 pl-3 ml-1">
                    {uploads[0].status === 'pending' && <><Loader2 className="w-4 h-4 text-slate-500 animate-spin" /><span className="text-xs text-slate-500">Pending</span></>}
                    {uploads[0].status === 'compressing' && <><Loader2 className="w-4 h-4 text-blue-400 animate-spin" /><span className="text-xs text-blue-400">Compressing</span></>}
                    {uploads[0].status === 'uploading' && <><Loader2 className="w-4 h-4 text-emerald-400 animate-spin" /><span className="text-xs text-emerald-400">Uploading</span></>}
                    {uploads[0].status === 'removing_bg' && <><Loader2 className="w-4 h-4 text-purple-400 animate-spin" /><span className="text-xs text-purple-400">Removing BG</span></>}
                    {uploads[0].status === 'success' && <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-xs text-emerald-500">Success</span></>}
                    {uploads[0].status === 'error' && <><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-red-500">Error</span></>}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-0 mb-6 rounded-2xl overflow-hidden border border-slate-700 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-repeat flex items-center justify-center relative bg-slate-900/50 shadow-inner">
                <img src={uploads[0].previewUrl} className="w-full h-full object-contain drop-shadow-2xl" alt="preview" />
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shrink-0">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-2">
                    <span>Original: {formatBytes(uploads[0].originalSize)}</span>
                    {compressEnabled && uploads[0].compressedSize && (
                      <>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-emerald-400">Compressed: {formatBytes(uploads[0].compressedSize)}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {uploads[0].status === 'success' && (
                      <button 
                        onClick={() => handleRemoveBG(uploads[0].id)}
                        className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                      >
                        <Wand2 className="w-3.5 h-3.5" /> Remove BG
                      </button>
                    )}
                    {uploads[0].status === 'success' && uploads[0].url && (
                      <button 
                        onClick={() => navigator.clipboard.writeText(uploads[0].url!)}
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </button>
                    )}
                    {(uploads[0].status === 'success' || uploads[0].status === 'error') && (
                      <button 
                        onClick={() => handleDownload(uploads[0])}
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    )}
                  </div>
                </div>

                {uploads[0].status === 'success' && uploads[0].url && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={uploads[0].url} 
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500" 
                      />
                      <button 
                        onClick={() => setActiveQR(activeQR === uploads[0].id ? null : uploads[0].id)}
                        className={`px-3 rounded-lg flex items-center justify-center transition-colors ${activeQR === uploads[0].id ? 'bg-purple-600 text-white border border-purple-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'}`}
                        title="Show QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { 
                          navigator.clipboard.writeText(uploads[0].url!); 
                          const btn = e.currentTarget;
                          const originalText = btn.innerText;
                          btn.innerText = 'Copied!';
                          btn.classList.add('bg-emerald-600');
                          setTimeout(() => {
                            btn.innerText = originalText;
                            btn.classList.remove('bg-emerald-600');
                          }, 2000);
                        }} 
                        className="bg-blue-600 hover:bg-blue-500 px-4 rounded-lg text-xs font-bold transition-colors text-white"
                      >
                        Copy
                      </button>
                    </div>
                    {activeQR === uploads[0].id && (
                      <div className="flex justify-center p-4 bg-white rounded-xl self-start shadow-xl border border-slate-200">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(uploads[0].url)}`} alt="QR Code" className="w-32 h-32" />
                      </div>
                    )}
                  </div>
                )}
                {uploads[0].status === 'error' && (
                  <p className="text-xs text-red-400">{uploads[0].error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
                <h2 className="font-semibold text-slate-200">Uploads ({uploads.length})</h2>
                <div className="flex items-center gap-3">
                  {uploads.some(u => u.status === 'success' || u.status === 'error') && (
                    <button 
                      onClick={handleDownloadAll}
                      disabled={isZipping}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                      {isZipping ? 'Zipping...' : 'Download All (ZIP)'}
                    </button>
                  )}
                  {uploads.some(u => u.status === 'success') && (
                    <button 
                      onClick={copyAllLinks}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      {copiedAll ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedAll ? 'Copied All!' : 'Copy All Links'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {uploads.map(upload => (
                  <ImageCard
                    key={upload.id}
                    upload={upload}
                    onReplace={handleReplaceClick}
                    onDelete={handleDeleteUpload}
                    onDownload={handleDownload}
                    onShowQR={(url) => setActiveQR(activeQR === upload.id ? null : upload.id)}
                    onForceUpload={handleForceUpload}
                    onRemoveBG={handleRemoveBG}
                    formatBytes={formatBytes}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Background Remover Modal (RDX Style) */}
      {showBGRemover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-[#0b0f15] border border-[#00c2ff]/20 rounded-[2.5rem] overflow-hidden shadow-[0_30px_50px_rgba(0,0,0,0.7),0_0_20px_rgba(0,160,255,0.2)] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#00c2ff]/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00c2ff]/10 rounded-xl">
                  <Wand2 className="w-5 h-5 text-[#00c2ff] drop-shadow-[0_0_8px_#00a6ff]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">✂️ Background Remover</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest border-l-2 border-[#00b4d8] pl-2 mt-1">RDX TOOLS — Image URL dein</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBGRemover(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              {/* API Status Badge */}
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 w-fit">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase">API Key Connected • Remove.bg Ready</span>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  <LinkIcon className="w-3 h-3 inline mr-1" /> Image Source URL or File
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="url"
                      value={bgInputUrl}
                      onChange={(e) => {
                        setBgInputUrl(e.target.value);
                        setBgBlob(null);
                      }}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 bg-[#0c121c] border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/50 transition-all shadow-inner"
                    />
                    <label className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl cursor-pointer text-slate-400 transition-colors shrink-0">
                      <ImageIcon className="w-5 h-5" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setBgBlob(e.target.files[0]);
                            setBgInputUrl('');
                            setBgResultImg(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <button 
                    onClick={() => handleRemoveBGUrl(bgInputUrl, bgBlob)}
                    disabled={isRemovingBgInternal || (!bgInputUrl && !bgBlob)}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#001e33] to-[#00101f] border border-[#00a6ff] hover:border-[#3cc5ff] hover:shadow-[0_0_20px_#0080ffaa] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all text-sm uppercase tracking-wider min-w-[200px]"
                  >
                    {isRemovingBgInternal ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Working magic...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">⚡ Remove Background</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Input Image</label>
                  <div className="aspect-square bg-[#0b0f15] rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden shadow-inner relative group">
                    {bgInputUrl || bgBlob ? (
                      <img 
                        src={bgBlob ? URL.createObjectURL(bgBlob) : bgInputUrl} 
                        alt="Preview" 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="text-slate-700 flex flex-col items-center gap-2">
                        <ImageIcon className="w-10 h-10 opacity-20" />
                        <span className="text-[10px] font-bold tracking-widest">NO IMAGE SELECTED</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Result (Transparent PNG)</label>
                  <div className="aspect-square bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-repeat bg-[#0b0f15] rounded-3xl border border-[#00c2ff]/10 flex items-center justify-center overflow-hidden relative shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
                    {bgResultImg ? (
                      <img src={bgResultImg} alt="Result" className="w-full h-full object-contain animate-in zoom-in-95 duration-500 shadow-2xl p-4" />
                    ) : (
                      <div className="text-slate-700 flex flex-col items-center gap-2">
                        {isRemovingBgInternal ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-[#00c2ff]/20 border-t-[#00c2ff] rounded-full animate-spin shadow-[0_0_15px_rgba(0,194,255,0.3)]" />
                            <span className="text-[10px] font-bold tracking-widest animate-pulse text-[#00c2ff]">MAGIC IN PROGRESS...</span>
                          </div>
                        ) : (
                          <>
                            <Wand2 className="w-10 h-10 opacity-10" />
                            <span className="text-[10px] font-bold tracking-widest">TRANSPARENT PNG</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {bgResultImg && (
                <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                  <a 
                    href={bgResultImg} 
                    download="rdx-nobg.png"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs"
                  >
                    <Download className="w-4 h-4" /> Download PNG
                  </a>
                  <button 
                    onClick={() => {
                      fetch(bgResultImg).then(r => r.blob()).then(blob => {
                        const item = new ClipboardItem({'image/png': blob});
                        navigator.clipboard.write([item]);
                        alert('Copied image to clipboard!');
                      });
                    }}
                    className="px-6 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 bg-black/40 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em]">© RDX TOOLS — SARDAR RDX</p>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
