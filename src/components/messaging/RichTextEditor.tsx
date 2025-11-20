import { useRef } from "react";
import { 
  BtnBold, 
  BtnItalic, 
  BtnUnderline, 
  BtnBulletList, 
  BtnNumberedList,
  Editor,
  Toolbar,
  createButton
} from "react-simple-wysiwyg";

const BtnH1 = createButton('H1', '<h1>', '</h1>');
const BtnH2 = createButton('H2', '<h2>', '</h2>');
const BtnH3 = createButton('H3', '<h3>', '</h3>');

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      <Editor
        value={value}
        onChange={(e) => onChange(e.target.value)}
        containerProps={{
          className: "w-full",
          style: {
            minHeight: '120px',
            maxHeight: '400px',
          }
        }}
      >
        <Toolbar className="flex items-center gap-1 p-2 border-b border-border/40 flex-wrap">
          <BtnBold className="h-7 px-2 text-xs hover:bg-accent rounded" />
          <BtnItalic className="h-7 px-2 text-xs hover:bg-accent rounded" />
          <BtnUnderline className="h-7 px-2 text-xs hover:bg-accent rounded" />
          <div className="w-px h-5 bg-border/40 mx-1" />
          <BtnBulletList className="h-7 px-2 text-xs hover:bg-accent rounded" />
          <BtnNumberedList className="h-7 px-2 text-xs hover:bg-accent rounded" />
          <div className="w-px h-5 bg-border/40 mx-1" />
          <BtnH1 className="h-7 px-2 text-xs hover:bg-accent rounded" />
          <BtnH2 className="h-7 px-2 text-xs hover:bg-accent rounded" />
          <BtnH3 className="h-7 px-2 text-xs hover:bg-accent rounded" />
        </Toolbar>
      </Editor>
    </div>
  );
}
