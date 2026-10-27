"use client";

import { useState } from "react";
import ContactForm from "./Components/ContactForm";
import UploadFile from "./Components/UploadFile";

export default function Home() {
  const [activeService, setActiveService] = useState<"bucket" | "lambda">(
    "bucket",
  );

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div
          className="flex border-b border-zinc-200 dark:border-zinc-800"
          role="tablist"
          aria-label="AWS services"
        >
          <button
            id="bucket-tab"
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeService === "bucket"
                ? "border-b-2 border-blue-600 text-blue-700 dark:text-blue-400"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
            type="button"
            role="tab"
            aria-selected={activeService === "bucket"}
            aria-controls="bucket-panel"
            onClick={() => setActiveService("bucket")}
          >
            AWS Bucket
          </button>
          <button
            id="lambda-tab"
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeService === "lambda"
                ? "border-b-2 border-blue-600 text-blue-700 dark:text-blue-400"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
            type="button"
            role="tab"
            aria-selected={activeService === "lambda"}
            aria-controls="lambda-panel"
            onClick={() => setActiveService("lambda")}
          >
            AWS Lambda
          </button>
        </div>

        {activeService === "bucket" ? (
          <div
            id="bucket-panel"
            className="p-6"
            role="tabpanel"
            aria-labelledby="bucket-tab"
          >
            <UploadFile />
          </div>
        ) : (
          <div
            id="lambda-panel"
            className="p-6"
            role="tabpanel"
            aria-labelledby="lambda-tab"
          >
              <ContactForm />
            </div>
          )}
      </section>
    </main>
  );
}
