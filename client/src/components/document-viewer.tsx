import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface DocumentViewerProps {
  documentUrl: string;
  documentName?: string;
  children: React.ReactNode;
}

export default function DocumentViewer({ documentUrl, documentName, children }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState<string | null>(null);

  const isImage = (url: string, type?: string) => {
    if (type && type.startsWith('image/')) return true;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isPdf = (url: string, type?: string) => {
    if (type && type === 'application/pdf') return true;
    return url.toLowerCase().includes('.pdf');
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const changeScale = (newScale: number) => {
    setScale(Math.min(Math.max(0.5, newScale), 2.0));
  };

  const handleOpen = async () => {
    setIsOpen(true);
    setIsLoading(true);
    // Try to fetch the Content-Type header
    try {
      const res = await fetch(documentUrl, { method: 'HEAD' });
      const type = res.headers.get('Content-Type');
      setContentType(type);
    } catch {
      setContentType(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPageNumber(1);
    setScale(1.0);
    setIsLoading(false);
    setContentType(null);
  };

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {documentName || "Pet Documents"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(documentUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-6 pt-0">
            {isImage(documentUrl, contentType ?? undefined) ? (
              <div className="h-full flex items-center justify-center">
                <img
                  src={documentUrl}
                  alt="Pet Document"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            ) : isPdf(documentUrl, contentType ?? undefined) ? (
              <div className="h-full flex flex-col">
                {/* PDF Controls */}
                <div className="flex items-center justify-center gap-4 mb-4 p-2 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(-1)}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm font-medium">
                    Page {pageNumber} of {numPages || '?'}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(1)}
                    disabled={pageNumber >= (numPages || 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeScale(scale - 0.1)}
                      disabled={scale <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-12 text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeScale(scale + 0.1)}
                      disabled={scale >= 2.0}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto bg-gray-100 rounded-lg p-4">
                  {isLoading && (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
                    </div>
                  )}
                  <Document
                    file={documentUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={() => setIsLoading(false)}
                    loading={
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center h-full text-red-500">
                        Failed to load PDF. Please try downloading the file instead.
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    This file type cannot be previewed. Please download to view.
                  </p>
                  <Button onClick={() => window.open(documentUrl, '_blank')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 