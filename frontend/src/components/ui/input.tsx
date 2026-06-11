import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const fieldClass =
  'w-full rounded-lg bg-cream-dark border border-burgundy/20 text-burgundy text-sm font-sans px-3 py-2.5 placeholder:text-burgundy/40 focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy transition-colors'

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('block text-xs font-medium text-burgundy/70 mb-1.5 font-sans', className)} {...props} />
)

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClass, className)} {...props} />
  ),
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClass, 'resize-none', className)} {...props} />
  ),
)
Textarea.displayName = 'Textarea'

export const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-red-600 text-xs mt-1 font-sans">{message}</p> : null

export const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClass, 'pl-9', className)} {...props} />
  ),
)
SearchInput.displayName = 'SearchInput'
