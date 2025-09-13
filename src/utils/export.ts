import Papa from 'papaparse';

/**
 * Exports an array of objects to a CSV file.
 * @param data The array of objects to export.
 * @param filename The name of the file to download (e.g., "report.csv").
 * @param headers Optional array of strings to use as CSV headers. If not provided, object keys will be used.
 */
export const exportToCsv = (data: any[], filename: string, headers?: string[]) => {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const csv = Papa.unparse(data, {
    header: true, // Always include header row
    columns: headers, // Use provided headers if any
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // Feature detection for download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};