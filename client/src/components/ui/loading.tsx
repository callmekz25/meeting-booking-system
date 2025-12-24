import { Loader2Icon } from 'lucide-react';

const Loading = () => {
  return (
    <div className="z-50 flex items-center justify-center ">
      <div className="flex flex-col items-center">
        <Loader2Icon className="animate-spin text-blue-500 size-10" />
      </div>
    </div>
  );
};

export default Loading;
