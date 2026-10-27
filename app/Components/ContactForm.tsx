"use client";

import { FormEvent, useState } from "react";

// The parent service tabs unmount and remount this form when switching services.
export default function ContactForm() {
  const [name, setName] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLambdaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResponse("");
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "https://ijfi4bbuu7.execute-api.eu-north-1.amazonaws.com/default/handleContactForm/handleContactForm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name.trim() }),
        },
      );

      const data: unknown = await res.json();
      if (!res.ok) {
        throw new Error("Failed to submit the form.");
      }

      const message =
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Your name was submitted successfully.";
      setResponse(message);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit the form. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="w-full max-w-lg space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      onSubmit={handleLambdaSubmit}
    >
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          AWS Lambda
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Submit your name to the contact form function.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </span>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-zinc-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:text-zinc-100"
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setResponse("");
            setError("");
          }}
          required
        />
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {response && (
        <p className="text-sm text-green-700 dark:text-green-400" role="status">
          {response}
        </p>
      )}

      <button
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
