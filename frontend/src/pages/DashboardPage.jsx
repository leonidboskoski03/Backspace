import UploadExcel from "../components/UploadExcel";

export default function DashboardPage() {
  const supporter = JSON.parse(localStorage.getItem("supporter") || "{}");

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h2>Welcome, {supporter.firstName || "Owner"} 👋</h2>
      <hr />
      <UploadExcel />
    </div>
  );
}

