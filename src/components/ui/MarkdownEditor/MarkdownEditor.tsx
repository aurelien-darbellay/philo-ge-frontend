import { useId, useLayoutEffect, useRef, useState } from "react";
import { useText } from "../../../i18n/useText";
import { Button } from "../Button/Button";
import { MarkdownContent } from "../MarkdownContent/MarkdownContent";
import { markdownEditorText } from "./MarkdownEditor.text";
import styles from "./MarkdownEditor.module.css";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ label, value, onChange }: Props) {
  const text = useText(markdownEditorText);
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const [previewing, setPreviewing] = useState(false);

  useLayoutEffect(() => {
    const textarea = input.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value, previewing]);

  const select = (start: number, end: number) => requestAnimationFrame(() => {
    input.current?.focus();
    input.current?.setSelectionRange(start, end);
  });

  const wrap = (before: string, after: string, placeholder: string) => {
    const element = input.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    onChange(`${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`);
    select(start + before.length, start + before.length + selected.length);
  };

  const prefixLines = (prefix: (index: number) => string, placeholder: string) => {
    const element = input.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const formatted = selected.split("\n").map((line, index) => `${prefix(index)}${line}`).join("\n");
    onChange(`${value.slice(0, start)}${formatted}${value.slice(end)}`);
    select(start, start + formatted.length);
  };

  const tools = [
    { label: text.heading, action: () => prefixLines(() => "## ", text.headingPlaceholder) },
    { label: text.bold, action: () => wrap("**", "**", text.textPlaceholder) },
    { label: text.italic, action: () => wrap("_", "_", text.textPlaceholder) },
    { label: text.bulletList, action: () => prefixLines(() => "- ", text.textPlaceholder) },
    { label: text.numberedList, action: () => prefixLines((index) => `${index + 1}. `, text.textPlaceholder) },
    { label: text.link, action: () => wrap("[", "](https://)", text.linkPlaceholder) },
    { label: text.quote, action: () => prefixLines(() => "> ", text.quotePlaceholder) },
  ];

  return <div className={styles.field}>
    <div className={styles.header}><label htmlFor={id}>{label}</label><div className={styles.mode}><Button type="button" variant={previewing ? "ghost" : "secondary"} onClick={() => setPreviewing(false)}>{text.edit}</Button><Button type="button" variant={previewing ? "secondary" : "ghost"} onClick={() => setPreviewing(true)}>{text.preview}</Button></div></div>
    {!previewing && <><div className={styles.toolbar} role="toolbar" aria-label={label}>{tools.map((tool) => <Button className={styles.tool} type="button" variant="secondary" onClick={tool.action} key={tool.label}>{tool.label}</Button>)}</div><textarea className={styles.input} id={id} ref={input} value={value} onChange={(event) => onChange(event.target.value)} /></>}
    {previewing && <div className={styles.preview}>{value.trim() ? <MarkdownContent value={value} /> : <p className={styles.empty}>{text.emptyPreview}</p>}</div>}
  </div>;
}
