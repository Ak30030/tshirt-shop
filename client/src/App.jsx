import {Routes, Route} from "react-router-dom";
import AuthPages from "./pages/AuthPages.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPages />} />
    </Routes>
  );
}

export default App;