export default function Preview({ file }) {
  if (!file) return null;

  if (file.file_type.startsWith("image/")) {
    return <img src={file.file_url} alt={file.file_name} className="max-w-xs" />;
  }

  if (file.file_type === "application/pdf") {
    return (
      <iframe
        src={file.file_url}
        width="400"
        height="500"
        title={file.file_name}
      />
    );
  }

  if (file.file_type.startsWith("text/")) {
    return <a href={file.file_url} target="_blank">Open Text File</a>;
  }

  return <p>No preview available for {file.file_type}</p>;
}
