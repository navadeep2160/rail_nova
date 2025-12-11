import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LiveControl from "@/pages/LiveControl";
import { WhatIf } from "@/pages/WhatIf";
import Analytics from "@/pages/Analytics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LiveControl />} />
        <Route path="/what-if" element={<WhatIf />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/simulation" element={<div className="p-10 text-2xl">Simulation Mode (Legacy)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
