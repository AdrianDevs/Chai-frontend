import { FaArrowLeft } from 'react-icons/fa6';

type TitleProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

const Title = ({ children, className, onClick }: TitleProps) => {
  return (
    <div className={`flex w-full flex-row flex-wrap ${className}`}>
      <div className={`w-14 flex-none`}>
        <button
          className="btn w-full btn-outline btn-secondary"
          onClick={onClick}
        >
          <FaArrowLeft className="h-6 w-6" />
        </button>
      </div>
      <div
        className={`flex-auto text-center text-4xl font-bold text-base-content`}
      >
        {children}
      </div>
      <div className={`w-14 flex-none`}></div>
    </div>
  );
};

export default Title;
