import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LiveControl from "@/pages/LiveControl";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LiveControl />} />
        <Route path="/simulation" element={<div className="p-10 text-2xl">Simulation Mode (Coming Soon)</div>} />
        <Route path="/analytics" element={<div className="p-10 text-2xl">Analytics Dashboard (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
