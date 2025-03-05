import { FaArrowLeft } from 'react-icons/fa6';

type TitleProps = {
  className?: string;
  cols: number;
  children: React.ReactNode;
  onClick?: () => void;
};

const Title = ({ cols, children, className, onClick }: TitleProps) => {
  return (
    <div className={`grid grid-cols-${cols} ${className}`}>
      <div className={`col-span-1 col-start-1 flex-none`}>
        <button className="btn btn-outline btn-secondary" onClick={onClick}>
          <FaArrowLeft className="h-6 w-6" />
        </button>
      </div>
      <div className={`col-start-2 col-end-${cols} flex-none`}>
        <div className="text-center text-4xl font-bold">{children}</div>
      </div>
      <div className={`col-span-1 col-start-${cols} flex-none`}></div>
    </div>
  );
};

export default Title;
