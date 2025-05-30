import Link from "next/link";
import "@/styles/style.css";

export default function HomePage() {
  return (
    <div className="mobile-display">
      {/* Login Button */}
      <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 10 }}>
        <Link href="/login">
          <button
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "1px solid white",
              padding: "0.5rem 1rem",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </Link>
      </div>

      <div className="container">
        <div className="home">
          <p id="instruction">Take a test to discover your</p>
          <h4>
            Personalized
            <br />
            Color
            <br />
            Palette
          </h4>
          <Link href="/test">
            <button id="take-test">Take Test</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
