import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SignUpModalProps {
  planName: string;
  supplierName: string;
  triggerText?: string;
  triggerClassName?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function SignUpModal({
  planName,
  supplierName,
  triggerText = 'Sign Up for This Plan',
  triggerClassName = 'flex-1',
  triggerVariant = 'default',
}: SignUpModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={triggerClassName}>
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ready to Switch?</DialogTitle>
          <DialogDescription className="space-y-3 pt-4">
            <p>
              To sign up for this plan, you&apos;ll need to visit the supplier&apos;s website directly.
            </p>
            <p className="font-semibold">
              {supplierName} - {planName}
            </p>
            <p className="text-sm text-slate-600">
              Note: This is an MVP. In the full version, we&apos;ll provide direct signup links and assistance.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

