import { useEffect, useState } from "react";
import BASE_URL from "../Api";

/**
 * Fetches the published portfolio projects from the backend.
 *
 * Returned records are normalised to the shape the existing portfolio markup
 * already uses ({ name, image, url }) so the public design does not change.
 *
 * @param {Array} fallback  Projects to render if the API cannot be reached.
 *                          Used ONLY on a network/server failure — a successful
 *                          empty response renders an empty grid, so deleting
 *                          every project in the admin panel really empties it.
 */
export default function usePublishedProjects(fallback = []) {
  const [projects, setProjects] = useState(null); // null = not loaded / failed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/projects`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response format");

        if (!cancelled) {
          setProjects(
            data.map((p) => ({
              id: p.id,
              name: p.title,
              image: p.image,
              url: p.projectUrl || "",
              description: p.description || "",
              category: p.category || "",
            }))
          );
        }
      } catch (err) {
        // Keep the portfolio visible instead of showing an empty page
        console.error("Could not load projects:", err);
        if (!cancelled) setProjects(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    projects: projects ?? fallback,
    loading,
    usingFallback: projects === null,
  };
}
