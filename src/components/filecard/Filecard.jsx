import { Card, CardContent } from "../ui/card";
import Options from "./Options";

export default function FileCard({ file }) {
  const getThumbnail = () => {
    if (!file.file_url) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-200">
          <p className="text-gray-500 text-sm">No preview</p>
        </div>
      );
    }

    const ext = file.file_name.split(".").pop().toLowerCase();

    // ✅ Images
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return (
        <img
          src={file.file_url}
          alt={file.file_name}
          className="object-cover w-full h-full"
        />
      );
    }

    // ✅ PDFs (first-page thumbnail via Google Drive thumbnail API or PDF.js later)
    if (ext === "pdf") {
      return (
        <img
          src={`https://docs.google.com/gview?embedded=true&url=${file.file_url}&page=1&thumb=true`}
          alt="PDF preview"
          className="object-cover w-full h-full"

        />
      );
    }

    // ✅ Videos (thumbnail frame)
    if (["mp4", "webm", "ogg"].includes(ext)) {
      return (
        <video
          src={file.file_url + "#t=1"} // load at 1s for thumbnail
          className="object-cover w-full h-full"
          muted
          playsInline
          preload="metadata"
          poster="/icons/video-icon.png" // fallback if thumbnail fails
        />
      );
    }

    // ✅ Default fallback (icon)
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-200">
        <img
          src={`/icons/${ext}-icon.png`}
          alt={`${ext} file`}
          className="w-10 h-10"

        />
      </div>
    );
  };

  return (
    <Card className="h-64 pt-0 pb-0.5 w-60 overflow-hidden">
      <CardContent className="p-0 h-full flex flex-col">
        <div className="flex-2 bg-gray-100 flex items-center justify-center overflow-hidden">
          {getThumbnail()}
        </div>

        <h4 className="p-1 truncate">{file.file_name}</h4>

        <div className="flex-1 border-t p-2">
          <Options file={file} />
        </div>
      </CardContent>
    </Card>
  );
}
