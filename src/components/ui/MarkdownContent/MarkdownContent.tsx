import Markdown from "react-markdown";
import styles from "./MarkdownContent.module.css";

export function MarkdownContent({ value }: { value: string }) {
  return <div className={styles.content}><Markdown components={{
    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
  }}>{value}</Markdown></div>;
}
