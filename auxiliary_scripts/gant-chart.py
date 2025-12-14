import pandas as pd
import plotly.express as px

INFILE  = "issues_with_milestone_start.csv"
OUTHTML = "gantt_chart.html"

df = pd.read_csv(INFILE)

# Parse dates (UTC)
df["milestone_start_at"] = pd.to_datetime(df["milestone_start_at"], errors="coerce", utc=True)
df["milestone_due_on"]   = pd.to_datetime(df["milestone_due_on"],   errors="coerce", utc=True)

# Keep rows with milestone and due date
df = df.dropna(subset=["milestone_title", "milestone_due_on"]).copy()

# Fill missing milestone_start_at (if any)
ms_start_fill = df.groupby("milestone_title")["milestone_start_at"].transform("min")
df["milestone_start_at"] = df["milestone_start_at"].fillna(ms_start_fill)
df = df.dropna(subset=["milestone_start_at"]).copy()

# Issue numbers
df["number"] = pd.to_numeric(df["number"], errors="coerce")
df = df.dropna(subset=["number"]).copy()
df["number"] = df["number"].astype(int)

# Optional columns (for hover)
for col in ["labels", "assignees", "url", "state"]:
    if col not in df.columns:
        df[col] = ""

# Issue bars span milestone window
df["start"] = df["milestone_start_at"]
df["end"]   = df["milestone_due_on"]

# Y ids and display labels
df["y_id"]   = df.apply(lambda r: f"ISSUE::{r['milestone_title']}::#{r['number']}", axis=1)
df["y_text"] = df.apply(lambda r: f"#{r['number']} {r['title']}", axis=1)

# Milestone order (by earliest start)
milestone_order = (
    df.groupby("milestone_title")["milestone_start_at"]
      .min()
      .sort_values()
      .index
      .tolist()
)

# Per-milestone windows
ms = (
    df.groupby("milestone_title", as_index=False)
      .agg(ms_start=("milestone_start_at", "min"),
           ms_due=("milestone_due_on", "min"))
)
ms = ms.set_index("milestone_title").loc[milestone_order].reset_index()

week = pd.Timedelta(days=7)

rows = []

# Header, testing, refactoring for each milestone
for m in milestone_order:
    ms_row = ms[ms["milestone_title"] == m].iloc[0]
    ms_start = ms_row["ms_start"]
    ms_due   = ms_row["ms_due"]

    rows.append({
        "milestone_title": m,
        "start": ms_start,
        "end":   ms_start,
        "y_id":  f"HEADER::{m}",
        "y_text": "",
        "row_rank": 0,
        "state": "", "labels": "", "assignees": "", "url": ""
    })
    rows.append({
        "milestone_title": m,
        "start": ms_due,
        "end":   ms_due + week,
        "y_id":  f"TEST::{m}",
        "y_text": "User testing",
        "row_rank": 1,
        "state": "", "labels": "", "assignees": "", "url": ""
    })
    rows.append({
        "milestone_title": m,
        "start": ms_due + week,
        "end":   ms_due + 2*week,
        "y_id":  f"REFACTOR::{m}",
        "y_text": "Refactoring",
        "row_rank": 2,
        "state": "", "labels": "", "assignees": "", "url": ""
    })

# Issues after extras, sorted ascending by number
issues = df.copy()
issues["row_rank"] = 3 + issues["number"]

plot_df = pd.concat(
    [pd.DataFrame(rows),
     issues[["milestone_title","start","end","y_id","y_text","row_rank","state","labels","assignees","url"]]],
    ignore_index=True
)

# Add "Report writting" milestone block + header
REPORTS_GROUP = "Report writting"
if REPORTS_GROUP not in milestone_order:
    milestone_order = milestone_order + [REPORTS_GROUP]

report_start = pd.Timestamp("2025-12-08T00:00:00Z")
report_end   = pd.Timestamp("2026-03-23T00:00:00Z")
report_mid   = report_start + (report_end - report_start) / 2

report_rows = [
    # Header row (anchor for annotation)
    {
        "milestone_title": REPORTS_GROUP,
        "start": report_start,
        "end":   report_start,
        "y_id":  f"HEADER::{REPORTS_GROUP}",
        "y_text": "",
        "row_rank": 0,
        "state": "", "labels": "", "assignees": "", "url": ""
    },
    # Tasks
    {
        "milestone_title": REPORTS_GROUP,
        "start": pd.Timestamp("2025-12-08T00:00:00Z"),
        "end":   pd.Timestamp("2025-12-18T00:00:00Z"),
        "y_id":  "REPORT::preliminary",
        "y_text": "Writing preliminary report",
        "row_rank": 1,
        "state": "", "labels": "", "assignees": "", "url": ""
    },
    {
        "milestone_title": REPORTS_GROUP,
        "start": pd.Timestamp("2026-02-03T00:00:00Z"),
        "end":   pd.Timestamp("2026-02-09T00:00:00Z"),
        "y_id":  "REPORT::draft",
        "y_text": "Writing draft report",
        "row_rank": 2,
        "state": "", "labels": "", "assignees": "", "url": ""
    },
    {
        "milestone_title": REPORTS_GROUP,
        "start": pd.Timestamp("2026-03-16T00:00:00Z"),
        "end":   pd.Timestamp("2026-03-23T00:00:00Z"),
        "y_id":  "REPORT::final",
        "y_text": "Writing final report",
        "row_rank": 3,
        "state": "", "labels": "", "assignees": "", "url": ""
    },
]

plot_df = pd.concat([plot_df, pd.DataFrame(report_rows)], ignore_index=True)

# Normalize datetimes (prevents tz-mix errors)
plot_df["start"] = pd.to_datetime(plot_df["start"], utc=True, errors="coerce")
plot_df["end"]   = pd.to_datetime(plot_df["end"],   utc=True, errors="coerce")
plot_df = plot_df.dropna(subset=["start","end"])

# Sort by milestone then row_rank
plot_df = plot_df.sort_values(
    ["milestone_title","row_rank"],
    key=lambda col: pd.Categorical(col, categories=milestone_order, ordered=True)
    if col.name == "milestone_title" else col,
    ascending=[True, True]
)

# Force y ordering
y_order = plot_df["y_id"].tolist()

fig = px.timeline(
    plot_df,
    x_start="start",
    x_end="end",
    y="y_id",
    color="milestone_title",
    category_orders={"y_id": y_order, "milestone_title": milestone_order},
    hover_data=["milestone_title","y_text","start","end","state","labels","assignees","url"]
)

# Friendly y tick labels
ytext_map = dict(zip(plot_df["y_id"], plot_df["y_text"]))
fig.update_yaxes(
    tickmode="array",
    tickvals=y_order,
    ticktext=[ytext_map.get(y, "") for y in y_order],
)

# Milestone names inside the plot (headers for normal milestones)
ms_mid = ms.copy()
ms_mid["mid"] = ms_mid["ms_start"] + (ms_mid["ms_due"] - ms_mid["ms_start"]) / 2
mid_lookup = ms_mid.set_index("milestone_title")["mid"].to_dict()

for m in milestone_order:
    if m == REPORTS_GROUP:
        continue
    fig.add_annotation(
        x=mid_lookup[m],
        y=f"HEADER::{m}",
        text=f"|---- {m} ----|",
        showarrow=False,
        xanchor="center",
        yanchor="middle",
        bgcolor="rgba(255,255,255,0.8)",
        bordercolor="rgba(0,0,0,0.2)",
        borderwidth=1,
    )

# Header for "Report writting" inside the plot
fig.add_annotation(
    x=report_mid,
    y=f"HEADER::{REPORTS_GROUP}",
    text=f"|---- {REPORTS_GROUP} ----|",
    showarrow=False,
    xanchor="center",
    yanchor="middle",
    bgcolor="rgba(255,255,255,0.8)",
    bordercolor="rgba(0,0,0,0.2)",
    borderwidth=1,
)

fig.update_layout(
    title="Gantt Chart",
    height=max(900, 22 * len(plot_df)),
    legend_title_text="Milestones Names",
)

fig.write_html(OUTHTML)
print(f"Wrote {OUTHTML}")
