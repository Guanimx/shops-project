export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className="skeleton" style={{ width: "180px", height: "28px", marginBottom: "40px" }} />
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px", overflow: "hidden", marginBottom: "24px" }}>
          <div className="skeleton" style={{ height: "120px", borderRadius: 0 }} />
          <div style={{ padding: "32px" }}>
            <div className="skeleton" style={{ width: "96px", height: "96px", borderRadius: "50%", marginTop: "-80px", marginBottom: "20px" }} />
            <div className="skeleton" style={{ width: "240px", height: "28px", marginBottom: "12px" }} />
            <div className="skeleton" style={{ width: "160px", height: "18px" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="skeleton" style={{ height: "180px" }} />
          <div className="skeleton" style={{ height: "180px" }} />
        </div>
      </div>
    </div>
  );
}
