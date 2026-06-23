import React, { forwardRef } from "react"; 
import { QRCodeSVG } from "qrcode.react";

/**
 * Responsive font-size for the student name so long names (40+ chars)
 * shrink instead of overflowing the NAME box.
 */
const getNameFontSize = (name = "") => {
  const length = name.trim().length;
  if (length <= 18) return "clamp(1.4rem, 3.4vw, 2.6rem)";
  if (length <= 28) return "clamp(1.1rem, 2.7vw, 2.1rem)";
  if (length <= 40) return "clamp(0.9rem, 2.1vw, 1.5rem)";
  return "clamp(0.75rem, 1.6vw, 1.15rem)"; // > 40 chars
};

/**
 * Certificate
 * Renders the cleaned LERNOVA certificate background (certificate-template.png,
 * with all placeholder text removed) and overlays the real dynamic values
 * in the exact boxes where that placeholder text used to be.
 *
 * Background image is 1535x1024px — all box positions below are precise
 * percentages of that image, measured directly against the source PNG,
 * with safety margins added so nothing touches neighboring artwork
 * (the laurel seal below, the certificate edge on the right, etc).
 *
 * Layout-critical sizing (aspect ratio, box position/size) is done via
 * inline styles rather than Tailwind arbitrary-value classes, so it
 * renders correctly even if a project's Tailwind content globs don't
 * happen to pick up this file.
 */
const Certificate = forwardRef(
  (
    {
      studentName = "",
      courseName = "",
      completionDate = "",
      certificateId = "",
      verificationUrl = "",
    },
    ref
  ) => {
    const formattedDate = completionDate
      ? new Date(completionDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    return (
      <div
        ref={ref}
        id="certificate-capture"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1024px",
          margin: "0 auto",
          aspectRatio: "1535 / 1024",
          backgroundColor: "#ffffff",
          backgroundImage: "url('/certificate-template.png')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Student Name — sits where the static "NAME" placeholder used to be */}
        <div
          style={{
            position: "absolute",
            left: "31.9%",
            top: "41%",
            width: "36.5%",
            height: "8.8%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "0 4px",
          }}
        >
          <p
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textAlign: "center",
              color: "#F3D9A4",
              fontSize: getNameFontSize(studentName),
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              margin: 0,
            }}
            title={studentName}
          >
            {studentName}
          </p>
        </div>

        {/* Course completion line — sits where the generic static paragraph used to be.
            Kept short and capped at 2 lines so it never reaches the seal below. */}
        <div
          style={{
            position: "absolute",
            left: "15%",
            top: "53%",
            width: "70%",
            height: "8.5%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "0 8px",
          }}
        >
          <p
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              color: "rgba(255,255,255,0.92)",
              textAlign: "center",
              lineHeight: 1.35,
              margin: 0,
              fontSize: "clamp(0.6rem, 1.15vw, 0.8rem)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            Successfully completed{" "}
            <span style={{ fontWeight: 700, color: "#ffffff" }}>
              &ldquo;{courseName}&rdquo;
            </span>
            , demonstrating full proficiency in the required skills and concepts.
          </p>
        </div>

        {/* Date of Completion value */}
        <div
          style={{
            position: "absolute",
            left: "5%",
            top: "88%",
            width: "14.5%",
            height: "3.3%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 600,
              color: "#2D0F5A",
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              margin: 0,
              fontSize: "clamp(0.5rem, 0.9vw, 0.75rem)",
            }}
          >
            {formattedDate}
          </p>
        </div>

        {/* Certificate ID value */}
        <div
          style={{
            position: "absolute",
            left: "18.8%",
            top: "88%",
            width: "18%",
            height: "3.3%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 600,
              color: "#2D0F5A",
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              margin: 0,
              fontSize: "clamp(0.5rem, 0.9vw, 0.75rem)",
            }}
          >
            {certificateId}
          </p>
        </div>

        {/* Dynamic QR Code — aligned over the original QR box, with extra
            right-edge margin so it can never get clipped at export time. */}
        <div
          style={{
            position: "absolute",
            left: "82.5%",
            top: "78.5%",
            width: "11%",
            height: "15%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            borderRadius: "6px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          <QRCodeSVG
            value={verificationUrl || ""}
            size={120}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>
    );
  }
);

Certificate.displayName = "Certificate";

export default Certificate;


