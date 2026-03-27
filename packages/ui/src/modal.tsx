import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./lib/cn.js";

export interface ModalProps extends Omit<HTMLAttributes<HTMLDialogElement>, "title"> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>(
  ({ open, onClose, title, children, className, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLDialogElement>(null);
    const dialogRef = (forwardedRef as React.RefObject<HTMLDialogElement>) ?? internalRef;

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (open) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        if (dialog.open) {
          dialog.close();
        }
      }
    }, [open, dialogRef]);

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const handleCancel = (e: Event) => {
        e.preventDefault();
        onClose();
      };

      dialog.addEventListener("cancel", handleCancel);
      return () => {
        dialog.removeEventListener("cancel", handleCancel);
      };
    }, [onClose, dialogRef]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const rect = dialog.getBoundingClientRect();
      const clickedInDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!clickedInDialog) {
        onClose();
      }
    };

    const titleId = title ? "modal-title" : undefined;

    return (
      <dialog
        ref={dialogRef}
        className={cn(
          "w-full max-w-lg rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm",
          "open:animate-[modal-in_200ms_ease-out] [&:not([open])]:animate-[modal-out_150ms_ease-in]",
          className,
        )}
        aria-modal="true"
        role="dialog"
        aria-labelledby={titleId}
        onClick={handleBackdropClick}
        {...props}
      >
        <div className="p-6">
          {title && (
            <h2 id={titleId} className="mb-4 text-lg font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {children}
        </div>
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export { Modal };
