import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DownloadCertificateButton = ({ certificateRef, fileName = "certificate" }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!certificateRef?.current) {
      setError("Certificate is not ready yet. Please try again.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const node = certificateRef.current;

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imageData = canvas.toDataURL("image/png", 1.0);

      const pdfWidth = 297;
      const pdfHeight = (canvas.height / canvas.width) * pdfWidth;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("Failed to generate certificate PDF:", err);
      setError("Something went wrong while generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-6">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isGenerating}
        className="px-6 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-semibold shadow-md transition-colors"
      >
        {isGenerating ? "Generating PDF..." : "Download Certificate"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DownloadCertificateButton;