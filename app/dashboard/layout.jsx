// app/layout.js
export default function DashboardLayout({ children, analytics, team }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Renders app/page.js */}
      <div className="col-span-1">{children}</div>
      
      {/* Renders app/@analytics/page.js */}
      <div className="col-span-1">{analytics}</div>
      
      {/* Renders app/@team/page.js */}
      <div className="col-span-1">{team}</div>
    </div>
  );
}
