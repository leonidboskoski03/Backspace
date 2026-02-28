import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function UploadExcel() {
  const [file, setFile]       = useState(null);
  const [status, setStatus]   = useState(null); // { type: "success"|"error", message }
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && !selected.name.match(/\.(xlsx|xls)$/)) {
      setStatus({ type: "error", message: "Only .xlsx or .xls files are allowed" });
      setFile(null);
      return;
    }
    setFile(selected);
    setStatus(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ type: "error", message: "Please select a file first" });

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API}/api/residents/upload`, {
        method:  "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setStatus({ type: "success", message: `Upload successful! ${data.count ?? ""} residents processed.` });
      setFile(null);
      e.target.reset();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h3>Upload Residents Excel File</h3>
      <p style={{ color: "#555", fontSize: 14 }}>
        The file must contain the columns: <strong>Name, Surname, Flat Number, Payment Date</strong>
      </p>

      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />

        {file && (
          <p style={{ fontSize: 13, color: "#333" }}>
            Selected: <strong>{file.name}</strong>
          </p>
        )}

        <button type="submit" disabled={loading || !file}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {status && (
        <p style={{ marginTop: 12, color: status.type === "success" ? "green" : "red" }}>
          {status.message}
        </p>
      )}
    </div>
  );
}

