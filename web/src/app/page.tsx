"use client";

import { CSSProperties, FormEvent, useMemo, useState } from "react";

type LinkResponse = {
  id: string;
  slug: string;
  shortUrl: string;
  originalUrl: string;
  userId: string | null;
  expiresAt: string | null;
  createdAt: string;
};

type ApiErrorResponse = {
  message?: string | string[];
};

const qrPattern = [
  "111100011100",
  "100100010001",
  "101100011101",
  "100100010101",
  "111100011100",
  "000011100001",
  "111001001111",
  "101011101001",
  "100111001011",
  "111000101111",
  "100101110001",
  "111101001111",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [result, setResult] = useState<LinkResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedExpiry = useMemo(() => {
    if (!result?.expiresAt) return "No expiry";
    return new Date(result.expiresAt).toLocaleDateString();
  }, [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCopied(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            slug: slug || undefined,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          }),
        },
      );

      const data = (await response.json()) as LinkResponse | ApiErrorResponse;

      if (!response.ok) {
        const apiError = data as ApiErrorResponse;
        const message = Array.isArray(apiError.message)
          ? apiError.message.join(", ")
          : apiError.message || "Could not create your short link.";

        throw new Error(message);
      }

      setResult(data as LinkResponse);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while creating the short link.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
  }

  function resetView() {
    setResult(null);
    setCopied(false);
    setError("");
  }

  return (
    <main style={pageShellStyle}>
      <div style={topBorderStyle} />
      <div style={pageInnerStyle}>
        <header style={headerStyle}>
          <div style={brandStyle}>LinkSnap</div>
          <nav style={navStyle}>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#signin">Sign In</a>
            <button type="button" style={navCtaStyle}>
              Get Started
            </button>
          </nav>
        </header>

        {!result ? (
          <section style={heroSectionStyle}>
            <div style={heroTextBlockStyle}>
              <h1 style={heroTitleStyle}>
                Shorten, customize,
                <br />
                and share links
                <br />
                instantly
              </h1>
            </div>

            <form onSubmit={handleSubmit} style={formCardStyle}>
              <div style={fieldGroupStyle}>
                <label htmlFor="url" style={fieldLabelStyle}>
                  Original URL
                </label>
                <input
                  id="url"
                  type="url"
                  required
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  style={inputStyle}
                />
              </div>

              <div style={splitFieldsStyle}>
                <div style={fieldGroupStyle}>
                  <label htmlFor="slug" style={fieldLabelStyle}>
                    Custom slug
                    <span style={optionalLabelStyle}>Optional</span>
                  </label>
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="my-video-link"
                    style={inputStyle}
                  />
                </div>

                <div style={fieldGroupStyle}>
                  <label htmlFor="expiresAt" style={fieldLabelStyle}>
                    Expiry date
                  </label>
                  <input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} style={generateButtonStyle}>
                {isSubmitting ? "Creating short link..." : "Create short link"}
                <span aria-hidden="true">→</span>
              </button>

              <p style={helperTextStyle}>Custom slug and expiry are optional</p>
              {error ? <p style={errorTextStyle}>{error}</p> : null}
            </form>

            <div id="features" style={featureRowStyle}>
              <Feature
                title="Detailed Analytics"
                body="Track every click with geographic and device insights."
              />
              <Feature
                title="Secure & Private"
                body="Your data is encrypted and links are protected by default."
              />
              <Feature
                title="Developer Ready"
                body="Integrate LinkSnap directly into your workflow via API."
              />
            </div>
          </section>
        ) : (
          <section style={readySectionStyle}>
            <article style={resultCardStyle}>
              <div style={readyHeaderStyle}>
                <div style={checkIconStyle}>●</div>
                <h2 style={readyTitleStyle}>Your short link is ready</h2>
              </div>

              <div style={resultMainGridStyle}>
                <div style={resultLeftStyle}>
                  <div style={shortLinkPanelStyle}>
                    <p style={panelEyebrowStyle}>Short Link</p>
                    <a
                      href={result.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={shortLinkStyle}
                    >
                      {result.shortUrl.replace(/^https?:\/\//, "")}
                    </a>
                  </div>

                  <div style={detailGridStyle}>
                    <div>
                      <p style={panelEyebrowStyle}>Original Destination</p>
                      <p style={detailValueWideStyle}>{result.originalUrl}</p>
                    </div>
                    <div>
                      <p style={panelEyebrowStyle}>Custom Slug</p>
                      <p style={detailValueStyle}>{result.slug}</p>
                    </div>
                    <div>
                      <p style={panelEyebrowStyle}>Expiry Date</p>
                      <p style={detailValueStyle}>{formattedExpiry}</p>
                    </div>
                  </div>

                  <div style={actionRowStyle}>
                    <button type="button" onClick={handleCopy} style={copyButtonStyle}>
                      {copied ? "Copied" : "Copy link"}
                    </button>
                    <a
                      href={result.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={openButtonStyle}
                    >
                      Open link
                    </a>
                  </div>
                </div>

                <aside style={qrPanelStyle}>
                  <div style={qrBoxStyle}>
                    <div style={qrGridStyle}>
                      {qrPattern.flatMap((row, rowIndex) =>
                        row.split("").map((cell, columnIndex) => (
                          <span
                            key={`${rowIndex}-${columnIndex}`}
                            style={{
                              width: 8,
                              height: 8,
                              background: cell === "1" ? "#242424" : "transparent",
                              borderRadius: 1,
                            }}
                          />
                        )),
                      )}
                    </div>
                  </div>
                  <p style={qrTextStyle}>
                    Download QR code for print or social media
                  </p>
                  <button type="button" style={downloadLinkStyle}>
                    Download PNG
                  </button>
                </aside>
              </div>

              <div style={resultFooterStyle}>
                <span>Link is active and tracking analytics.</span>
                <button type="button" onClick={resetView} style={dashboardLinkStyle}>
                  Create another link →
                </button>
              </div>
            </article>

            <div style={toastStyle}>
              <div style={toastDotStyle}>●</div>
              <span>Link successfully created!</span>
            </div>
          </section>
        )}

        <footer style={footerStyle}>
          <div>
            <div style={footerBrandStyle}>LinkSnap</div>
            <p style={footerNoteStyle}>© 2024 LinkSnap. Curating the web.</p>
          </div>
          <div style={footerLinksStyle}>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div style={featureStyle}>
      <div style={featureIconStyle}>✦</div>
      <h3 style={featureTitleStyle}>{title}</h3>
      <p style={featureBodyStyle}>{body}</p>
    </div>
  );
}

const pageShellStyle: CSSProperties = {
  width: "100%",
  minHeight: "100vh",
  position: "relative",
};

const topBorderStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 3,
  background: "#6e63ff",
  zIndex: 20,
};

const pageInnerStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "18px 20px 28px",
  display: "flex",
  flexDirection: "column",
};

const headerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1280,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 13,
  color: "var(--ink-700)",
};

const brandStyle: CSSProperties = {
  fontSize: 30,
  fontWeight: 700,
  letterSpacing: "-0.06em",
  color: "#222",
};

const navStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 28,
};

const navCtaStyle: CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "12px 22px",
  background: "linear-gradient(90deg, #c84916 0%, #ff8f5a 100%)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const heroSectionStyle: CSSProperties = {
  flex: 1,
  width: "100%",
  maxWidth: 1280,
  margin: "0 auto",
  paddingTop: 58,
  display: "grid",
  justifyItems: "center",
  alignContent: "start",
  gap: 28,
};

const heroTextBlockStyle: CSSProperties = {
  width: "100%",
  maxWidth: 360,
};

const heroTitleStyle: CSSProperties = {
  fontSize: "clamp(3rem, 6vw, 5rem)",
  lineHeight: 0.9,
  letterSpacing: "-0.08em",
  color: "#222",
  textAlign: "left",
};

const formCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 520,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(66, 51, 82, 0.08)",
  borderRadius: 18,
  boxShadow: "0 22px 50px rgba(143, 98, 52, 0.12)",
  padding: "24px 22px 18px",
  display: "grid",
  gap: 14,
};

const fieldGroupStyle: CSSProperties = {
  display: "grid",
  gap: 7,
};

const fieldLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 12,
  fontWeight: 700,
  color: "#6e6677",
};

const optionalLabelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#b4a9b9",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 46,
  border: "1px solid #efe8e1",
  borderRadius: 10,
  background: "#fff",
  padding: "0 14px",
  fontSize: 14,
  color: "#32273a",
  outline: "none",
};

const splitFieldsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const generateButtonStyle: CSSProperties = {
  marginTop: 6,
  height: 46,
  border: 0,
  borderRadius: 999,
  background: "linear-gradient(90deg, #bf3f0d 0%, #ff8a58 100%)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  boxShadow: "0 10px 24px rgba(201, 73, 33, 0.25)",
};

const helperTextStyle: CSSProperties = {
  textAlign: "center",
  fontSize: 12,
  color: "#b4a9b9",
  fontStyle: "italic",
};

const errorTextStyle: CSSProperties = {
  fontSize: 13,
  color: "#c94921",
  textAlign: "center",
};

const featureRowStyle: CSSProperties = {
  width: "100%",
  maxWidth: 680,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 26,
  marginTop: 8,
};

const featureStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  justifyItems: "start",
  color: "#564b61",
};

const featureIconStyle: CSSProperties = {
  color: "#c84916",
  fontSize: 18,
};

const featureTitleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#2a2530",
  letterSpacing: "-0.03em",
};

const featureBodyStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
};

const readySectionStyle: CSSProperties = {
  flex: 1,
  width: "100%",
  maxWidth: 1280,
  margin: "0 auto",
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  gap: 34,
  paddingTop: 40,
};

const resultCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 980,
  background: "rgba(255,255,255,0.92)",
  borderRadius: 18,
  border: "1px solid rgba(66, 51, 82, 0.08)",
  boxShadow: "0 28px 60px rgba(143, 98, 52, 0.12)",
  padding: "24px 20px 0",
};

const readyHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 24,
};

const checkIconStyle: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "#def7ea",
  color: "#14a463",
  display: "grid",
  placeItems: "center",
  fontSize: 10,
};

const readyTitleStyle: CSSProperties = {
  fontSize: 21,
  fontWeight: 700,
  letterSpacing: "-0.04em",
  color: "#2a2530",
};

const resultMainGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 170px",
  gap: 16,
};

const resultLeftStyle: CSSProperties = {
  display: "grid",
  gap: 16,
};

const shortLinkPanelStyle: CSSProperties = {
  padding: "16px 18px",
  borderRadius: 12,
  background: "#f4f1ec",
};

const panelEyebrowStyle: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#a8a0aa",
  fontWeight: 700,
  marginBottom: 7,
};

const shortLinkStyle: CSSProperties = {
  fontSize: 18,
  color: "#d24e1d",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  wordBreak: "break-all",
};

const detailGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) repeat(2, minmax(0, 0.6fr))",
  gap: 14,
};

const detailValueWideStyle: CSSProperties = {
  color: "#47404e",
  fontSize: 14,
  lineHeight: 1.5,
  wordBreak: "break-all",
};

const detailValueStyle: CSSProperties = {
  color: "#2f2836",
  fontSize: 14,
  fontWeight: 600,
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 4,
};

const copyButtonStyle: CSSProperties = {
  height: 42,
  padding: "0 22px",
  border: 0,
  borderRadius: 999,
  background: "linear-gradient(90deg, #bf3f0d 0%, #ff8a58 100%)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const openButtonStyle: CSSProperties = {
  height: 42,
  padding: "0 22px",
  borderRadius: 999,
  background: "#ece9e4",
  color: "#55505a",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const qrPanelStyle: CSSProperties = {
  borderRadius: 12,
  background: "#f8f6f3",
  padding: "16px 14px",
  display: "grid",
  gap: 12,
  alignContent: "start",
  justifyItems: "center",
};

const qrBoxStyle: CSSProperties = {
  width: 110,
  height: 110,
  background: "#fff",
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  border: "1px solid #efebe7",
};

const qrGridStyle: CSSProperties = {
  width: 96,
  display: "grid",
  gridTemplateColumns: "repeat(12, 8px)",
  gridAutoRows: 8,
  gap: 0,
};

const qrTextStyle: CSSProperties = {
  textAlign: "center",
  fontSize: 11,
  lineHeight: 1.4,
  color: "#8f8697",
};

const downloadLinkStyle: CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#d24e1d",
  fontWeight: 700,
  cursor: "pointer",
};

const resultFooterStyle: CSSProperties = {
  marginTop: 18,
  padding: "14px 20px",
  background: "linear-gradient(180deg, rgba(255,241,236,0.7) 0%, rgba(255,247,244,0.95) 100%)",
  borderBottomLeftRadius: 18,
  borderBottomRightRadius: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 12,
  color: "#8f8697",
};

const dashboardLinkStyle: CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#d26b48",
  fontWeight: 700,
  cursor: "pointer",
};

const toastStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 18px",
  borderRadius: 999,
  background: "#fff",
  boxShadow: "0 12px 26px rgba(109, 86, 65, 0.14)",
  color: "#4f4659",
  fontSize: 13,
  fontWeight: 600,
};

const toastDotStyle: CSSProperties = {
  color: "#c84916",
  fontSize: 10,
};

const footerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1280,
  margin: "auto auto 0",
  paddingTop: 28,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  fontSize: 13,
  color: "#72697d",
};

const footerBrandStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#32273a",
  marginBottom: 4,
};

const footerNoteStyle: CSSProperties = {
  fontSize: 12,
};

const footerLinksStyle: CSSProperties = {
  display: "flex",
  gap: 24,
};
