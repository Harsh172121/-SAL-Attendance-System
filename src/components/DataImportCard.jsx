import { useId, useState } from 'react';
import { toast } from 'react-toastify';
import { adminImportService } from '../services/dataService';
import Button from './Button';
import Card from './Card';

const escapeCsvValue = (value) => {
  const text = String(value ?? '');

  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const escapeXmlValue = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const downloadTextFile = (fileName, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const buildCsvTemplate = (fields, sampleRow) => {
  const headerLine = fields.join(',');
  const sampleLine = fields.map((field) => escapeCsvValue(sampleRow[field] ?? '')).join(',');
  return `${headerLine}\n${sampleLine}\n`;
};

const buildXmlTemplate = (singular, plural, fields, sampleRow) => {
  const record = fields
    .map((field) => `    <${field}>${escapeXmlValue(sampleRow[field] ?? '')}</${field}>`)
    .join('\n');

  return `<${plural}>
  <${singular}>
${record}
  </${singular}>
</${plural}>
`;
};

const DataImportCard = ({ config, onImported }) => {
  const inputId = useId();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const allFields = [...config.requiredFields, ...config.optionalFields];
  const displayRequiredFields = config.displayRequiredFields || config.requiredFields;
  const displayOptionalFields = config.displayOptionalFields || config.optionalFields;
  const csvFields = config.csvFields || allFields;
  const csvSampleRow = config.csvSampleRow || config.sampleRow;

  const handleTemplateDownload = (format) => {
    if (format === 'csv') {
      const content = buildCsvTemplate(csvFields, csvSampleRow);
      downloadTextFile(`${config.entity}-template.csv`, content, 'text/csv;charset=utf-8');
      return;
    }

    const content = buildXmlTemplate(config.singular, config.entity, allFields, config.sampleRow);
    downloadTextFile(`${config.entity}-template.xml`, content, 'application/xml;charset=utf-8');
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please choose a CSV or XML file first.');
      return;
    }

    setIsImporting(true);

    try {
      const summary = await adminImportService.importData(config.entity, file);
      toast.success(`${summary.created} created, ${summary.updated} updated.`);

      setFile(null);
      setInputKey((value) => value + 1);

      if (onImported) {
        await onImported(summary);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-green-50">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{config.title}</h2>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>

          <p className="text-sm text-blue-800">{config.matchBy}</p>

          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-800">Required columns:</span>{' '}
              {displayRequiredFields.join(', ')}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Optional columns:</span>{' '}
              {displayOptionalFields.join(', ')}
            </p>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {config.notes.map((note) => (
              <p key={note}>• {note}</p>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => handleTemplateDownload('csv')}>
              Download CSV Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleTemplateDownload('xml')}>
              Download XML Template
            </Button>
          </div>
        </div>

        <div className="w-full max-w-md rounded-xl border border-dashed border-blue-200 bg-white p-4 shadow-sm">
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Choose CSV or XML file
          </label>

          <input
            key={inputKey}
            id={inputId}
            type="file"
            accept=".csv,.xml,text/csv,application/xml,text/xml"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-medium file:text-blue-800 hover:file:bg-blue-200"
          />

          <p className="mt-3 min-h-5 text-sm text-gray-500">
            {file ? `Selected: ${file.name}` : 'No file selected'}
          </p>

          <Button
            className="mt-4 w-full"
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : `Import ${config.entity}`}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DataImportCard;
