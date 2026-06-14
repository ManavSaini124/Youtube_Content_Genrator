import React from "react"
import WelcomeBanner from "./_components/WelcomeBanner"
import FeatureList from "./_components/FeatureList"

function Dashboard() {
  return (
    <div className="dashboard-page">
      <WelcomeBanner />
      <FeatureList />
    </div>
  )
}

export default Dashboard
