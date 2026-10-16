import { Drawer } from "vaul";

// Bottom sheet built on vaul. Used for all "log / add" forms so the app feels
// like a native mobile app instead of a page full of forms.
export function Sheet({ open, onOpenChange, title, children }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] max-w-screen-sm flex-col rounded-t-3xl border-t border-border bg-card outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
            {title && (
              <Drawer.Title className="mb-4 text-lg font-bold tracking-tight">
                {title}
              </Drawer.Title>
            )}
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Labelled input used inside sheets.
export function Field({ label, children }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl bg-secondary px-3.5 py-3 text-base outline-none ring-1 ring-border focus:ring-lime";
