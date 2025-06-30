'use client';

import { useState } from 'react';

export default function UploadImage() {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setIsUploading(false);

    if (res.ok) {
      setImageUrl(data.url);
    } else {
      alert(data.error || 'Upload failed');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={!file || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="Uploaded preview" className="w-64 rounded" />
        </div>
      )}
    </div>
  );
}
