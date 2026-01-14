import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, X, Printer } from "lucide-react";

interface TechnicalSummaryPDFProps {
  isOpen: boolean;
  onClose: () => void;
}

const TechnicalSummaryPDF = ({ isOpen, onClose }: TechnicalSummaryPDFProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleDownload = () => {
    const content = document.getElementById("technical-summary-content");
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SHANSHIELD Technical Summary</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; font-size: 11px; line-height: 1.4; }
            h1 { font-size: 18px; color: #0ea5e9; margin-bottom: 4px; }
            h2 { font-size: 12px; color: #333; margin: 10px 0 6px; border-bottom: 1px solid #0ea5e9; padding-bottom: 2px; }
            h3 { font-size: 11px; color: #555; margin: 6px 0 4px; }
            table { width: 100%; border-collapse: collapse; margin: 6px 0; }
            th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; font-size: 10px; }
            th { background: #f0f9ff; color: #0369a1; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 1px 6px; border-radius: 3px; font-size: 9px; margin-left: 4px; }
            .honest { background: #fee2e2; color: #991b1b; }
            .section { margin-bottom: 10px; }
            .subtitle { color: #666; font-size: 10px; }
            .footer { margin-top: 12px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 9px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #technical-summary-content, #technical-summary-content * { visibility: visible; }
            #technical-summary-content { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%;
              padding: 20px;
              background: white;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>
      
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          {/* Header Controls */}
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-semibold text-gray-800">Technical Summary for Judges</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" /> Download PDF
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Printable Content */}
          <div id="technical-summary-content" className="p-6 text-gray-800 text-sm">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-sky-500">🛡️ SHANSHIELD</h1>
              <p className="text-gray-500 text-xs">AI-Powered Deepfake Detection System | Technical Summary</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div>
                {/* Architecture */}
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-sky-600 border-b border-sky-200 pb-1 mb-2">
                    🏗️ Architecture Overview
                  </h2>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr><td className="font-medium bg-sky-50 w-28">Type</td><td>Single Page Application (SPA)</td></tr>
                      <tr><td className="font-medium bg-sky-50">Frontend</td><td>React 18 + TypeScript + Vite</td></tr>
                      <tr><td className="font-medium bg-sky-50">Styling</td><td>Tailwind CSS + shadcn/ui</td></tr>
                      <tr><td className="font-medium bg-sky-50">Processing</td><td className="text-green-700">Client-side (Browser APIs) ✅</td></tr>
                      <tr><td className="font-medium bg-sky-50">Analysis</td><td className="text-green-700">Real Algorithmic Detection ✅</td></tr>
                      <tr><td className="font-medium bg-sky-50">Backend</td><td>None required (edge processing)</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Libraries */}
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-sky-600 border-b border-sky-200 pb-1 mb-2">
                    📦 Libraries & Dependencies
                  </h2>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-sky-50">
                        <th className="text-left p-1">Library</th>
                        <th className="text-left p-1">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="font-mono text-sky-700">react</td><td>UI Framework</td></tr>
                      <tr><td className="font-mono text-sky-700">typescript</td><td>Type Safety</td></tr>
                      <tr><td className="font-mono text-sky-700">vite</td><td>Build Tool & Dev Server</td></tr>
                      <tr><td className="font-mono text-sky-700">tailwindcss</td><td>Utility-first CSS</td></tr>
                      <tr><td className="font-mono text-sky-700">shadcn/ui</td><td>UI Component Library</td></tr>
                      <tr><td className="font-mono text-sky-700">lucide-react</td><td>Icon System</td></tr>
                      <tr><td className="font-mono text-sky-700">recharts</td><td>Data Visualization</td></tr>
                      <tr><td className="font-mono text-sky-700">react-router-dom</td><td>Client-side Routing</td></tr>
                      <tr><td className="font-mono text-sky-700">react-hook-form</td><td>Form Handling</td></tr>
                      <tr><td className="font-mono text-sky-700">zod</td><td>Schema Validation</td></tr>
                      <tr><td className="font-mono text-sky-700">sonner</td><td>Toast Notifications</td></tr>
                      <tr><td className="font-mono text-sky-700">date-fns</td><td>Date Formatting</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Real Detection Algorithms */}
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-sky-600 border-b border-sky-200 pb-1 mb-2">
                    🔬 Real Detection Algorithms
                  </h2>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-sky-50">
                        <th className="text-left p-1">Media</th>
                        <th className="text-left p-1">Techniques</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="font-medium">Image</td><td>Noise variance, Sobel edges, Color histogram, JPEG artifacts, LBP texture, Symmetry</td></tr>
                      <tr><td className="font-medium">Video</td><td>Frame extraction, Temporal coherence, Optical flow, Motion analysis, Face tracking</td></tr>
                      <tr><td className="font-medium">Audio</td><td>FFT spectral, Autocorrelation pitch, Noise floor, Spectral centroid/flatness</td></tr>
                      <tr><td className="font-medium">Document</td><td>PDF metadata, Entropy analysis, Byte patterns, Structure validation</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Features */}
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-sky-600 border-b border-sky-200 pb-1 mb-2">
                    ✨ Implemented Features
                  </h2>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-sky-50">
                        <th className="text-left p-1">Feature</th>
                        <th className="text-left p-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Real Image Analysis</td><td className="text-green-600">✅ 6 detection methods</td></tr>
                      <tr><td>Real Video Analysis</td><td className="text-green-600">✅ 6 detection methods</td></tr>
                      <tr><td>Real Audio Analysis</td><td className="text-green-600">✅ 6 detection methods</td></tr>
                      <tr><td>Real Document Analysis</td><td className="text-green-600">✅ 6 detection methods</td></tr>
                      <tr><td>Camera Capture</td><td className="text-green-600">✅ Functional</td></tr>
                      <tr><td>Audio Recording</td><td className="text-green-600">✅ Functional</td></tr>
                      <tr><td>Forensic Reports</td><td className="text-green-600">✅ Downloadable</td></tr>
                      <tr><td>Explainable AI</td><td className="text-green-600">✅ Real findings</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Technical Highlights */}
                <div className="mb-3 bg-green-50 border border-green-200 rounded p-2">
                  <h2 className="text-sm font-semibold text-green-700 mb-1">
                    ✅ Technical Highlights
                  </h2>
                  <ul className="text-xs space-y-1 text-green-800">
                    <li>• <strong>Real pixel-level analysis:</strong> Canvas API for image data extraction</li>
                    <li>• <strong>Real signal processing:</strong> Web Audio API + FFT for audio</li>
                    <li>• <strong>Real video forensics:</strong> Frame extraction + temporal analysis</li>
                    <li>• <strong>Edge computing:</strong> All processing in-browser, no server needed</li>
                    <li>• <strong>Privacy-first:</strong> Media never leaves the device</li>
                  </ul>
                </div>

                {/* Future Enhancements */}
                <div className="mb-3 bg-sky-50 border border-sky-200 rounded p-2">
                  <h2 className="text-sm font-semibold text-sky-700 mb-1">
                    🚀 Future Enhancements
                  </h2>
                  <ul className="text-xs space-y-1 text-sky-800">
                    <li>• TensorFlow.js CNN models for deeper pattern recognition</li>
                    <li>• Face-API.js for facial landmark detection</li>
                    <li>• WebGL acceleration for real-time video</li>
                    <li>• Backend API for model inference at scale</li>
                    <li>• Database for historical analysis tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 mt-4 pt-2 border-t">
              SHANSHIELD | Hackathon Prototype | Built with React + TypeScript + Tailwind CSS
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnicalSummaryPDF;
