import { Download, FileText, HelpCircle, Upload, X } from 'lucide-react';

const ImportExportHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900">Import/Export Help</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Upload className="h-6 w-6 text-violet-600" />
                  <h4 className="font-medium text-slate-900">Bulk Import</h4>
                </div>
                <p className="mb-3 text-sm text-slate-600">
                  Import multiple products at once using JSON or CSV files.
                </p>
                <ul className="space-y-1 text-sm text-slate-500">
                  <li>Supports JSON and CSV formats</li>
                  <li>Download example files</li>
                  <li>Validate before importing</li>
                  <li>Error reporting included</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Download className="h-6 w-6 text-emerald-600" />
                  <h4 className="font-medium text-slate-900">Export Products</h4>
                </div>
                <p className="mb-3 text-sm text-slate-600">
                  Export your current products to JSON or CSV format.
                </p>
                <ul className="space-y-1 text-sm text-slate-500">
                  <li>Export all or selected products</li>
                  <li>Choose JSON or CSV format</li>
                  <li>Include or exclude specific fields</li>
                  <li>Useful for backups</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Supported File Formats</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <FileText className="h-4 w-4 text-violet-600" />
                  JSON Format
                </h4>
                <p className="mb-2 text-sm text-slate-600">
                  JSON files should contain an array of product objects with this shape:
                </p>
                <pre className="overflow-x-auto rounded border bg-white p-3 text-xs">{`[
  {
    "name": "Product Name",
    "price": 29.99,
    "description": "Product description",
    "sku": "PROD-001",
    "categoryId": 1,
    "quantity": 100,
    "isActive": true,
    "tags": ["tag1", "tag2"]
  }
]`}</pre>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  CSV Format
                </h4>
                <p className="mb-2 text-sm text-slate-600">
                  CSV files should start with a header row:
                </p>
                <pre className="overflow-x-auto rounded border bg-white p-3 text-xs">{`name,price,description,sku,categoryId,quantity,isActive,tags
"Product Name",29.99,"Product description","PROD-001",1,100,true,"tag1,tag2"`}</pre>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Field Reference</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-medium text-rose-600">Required Fields</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-700">name</span>
                    <span className="text-slate-500">string</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-700">price</span>
                    <span className="text-slate-500">number</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-medium text-slate-600">Optional Fields</h4>
                <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
                  <li className="flex justify-between"><span className="text-slate-700">slug</span><span className="text-slate-500">string</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">description</span><span className="text-slate-500">string</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">shortDescription</span><span className="text-slate-500">string</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">compareAtPrice</span><span className="text-slate-500">number</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">sku</span><span className="text-slate-500">string</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">categoryId</span><span className="text-slate-500">number</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">quantity</span><span className="text-slate-500">number</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">weight</span><span className="text-slate-500">number</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">isActive</span><span className="text-slate-500">boolean</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">section</span><span className="text-slate-500">string</span></li>
                  <li className="flex justify-between"><span className="text-slate-700">tags</span><span className="text-slate-500">array</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900">
              <HelpCircle className="h-4 w-4" />
              Pro Tips
            </h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>Download and review example files before creating your own imports.</li>
              <li>Test with a small batch first to verify the format.</li>
              <li>Make sure category IDs already exist in the store.</li>
              <li>Use unique SKUs to avoid collisions.</li>
              <li>Keep file sizes under 10 MB for better upload reliability.</li>
              <li>Take a backup before large imports.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ImportExportHelp;
