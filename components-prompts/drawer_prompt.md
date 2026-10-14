You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
animated-drawer.tsx
"use client";

import { useState, useMemo } from "react";
import { Drawer } from "vaul";
import useMeasure from "react-use-measure";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  BannedIcon,
  DangerIcon,
  FaceIDIcon,
  LockIcon,
  PassIcon,
  PhraseIcon,
  RecoveryPhraseIcon,
  ShieldIcon,
  WarningIcon,
} from "@/components/ui/animated-drawer-utils/demo-icons";
export const AnimatedDrawer = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [view, setView] = useState("default");
  const [elementRef, bounds] = useMeasure();

  const content = useMemo(() => {
    switch (view) {
      case "default":
        return (
          <div className="">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Wallet Settings
              </h2>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                <X
                  className="text-neutral-600 dark:text-neutral-400"
                  size="18"
                />
              </Button>
            </div>

            <div className="mt-6 flex flex-col items-start gap-4">
              <button
                onClick={() => setView("key")}
                className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium flex items-center gap-2 w-full rounded-2xl px-4 py-3.5 transition-colors"
              >
                <LockIcon />
                View Private Key
              </button>
              <button
                onClick={() => setView("pharse")}
                className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium flex items-center gap-2 w-full rounded-2xl px-4 py-3.5 transition-colors"
              >
                <PassIcon />
                View Recovery Phrase
              </button>
              <button
                onClick={() => setView("remove")}
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium flex items-center gap-2 w-full rounded-2xl px-4 py-3.5 transition-colors"
              >
                <WarningIcon />
                Remove Wallet
              </button>
            </div>
          </div>
        );
      case "remove":
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <DangerIcon />
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                <X
                  className="text-neutral-600 dark:text-neutral-400"
                  size="18"
                />
              </Button>
            </div>
            <h2 className="font-medium text-xl text-neutral-900 dark:text-neutral-100">
              Remove Wallet?
            </h2>

            <p className="text-neutral-500 dark:text-neutral-400 font-light text-lg">
              This action cannot be undone. Make sure you&apos;ve backed up your
              recovery phrase before proceeding. You&apos;ll lose access to all
              funds if you don&apos;t have a backup.
            </p>
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={() => setView("default")}
                className="w-36 h-12 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-3xl text-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setView("default")}
                className="w-36 h-12 bg-red-500 hover:bg-red-600 text-white rounded-3xl text-lg transition-colors"
              >
                Remove
              </Button>
            </div>
          </div>
        );
      case "pharse":
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <RecoveryPhraseIcon />
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                <X
                  className="text-neutral-600 dark:text-neutral-400"
                  size="18"
                />
              </Button>
            </div>
            <h2 className="font-medium text-xl text-neutral-900 dark:text-neutral-100">
              Recovery Phrase
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-light text-lg">
              Your recovery phrase is the master key to your wallet. Write it
              down and store it securely. Anyone with this phrase can access
              your funds.
            </p>
            <div className="border-t border-neutral-200 dark:border-neutral-700 space-y-5 text-neutral-500 dark:text-neutral-400 text-lg">
              <div className="flex items-center gap-4 mt-5">
                <ShieldIcon />
                <h3>Store it in a secure location</h3>
              </div>
              <div className="flex items-center gap-4">
                <PhraseIcon />
                <h3>Never share with anyone</h3>
              </div>
              <div className="flex items-center gap-4">
                <BannedIcon />
                <h3>We cannot recover it for you</h3>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={() => setView("default")}
                className="w-36 h-12 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-3xl text-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setView("default")}
                className="w-42 h-12 bg-sky-400 hover:bg-sky-500 text-white rounded-3xl text-lg flex items-center gap-3 transition-colors"
              >
                <FaceIDIcon />
                Show Phrase
              </Button>
            </div>
          </div>
        );
      case "key":
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <RecoveryPhraseIcon />
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                <X
                  className="text-neutral-600 dark:text-neutral-400"
                  size="18"
                />
              </Button>
            </div>
            <h2 className="font-medium text-xl text-neutral-900 dark:text-neutral-100">
              Private Key
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-light text-lg">
              Your private key is a cryptographic key that proves ownership of
              your wallet. Treat it with the same security as your bank account
              details.
            </p>

            <div className="border-t border-neutral-200 dark:border-neutral-700 space-y-5 text-neutral-500 dark:text-neutral-400 text-lg">
              <div className="flex items-center gap-4 mt-5">
                <ShieldIcon />
                <h3>Store it in a secure location</h3>
              </div>
              <div className="flex items-center gap-4">
                <PhraseIcon />
                <h3>Never share with anyone</h3>
              </div>
              <div className="flex items-center gap-4">
                <BannedIcon />
                <h3>We cannot recover it for you</h3>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={() => setView("default")}
                className="w-36 h-12 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-3xl text-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setView("default")}
                className="w-42 h-12 bg-sky-400 hover:bg-sky-500 text-white rounded-3xl text-lg flex items-center gap-3 transition-colors"
              >
                <FaceIDIcon />
                Show Key
              </Button>
            </div>
          </div>
        );
    }
  }, [view]);

  return (
    <>
      <Button
        className="mt-5 px-6 rounded-full bg-white dark:bg-neutral-800 py-2 font-medium text-black dark:text-white border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700 focus-visible:shadow-focus-ring-button md:font-medium"
        onClick={() => setIsOpen(true)}
      >
        Click Me To Open Drawer
      </Button>
      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <Drawer.Content
            asChild
            className="fixed inset-x-4 bottom-4 z-10 mx-auto h-64 max-w-[361px] overflow-hidden rounded-[36px] bg-white dark:bg-neutral-900 outline-hidden md:mx-auto md:w-full"
          >
            <motion.div animate={{ height: bounds.height }}>
              <div className="p-6" ref={elementRef}>
                {content}
              </div>
            </motion.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
};

export default AnimatedDrawer;


demo.tsx
"use client";

import { useState, useMemo } from "react";
import { Drawer } from "vaul";
import useMeasure from "react-use-measure";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  BannedIcon,
  DangerIcon,
  FaceIDIcon,
  LockIcon,
  PassIcon,
  PhraseIcon,
  RecoveryPhraseIcon,
  ShieldIcon,
  WarningIcon,
} from "@/components/ui/animated-drawer-utils/demo-icons";

function AnimatedDrawerDemo() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [view, setView] = useState("default");
  const [elementRef, bounds] = useMeasure();

  const content = useMemo(() => {
    switch (view) {
      case "default":
        return (
          <div className="">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Wallet Settings
              </h2>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                <X
                  className="text-neutral-600 dark:text-neutral-400"
                  size="18"
                />
              </Button>
            </div>

            <div className="mt-6 flex flex-col items-start gap-4">
              <button
                onClick={() => setView("key")}
                className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium flex items-center gap-2 w-full rounded-2xl px-4 py-3.5 transition-colors"
              >
                <LockIcon />
                View Private Key
              </button>
              <button
                onClick={() => setView("pharse")}
                className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium flex items-center gap-2 w-full rounded-2xl px-4 py-3.5 transition-colors"
              >
                <PassIcon />
                View Recovery Phrase
              </button>
              <button
                onClick={() => setView("remove")}
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium flex items-center gap-2 w-full rounded-2xl px-4 py-3.5 transition-colors"
              >
                <WarningIcon />
                Remove Wallet
              </button>
            </div>
          </div>
        );
      case "remove":
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <DangerIcon />
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                <X
                  className="text-neutral-600 dark:text-neutral-400"
                  size="18"
                />
              </Button>
            </div>
            <h2 className="font-medium text-xl text-neutral-900 dark:text-neutral-100">
              Remove Wallet?
            </h2>

            <p className="text-neutral-500 dark:text-neutral-400 font-light text-lg">
              This action cannot be undone. Make sure you&apos;ve backed up your
              recovery phrase before proceeding. You&apos;ll lose access to all
              funds if you don&apos;t have a backup.
            </p>
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={() => setView("default")}
                className="w-36 h-12 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-3xl text-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setView("default")}
                className="w-36 h-12 bg-red-500 hover:bg-red-600 text-white rounded-3xl text-lg transition-colors"
              >
                Remove
              </Button>
            </div>
          </div>
        );
      case "pharse":
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <RecoveryPhraseIcon />
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                <X
                  className="text-neutral-600 dark:text-neutral-400"
                  size="18"
                />
              </Button>
            </div>
            <h2 className="font-medium text-xl text-neutral-900 dark:text-neutral-100">
              Recovery Phrase
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-light text-lg">
              Your recovery phrase is the master key to your wallet. Write it
              down and store it securely. Anyone with this phrase can access
              your funds.
            </p>
            <div className="border-t border-neutral-200 dark:border-neutral-700 space-y-5 text-neutral-500 dark:text-neutral-400 text-lg">
              <div className="flex items-center gap-4 mt-5">
                <ShieldIcon />
                <h3>Store it in a secure location</h3>
              </div>
              <div className="flex items-center gap-4">
                <PhraseIcon />
                <h3>Never share with anyone</h3>
              </div>
              <div className="flex items-center gap-4">
                <BannedIcon />
                <h3>We cannot recover it for you</h3>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={() => setView("default")}
                className="w-36 h-12 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-3xl text-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setView("default")}
                className="w-42 h-12 bg-sky-400 hover:bg-sky-500 text-white rounded-3xl text-lg flex items-center gap-3 transition-colors"
              >
                <FaceIDIcon />
                Show Phrase
              </Button>
            </div>
          </div>
        );
      case "key":
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <RecoveryPhraseIcon />
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsOpen(false)}
              >
                <X
                  className="text-neutral-600 dark:text-neutral-400"
                  size="18"
                />
              </Button>
            </div>
            <h2 className="font-medium text-xl text-neutral-900 dark:text-neutral-100">
              Private Key
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-light text-lg">
              Your private key is a cryptographic key that proves ownership of
              your wallet. Treat it with the same security as your bank account
              details.
            </p>

            <div className="border-t border-neutral-200 dark:border-neutral-700 space-y-5 text-neutral-500 dark:text-neutral-400 text-lg">
              <div className="flex items-center gap-4 mt-5">
                <ShieldIcon />
                <h3>Store it in a secure location</h3>
              </div>
              <div className="flex items-center gap-4">
                <PhraseIcon />
                <h3>Never share with anyone</h3>
              </div>
              <div className="flex items-center gap-4">
                <BannedIcon />
                <h3>We cannot recover it for you</h3>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={() => setView("default")}
                className="w-36 h-12 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-3xl text-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setView("default")}
                className="w-42 h-12 bg-sky-400 hover:bg-sky-500 text-white rounded-3xl text-lg flex items-center gap-3 transition-colors"
              >
                <FaceIDIcon />
                Show Key
              </Button>
            </div>
          </div>
        );
    }
  }, [view]);

  return (
    <>
      <Button
        className="mt-5 px-6 rounded-full bg-white dark:bg-neutral-800 py-2 font-medium text-black dark:text-white border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700 focus-visible:shadow-focus-ring-button md:font-medium"
        onClick={() => setIsOpen(true)}
      >
        Click Me To Open Drawer
      </Button>
      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <Drawer.Content
            asChild
            className="fixed inset-x-4 bottom-4 z-10 mx-auto h-64 max-w-[361px] overflow-hidden rounded-[36px] bg-white dark:bg-neutral-900 outline-hidden md:mx-auto md:w-full"
          >
            <motion.div animate={{ height: bounds.height }}>
              <div className="p-6" ref={elementRef}>
                {content}
              </div>
            </motion.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

export default function Default() {
  return (
    <div className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden">
      <AnimatedDrawerDemo />
    </div>
  );
}

```

Copy-paste these files for dependencies:
```tsx
shadcn/button
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

Install NPM dependencies:
```bash
vaul, motion, lucide-react, react-use-measure, @radix-ui/react-slot, class-variance-authority
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
