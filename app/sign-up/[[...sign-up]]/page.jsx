import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign up — VoiceAIReceptionists",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5EFE4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#C85A3C",
            marginBottom: 12,
          }}
        >
          VoiceAIReceptionists
        </div>
        <h1
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 36,
            fontWeight: 600,
            color: "#1B1E28",
            margin: "0 0 28px",
            letterSpacing: "-0.015em",
          }}
        >
          Create your account.
        </h1>
        <SignUp
          appearance={{
            elements: {
              rootBox: { width: "100%" },
              card: {
                boxShadow: "0 10px 40px -10px rgba(27,30,40,0.12)",
                border: "1px solid #CFC6B5",
                background: "#FFFFFF",
              },
              formButtonPrimary: {
                background: "#A6472E",
                fontWeight: 700,
                "&:hover": { background: "#8A3A27" },
              },
              headerTitle: { fontFamily: "Fraunces, Georgia, serif" },
            },
          }}
        />
      </div>
    </main>
  );
}
