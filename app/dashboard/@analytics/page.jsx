import Link from "next/link";
import React from "react";

function AnalyticsPage() {
  return (
    <div className="h-screen">
      AnalyticsPage
      <Link href="/dashboard/settings">go to the settings page</Link>
    </div>
  );
}

export default AnalyticsPage;
