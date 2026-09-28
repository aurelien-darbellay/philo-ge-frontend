import { useRef } from "react";
import { useText } from "../../../i18n/useText";
import type { PublicCycle } from "../../../types";
import { CycleCarousel } from "../CycleCarousel/CycleCarousel";
import { mobileCycleDialogText } from "./MobileCycleDialog.text";
import styles from "./MobileCycleDialog.module.css";

export function MobileCycleDialog({ cycles, today }: { cycles: PublicCycle[]; today: string }) {
  const text = useText(mobileCycleDialogText);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const open = () => dialog.current?.showModal();
  const close = () => dialog.current?.close();

  if (cycles.length === 0) return null;

  return <>
    <button className={styles.trigger} ref={trigger} type="button" onClick={open}>
      {text.open}
    </button>
    <dialog className={styles.dialog} ref={dialog} aria-label={text.open} onClose={() => trigger.current?.focus()}>
      <button className={styles.close} type="button" aria-label={text.close} onClick={close}>×</button>
      <CycleCarousel cycles={cycles} today={today} />
    </dialog>
  </>;
}
