import { useEffect } from "react";
import { oAuthCallback } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      try {
        const response = await oAuthCallback(code);
        authLogin(response.token, response.user);

        // Role-based navigation
        if (!response.user.role) {
          navigate("/select-role", { replace: true });
        } else if (response.user.role === "provider") {
          navigate("/dashboard/provider", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.log(err);
        navigate("/login", { replace: true });
      }
    })();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <style>
        {`
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        `}
      </style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin fill-black"
        style={{
          animation: "spin 1s linear infinite",
          fill: "#000",
          margin: "auto",
        }}
        width="32"
        height="32"
        viewBox="0 0 256 256"
      >
        <path d="M236,128a108,108,0,0,1-216,0c0-42.52,24.73-81.34,63-98.9A12,12,0,1,1,93,50.91C63.24,64.57,44,94.83,44,128a84,84,0,0,0,168,0c0-33.17-19.24-63.43-49-77.09A12,12,0,1,1,173,29.1C211.27,46.66,236,85.48,236,128Z"></path>
      </svg>
    </div>
  );
}
