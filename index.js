import "./tailwind.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./tailwind.css"; // Make sure Tailwind is imported
import App from "./App"; // Import your old dashboard code

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
