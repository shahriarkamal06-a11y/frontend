import { useState, useRef } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const extractApiErrorMessage = (error, fallback = 'Import failed') => {
  const responseData = error?.response?.data;
  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];
    if (typeof firstError === 'string') return firstError;
    if (typeof firstError?.message === 'string') return firstError.message;
    if (typeof firstError?.error === 'string') return firstError.error;
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

const BulkImportModal = ({ isOpen, onClose, onImport, categories = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [importData, setImportData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.json', '.csv'];
    
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error('Please select a JSON or CSV file');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (file) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        data = Array.isArray(parsed) ? parsed : parsed?.products;
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON format. Use an array of products or { "products": [...] }.');
      }

      if (data.length === 0) {
        throw new Error('No products found in file.');
      }

      setImportData(data);
      toast.success(`Parsed ${data.length} products from file`);
    } catch (error) {
      toast.error(`Could not parse file: ${error.message}`);
      setFile(null);
      setImportData(null);
      setResults(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (csvText) => {
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    };

    const lines = csvText
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    const headers = parseCSVLine(lines[0]).map((h) => h.replace(/"/g, '').trim());

    return lines.slice(1).map((line) => {
      const values = parseCSVLine(line).map((v) => v.replace(/^"|"$/g, '').trim());
      const product = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Convert specific fields
        if (['price', 'compareAtPrice', 'weight'].includes(header)) {
          value = value ? parseFloat(value) : null;
        } else if (['quantity', 'lowStockThreshold'].includes(header)) {
          value = value ? parseInt(value) : 0;
        } else if (['isActive', 'isDigital'].includes(header)) {
          value = value.toLowerCase() === 'true';
        } else if (header === 'tags') {
          value = value ? value.split(',').map(t => t.trim()) : [];
        } else if (header === 'images') {
          value = value ? value.split(',').map(url => url.trim()).filter(url => url) : [];
        }
        
        product[header] = value;
      });
      
      return product;
    });
  };

  const resolveCategoryIds = (items) => {
    if (!Array.isArray(items) || items.length === 0) return items;

    const bySlug = new Map();
    const byName = new Map();
    categories.forEach((cat) => {
      if (cat?.slug) bySlug.set(String(cat.slug).toLowerCase(), cat.id);
      if (cat?.name) byName.set(String(cat.name).toLowerCase(), cat.id);
    });

    return items.map((product) => {
      if (!product || typeof product !== 'object') return product;

      if (product.categoryId && typeof product.categoryId === 'string') {
        return product;
      }

      const categorySlug = product.categorySlug || product.category || '';
      const categoryName = product.categoryName || product.category || '';
      const resolvedId =
        bySlug.get(String(categorySlug).toLowerCase()) ||
        byName.get(String(categoryName).toLowerCase()) ||
        null;

      return {
        ...product,
        categoryId: resolvedId || product.categoryId || null,
      };
    });
  };

  const handleImport = async () => {
    if (!importData) return;
    
    setIsProcessing(true);
    try {
      const normalizedImportData = resolveCategoryIds(importData);
      const result = await onImport(normalizedImportData);
      setResults(result);
      
      const successCount = result?.success?.length || 0;
      const errorCount = result?.errors?.length || 0;
      
      if (successCount > 0) {
        toast.success(`Import completed: ${successCount} products imported`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} products failed to import`);
      }
      if (successCount === 0 && errorCount === 0) {
        toast('No products were processed');
      }
    } catch (error) {
      console.error('Import error:', error);
      const message = extractApiErrorMessage(error, 'Import failed');
      toast.error(message);
      setResults({
        success: [],
        errors: [{ row: 1, name: file?.name || 'Import file', error: message }]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadExample = (type) => {
    const url = `/api/products/examples/products-example.${type}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-example.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setImportData(null);
    setResults(null);
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Bulk Import Products</h2>
            <button
              onClick={() => { onClose(); reset(); }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!results ? (
            <>
              {/* Example Files */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Download Example Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => downloadExample('json')}
                    className="p-4 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center gap-3"
                  >
                    <FileText className="h-8 w-8 text-violet-600" />
                    <div className="text-left">
                      <p className="font-medium text-slate-900">JSON Example</p>
                      <p className="text-sm text-slate-500">Download sample JSON format</p>
                    </div>
                    <Download className="h-4 w-4 text-slate-400 ml-auto" />
                  </button>
                  
                  <button
                    onClick={() => downloadExample('csv')}
                    className="p-4 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center gap-3"
                  >
                    <FileText className="h-8 w-8 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-medium text-slate-900">CSV Example</p>
                      <p className="text-sm text-slate-500">Download sample CSV format</p>
                    </div>
                    <Download className="h-4 w-4 text-slate-400 ml-auto" />
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Upload Your File</h3>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-violet-400 bg-violet-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader className="h-8 w-8 text-violet-600 animate-spin" />
                      <p className="text-slate-600">Processing file...</p>
                    </div>
                  ) : file ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">
                        {importData ? `${importData.length} products ready to import` : 'Processing...'}
                      </p>
                      <button
                        onClick={reset}
                        className="text-sm text-violet-600 hover:text-violet-700"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="h-8 w-8 text-slate-400" />
                      <p className="text-slate-600">
                        Drag and drop your JSON or CSV file here, or{' '}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-violet-600 hover:text-violet-700 font-medium"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-sm text-slate-400">Supports JSON and CSV files</p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Preview */}
              {importData && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Preview</h3>
                  <div className="bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                    <div className="text-sm text-slate-600 mb-2">
                      Showing first 3 products of {importData.length} total:
                    </div>
                    {importData.slice(0, 3).map((product, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 mb-2 border border-slate-200">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">
                          Price: ${product.price} | SKU: {product.sku} | Quantity: {product.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { onClose(); reset(); }}
                  className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importData || isProcessing}
                  className="flex-1 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isProcessing ? 'Importing...' : `Import ${importData?.length || 0} Products`}
                </button>
              </div>
            </>
          ) : (
            /* Results */
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Import Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-900">Successful Imports</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{results?.success?.length || 0}</p>
                </div>
                
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                    <span className="font-medium text-rose-900">Failed Imports</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-600">{results?.errors?.length || 0}</p>
                </div>
              </div>

              {results?.errors?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-slate-900 mb-3">Errors</h4>
                  <div className="bg-rose-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p className="text-sm font-medium text-rose-900">
                          Row {error.row}: {error.name}
                        </p>
                        <p className="text-sm text-rose-600">{error.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { onClose(); reset(); }}
                  className="flex-1 px-6 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
