import { ImpactExportCSVSchema } from "@/models/schemas";
import useAppStore from "@/models/store";
import { useCallback } from "react";
import { FileError, FileRejection, useDropzone } from "react-dropzone";
import { z } from "zod";

function customValidator(file: File): FileError | FileError[] | null {
  if (file.type !== "text/csv") {
    return { code: "file-invalid-type", message: "File must be a CSV" };
  }

  return null;
}

export default function ImpactExportUploader() {
  const {
    setValidImpactExportCSVData,
    setImpactExportCSVValidationErrors,
    impactExportCSVValidationErrors,
    validImpactExportCSVData,
  } = useAppStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImpactExportCSVValidationErrors([]);
    setValidImpactExportCSVData(null);

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const text = event.target?.result;

        if (typeof text !== "string") {
          setImpactExportCSVValidationErrors(["Failed to read file"]);
          return;
        }

        try {
          const rows = text
            .split("\n")
            .filter((row) => row.length > 0)
            .map((row) => row.split(","));
          const headers = rows[0].map((header) => header.trim());
          const data = rows.slice(1).map((row) => {
            return headers.reduce<Record<string, string>>(
              (obj, header, index) => {
                obj[header] = row[index]?.trim() || "";
                return obj;
              },
              {},
            );
          });

          const validatedData = ImpactExportCSVSchema.parse(data);
          setValidImpactExportCSVData(validatedData);
          console.log("Validated data:", validatedData);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errors = error.errors.map(
              (err) => `${err.path.join(".")}: ${err.message}`,
            );
            setImpactExportCSVValidationErrors(errors);
          } else {
            setImpactExportCSVValidationErrors(["An unknown error occurred"]);
          }
        }
      };
      reader.onerror = () =>
        setImpactExportCSVValidationErrors(["Failed to read file"]);
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      validator: customValidator,
      accept: {
        "text/csv": [".csv"],
      },
    });

  const dropzoneStyles: React.CSSProperties = {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
  };

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here...</p>
        ) : (
          <p>
            <b>Impact Award</b> - Drag 'n' drop a CSV file here, or click to
            select one+
          </p>
        )}
      </div>
      {fileRejections.length > 0 && (
        <div>
          <h4>File Errors:</h4>
          <ul>
            {fileRejections.map(({ file, errors }: FileRejection) => (
              <li key={file.name}>
                {file.name}:
                <ul>
                  {errors.map((e, index) => (
                    <li key={index}>{e.message}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      {impactExportCSVValidationErrors.length > 0 && (
        <div>
          <h4>Validation Errors:</h4>
          <ul>
            {impactExportCSVValidationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {validImpactExportCSVData && (
        <div>
          <h4>Valid Data Received:</h4>
          <p>{validImpactExportCSVData.length} rows successfully validated</p>
        </div>
      )}
    </div>
  );
}
