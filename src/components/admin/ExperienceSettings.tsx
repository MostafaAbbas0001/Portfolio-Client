import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfessionalExperience } from "@/api/siteDataApi";
import { professionalExperienceQuery } from "@/queries/siteDataQueries";

export function ExperienceSettings({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const query = useQuery(professionalExperienceQuery());
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.data) setStartDate(query.data.startDate);
  }, [query.data]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const result = await updateProfessionalExperience(token, startDate);
      queryClient.setQueryData(professionalExperienceQuery().queryKey, result);
      setMessage("Experience start date saved for both languages.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the start date.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="grid max-w-xl gap-5 p-4 md:p-6">
      <div>
        <h2 className="text-lg font-semibold">Professional experience</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The homepage calculates years of experience from this date. It applies to both languages.
          Edit the wording under Globals → interface, and job history under Pages → Experience.
        </p>
      </div>
      {query.isPending && <p role="status">Loading start date...</p>}
      {query.isError && <p role="alert">Could not load the current date. You can set it below.</p>}
      <label className="grid gap-2 text-sm font-medium">
        Professional start date
        <input
          type="date"
          required
          max={new Date().toLocaleDateString("en-CA")}
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="min-h-11 border border-border bg-background px-3 focus:border-primary"
        />
      </label>
      <button
        type="submit"
        disabled={saving || !startDate}
        className="min-h-11 bg-foreground px-5 text-sm font-semibold text-background disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
      {message && (
        <p role="status" className="text-sm text-primary">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
