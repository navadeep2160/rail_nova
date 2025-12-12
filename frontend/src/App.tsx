import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LiveControl from "@/pages/LiveControl";
import { WhatIf } from "@/pages/WhatIf";
import Analytics from "@/pages/Analytics";

import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LiveControl />} />
          <Route path="/what-if" element={<WhatIf />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/simulation" element={<WhatIf />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
