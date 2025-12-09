import { Button } from '@/components/ui/button';
import { useWorkforceDrawerStore } from '@/stores/useWorkforceDrawerStore';
import { UserCog } from 'lucide-react';

export const WorkforceDrawerTrigger: React.FC = () => {
  const { toggle } = useWorkforceDrawerStore();

  return (
    <Button
      onClick={toggle}
      variant="ghost"
      className="fixed right-0 bottom-[20%] h-12 w-6 rounded-l-xl rounded-r-none bg-[#7BB5FF] hover:bg-[#6BA5EF] shadow-xl active:scale-95 transition-all duration-300 ease-out z-50 flex items-center justify-center text-gray-900"
      aria-label="Open Positions Drawer"
    >
      <UserCog className="h-5 w-5" />
    </Button>
  );
};
