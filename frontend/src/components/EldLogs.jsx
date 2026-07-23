import EldLogSheet from "./EldLogSheet";

function EldLogs({ dailyLogs }) {
  if (!dailyLogs || dailyLogs.length === 0) return null;

  return (
    <div className="eld-logs-section">
      <div className="eld-logs-header">
        <h3 className="eld-logs-title">Daily Log Sheets</h3>
        <span className="eld-logs-count">{dailyLogs.length} sheet{dailyLogs.length > 1 ? "s" : ""}</span>
      </div>
      <p className="eld-logs-subtitle">
        HOS-compliant logs based on 70hr/8day rule &bull; Property-carrying driver &bull; No adverse conditions
      </p>
      <div className="eld-logs-grid">
        {dailyLogs.map((log, i) => (
          <EldLogSheet key={i} log={log} />
        ))}
      </div>
    </div>
  );
}

export default EldLogs;
