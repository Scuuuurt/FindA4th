import { useEffect, useMemo, useState } from "react";
import { verifiedCourses } from "../data/profiles";

function emitChange(onChange, name, value) {
  onChange({ target: { name, value } });
}

export default function CourseSearchField({
  label,
  name = "homeCourse",
  value,
  onChange,
  placeholder = "Search for a golf course",
  helperText = "Start typing to search demo course inventory."
}) {
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  const results = useMemo(() => {
    const normalized = (query ?? "").trim().toLowerCase();
    if (!normalized) return verifiedCourses.slice(0, 6);

    const starts = verifiedCourses.filter((course) => course.toLowerCase().startsWith(normalized));
    const contains = verifiedCourses.filter(
      (course) => !starts.includes(course) && course.toLowerCase().includes(normalized)
    );
    return [...starts, ...contains].slice(0, 6);
  }, [query]);

  function handleInput(event) {
    const nextValue = event.target.value;
    setQuery(nextValue);
    setOpen(true);
    emitChange(onChange, name, nextValue);
  }

  function applyCourse(course) {
    setQuery(course);
    setOpen(false);
    emitChange(onChange, name, course);
  }

  return (
    <label className="course-search-field">
      {label}
      <div className="course-search-shell">
        <input
          name={name}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        />
        {open ? (
          <div className="course-search-menu" role="listbox" aria-label={`${label} suggestions`}>
            {results.map((course) => (
              <button
                key={course}
                className={`course-search-option ${course === value ? "active" : ""}`.trim()}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyCourse(course)}
              >
                <strong>{course}</strong>
                <span>Verified demo course</span>
              </button>
            ))}
            {query.trim() && !verifiedCourses.includes(query.trim()) ? (
              <button
                className="course-search-option custom"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyCourse(query.trim())}
              >
                <strong>Use “{query.trim()}”</strong>
                <span>Custom course entry</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <span className="course-search-helper">{helperText}</span>
    </label>
  );
}
