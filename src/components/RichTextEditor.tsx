'use client';

import dynamic from 'next/dynamic';
import { Editor as EditorType } from '@tinymce/tinymce-react';

const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
  { ssr: false }
) as typeof EditorType;

type RichTextEditorProps = {
  value: string;
  onChange: (content: string) => void;
  height?: number;
};

export default function RichTextEditor({ value, onChange, height = 500 }: RichTextEditorProps) {
  return (
    <Editor
      apiKey="todfe37uddxfgy3y2y3jd3w5e4ywmze7m6u92rodymp5t823"
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: "file edit view insert format tools table help", // 👈 Bật đầy đủ menu
        toolbar:
          "undo redo | fontselect fontsizeselect | styles | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image media link | code",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        automatic_uploads: true,
        file_picker_types: "image",
      }}
    />

  );
}
