import { Card, CardContent } from "../ui/card";
import Options from "./Options";
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  FileVideo, 
  FileImage, 
  FileJson, 
  FileArchive, 
  FileAudio,
  File
} from "lucide-react";

export default function FileCard({ file }) {
  const getThumbnail = () => {
    if (!file.file_url) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50">
          <File className="w-12 h-12 text-gray-400 mb-2" />
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

    // ✅ PDFs
    if (ext === "pdf") {
      return (
        <img
          src={`https://docs.google.com/gview?embedded=true&url=${file.file_url}&page=1&thumb=true`}
          alt="PDF preview"
          className="object-cover w-full h-full"
        />
      );
    }

    // ✅ Videos
    if (["mp4", "webm", "ogg"].includes(ext)) {
      return (
        <video
          src={file.file_url + "#t=1"}
          className="object-cover w-full h-full"
          muted
          playsInline
          preload="metadata"
          poster="/icons/video-icon.png"
        />
      );
    }

    // ✅ Enhanced file type placeholders
    const getFileTypeInfo = () => {
      switch(true) {
        case ['csv', 'xlsx', 'xls'].includes(ext):
          return {
            icon: <FileSpreadsheet className="w-16 h-16 mb-3" />,
            label: 'Spreadsheet',
            color: 'text-emerald-500'
          };
        case ['mp4', 'webm', 'mov', 'avi'].includes(ext):
          return {
            icon: <FileVideo className="w-16 h-16 mb-3" />,
            label: 'Video',
            color: 'text-blue-500'
          };
        case ['mp3', 'wav', 'ogg', 'flac'].includes(ext):
          return {
            icon: <FileAudio className="w-16 h-16 mb-3" />,
            label: 'Audio',
            color: 'text-purple-500'
          };
        case ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext):
          return {
            icon: <FileImage className="w-16 h-16 mb-3" />,
            label: 'Image',
            color: 'text-pink-500'
          };
        case ['json', 'xml'].includes(ext):
          return {
            icon: <FileJson className="w-16 h-16 mb-3" />,
            label: 'Data File',
            color: 'text-yellow-500'
          };
        case ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext):
          return {
            icon: <FileArchive className="w-16 h-16 mb-3" />,
            label: 'Archive',
            color: 'text-orange-500'
          };
        case ['txt', 'doc', 'docx', 'pdf'].includes(ext):
          return {
            icon: <FileText className="w-16 h-16 mb-3" />,
            label: 'Document',
            color: 'text-blue-600'
          };
        case ['js', 'ts', 'py', 'java', 'cpp', 'html', 'css'].includes(ext):
          return {
            icon: <FileCode className="w-16 h-16 mb-3" />,
            label: 'Code',
            color: 'text-indigo-500'
          };
        default:
          return {
            icon: <File className="w-16 h-16 mb-3" />,
            label: ext.toUpperCase(),
            color: 'text-gray-500'
          };
      }
    };

    const { icon, label, color } = getFileTypeInfo();

    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-gray-50 to-gray-100">
        <div className={color}>
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{ext.toUpperCase()}</p>
      </div>
    );
  };

  return (
    <Card className="w-full mt-0 pt-0 overflow-hidden">
      <CardContent className="p-0 h-full flex flex-col">
        <div className="h-48 flex items-center justify-center overflow-hidden">
          {getThumbnail()}
        </div>

        <h4 className="px-3 py-2 truncate text-sm font-medium">{file.file_name}</h4>

        <div className="mt-auto border-t p-3">
          <Options file={file} />
        </div>
      </CardContent>
    </Card>
  );
}
