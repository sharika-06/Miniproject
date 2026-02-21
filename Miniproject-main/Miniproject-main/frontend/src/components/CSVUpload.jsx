import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export default function CSVUpload() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');

        // Simulating upload delay
        setTimeout(() => {
            // TODO: Implement actual backend upload
            setStatus('success');
        }, 1500);
    };

    return (
        <Card className="p-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 hover:bg-slate-50 transition-colors">
                <div className="p-3 bg-brand-50 rounded-full mb-4">
                    <Upload className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Upload Transaction Data</h3>
                <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
                    Select a CSV file containing transaction records to analyze for potential fraud.
                </p>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                />

                {!file ? (
                    <label
                        htmlFor="csv-upload"
                        className="cursor-pointer bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Select CSV File
                    </label>
                ) : (
                    <div className="w-full max-w-xs">
                        <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg mb-4">
                            <FileText className="h-5 w-5 text-slate-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>

                        <Button
                            onClick={handleUpload}
                            className="w-full"
                            disabled={status === 'uploading' || status === 'success'}
                        >
                            {status === 'uploading' ? 'Analyzing...' : status === 'success' ? 'Analysis Complete' : 'Upload & Analyze'}
                        </Button>

                        {status === 'success' && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>File processed successfully</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>Error uploading file</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
