"use client";

import { FormEvent, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Choose a file before uploading.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The file must be 10 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "The file could not be uploaded.";

        throw new Error(errorMessage);
      }

      setMessage(`${file.name} uploaded successfully.`);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The file could not be uploaded. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      className="w-full max-w-lg space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      onSubmit={handleSubmit}
    >
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Upload a file
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Select a file up to 10 MB to upload it to S3.
        </p>
      </div>

      <label className="block">
        <span className="sr-only">Choose a file</span>
        <input
          className="block w-full cursor-pointer rounded-lg border border-zinc-300 text-sm text-zinc-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-zinc-100 file:px-4 file:py-3 file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
          type="file"
          disabled={isUploading}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError("");
            setMessage("");
          }}
          aria-describedby="upload-file-size"
        />
      </label>

      <p id="upload-file-size" className="text-sm text-zinc-500 dark:text-zinc-400">
        Maximum file size: 10 MB.
      </p>

      {file && (
        <p className="break-all text-sm text-zinc-700 dark:text-zinc-300">
          Selected: {file.name}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="text-sm text-green-700 dark:text-green-400" role="status">
          {message}
        </p>
      )}

      <button
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload file"}
      </button>
    </form>
  );
}
