"use client";

import { Globe, Paperclip, Send } from "lucide-react";
import { useState, forwardRef, useImperativeHandle } from "react";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

interface AIInput04Props {
    onSubmit?: (query: string) => void;
    value?: string;
    onChange?: (value: string) => void;
}

export type AIInput04Ref = {
    setValue: (value: string) => void;
};

const AIInput_04 = forwardRef<AIInput04Ref, AIInput04Props>(({ 
    onSubmit, 
    value: externalValue, 
    onChange: externalOnChange 
}, ref) => {
    const [internalValue, setInternalValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 52,
        maxHeight: 200,
    });
    const [showSearch, setShowSearch] = useState(true);
    
    // Use controlled or uncontrolled value
    const value = externalValue !== undefined ? externalValue : internalValue;
    
    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        setValue: (newValue: string) => {
            if (externalOnChange) {
                externalOnChange(newValue);
            } else {
                setInternalValue(newValue);
            }
            // Adjust height after a small delay to ensure content is updated
            setTimeout(() => adjustHeight(), 0);
        }
    }));

    const handleSubmit = () => {
        if (onSubmit && value) onSubmit(value);
        // Only clear internal state if using uncontrolled mode
        if (externalValue === undefined) {
            setInternalValue("");
        } else if (externalOnChange) {
            externalOnChange("");
        }
        adjustHeight(true);
    };
    
    const handleChange = (newValue: string) => {
        if (externalOnChange) {
            externalOnChange(newValue);
        } else {
            setInternalValue(newValue);
        }
        adjustHeight();
    };

    return (
        <div className="w-full py-2 md:py-4">
            <div className="relative w-full mx-auto">
                <div className="relative flex flex-col">
                    <div className="overflow-y-auto max-h-[200px]">
                        <Textarea
                            id="ai-input-04"
                            value={value}
                            placeholder="Search healthcare resources..."
                            className="w-full rounded-xl rounded-b-none px-3 md:px-4 py-2 md:py-3 bg-background border border-input dark:bg-background dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground resize-none focus-visible:ring-0 leading-[1.2]"
                            ref={textareaRef}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            onChange={(e) => {
                                handleChange(e.target.value);
                            }}
                        />
                    </div>

                    <div className="h-12 bg-background border border-input border-t-0 rounded-b-xl dark:bg-background">
                        <div className="absolute left-3 bottom-3 flex items-center gap-2">
                            <label className="cursor-pointer rounded-lg p-2 bg-background dark:bg-background">
                                <input type="file" className="hidden" />
                                <Paperclip className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSearch(!showSearch);
                                }}
                                className={cn(
                                    "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 cursor-pointer",
                                    showSearch
                                        ? "bg-sky-500/15 border-sky-400 text-sky-500"
                                        : "bg-background dark:bg-background border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    <motion.div
                                        animate={{
                                            rotate: showSearch ? 180 : 0,
                                            scale: showSearch ? 1.1 : 1,
                                        }}
                                        whileHover={{
                                            rotate: showSearch ? 180 : 15,
                                            scale: 1.1,
                                            transition: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 10,
                                            },
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 25,
                                        }}
                                    >
                                        <Globe
                                            className={cn(
                                                "w-4 h-4",
                                                showSearch
                                                    ? "text-sky-500"
                                                    : "text-inherit"
                                            )}
                                        />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {showSearch && (
                                        <motion.span
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{
                                                width: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-sm overflow-hidden whitespace-nowrap text-sky-500 shrink-0"
                                        >
                                            Search
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                        <div className="absolute right-3 bottom-3">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className={cn(
                                    "rounded-lg p-2 transition-colors",
                                    value
                                        ? "bg-sky-500/15 text-sky-500"
                                        : "bg-background dark:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                                )}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

AIInput_04.displayName = "AIInput_04";

export default AIInput_04;
