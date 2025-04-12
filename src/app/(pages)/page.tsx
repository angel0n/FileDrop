"use client";

import { Download, X } from "@deemlol/next-icons";
import { useState, FormEvent, ChangeEvent, useEffect } from "react";

type FileMeta = {
  name: string;
  size: number;
  type: string;
  lastModified?: string;
};

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [filesList, setFilesList] = useState<FileMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    buscarArquivos();
  }, []);

  const buscarArquivos = async () => {
    fetch("/api/files/list")
      .then((res) => res.json())
      .then((data) => setFilesList(data.files))
      .catch(() => setError("Failed to load file list"));
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const prevFiles = files ? Array.from(files) : [];
      const fileList = new DataTransfer();
      const newFilesFiltered = newFiles.filter(file => !prevFiles.includes(file));
      [...prevFiles, ...newFilesFiltered].forEach(file => {
        fileList.items.add(file);
      });

      setFiles(fileList.files);
      setError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setMessage("Files uploaded successfully");
      setFiles(null);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      buscarArquivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const handleDelete = (file: FileMeta) => {
    fetch(`/api/files/delete?fileName=${file.name}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        buscarArquivos();
      })
      .catch((error) => setError(error.message));
  }

  const handleDownload = (file: FileMeta) => {
    window.open(`/api/files/download?fileName=${file.name}`, "_blank");
  }

  return (
    <main className="flex flex-col items-center  min-h-screen p-10">
      <div className="w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Upload files</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer relative">
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <label htmlFor="file-upload" className="block">
              <p className="text-white font-medium">Click to select files</p>
              <p className="text-sm text-gray-400 mt-1">or drag here</p>
            </label>
          </div>

          {files && files.length > 0 && (
            <div className="bg-zinc-800 border border-zinc-700 p-3 rounded">
              <p className="font-medium">Selected files:</p>
              <ul className="list-disc pl-5 mt-1">
                {Array.from(files).map((file, index) => (
                  <li key={index} className="text-sm">
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !files || files.length === 0}
            className={`w-full py-2 px-4 rounded cursor-pointer ${uploading || !files || files.length === 0
              ? "bg-gray-300 cursor-block"
              : "bg-blue-500 hover:bg-blue-600 text-white "
              }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

      </div>
      {
        filesList && filesList.length > 0 && (
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-md mt-10 p-5">
            {filesList.map((file, index) => (
              <div key={index} className="flex flex-row flex-wrap gap-3 mt-4 p-3 bg-zinc-800 text-white rounded">
                <X size={24} color="#FFFFFF" className="cursor-pointer" onClick={() => handleDelete(file)} />
                <Download size={24} color="#FFFFFF" className="cursor-pointer" onClick={() => handleDownload(file)} />
                <div className="flex flex-row gap-3 flex-wrap">
                  <p>Name: {file.name}</p>
                  <p>Size: {formatSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </main>
  );
}