import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Preview({ file }) {
  if (!file) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        {file.file_type.startsWith("image/") && (
          <img
            src={file.file_url}
            alt={file.file_name}
            className="max-w-xs max-h-96 rounded-md shadow-sm"
          />
        )}

        {file.file_type === "application/pdf" && (
          <iframe
            src={file.file_url}
            width="100%"
            height="500"
            title={file.file_name}
            className="rounded-md border"
          />
        )}

        {file.file_type.startsWith("text/") && (
          <a
            href={file.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open Text File
          </a>
        )}

        {!file.file_type.startsWith("image/") &&
          file.file_type !== "application/pdf" &&
          !file.file_type.startsWith("text/") && (
            <p className="text-gray-500 text-sm">
              No preview available for {file.file_type}
            </p>
          )}
      </CardContent>
    </Card>
  );
}
