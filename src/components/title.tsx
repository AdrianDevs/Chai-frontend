import { FaArrowLeft } from 'react-icons/fa6';

type TitleProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

const Title = ({ children, className, onClick }: TitleProps) => {
  return (
    <div className={`grid w-full grid-cols-5 ${className}`}>
      <div className={`col-span-1 col-start-1 flex-none`}>
        <button className="btn btn-outline btn-secondary" onClick={onClick}>
          <FaArrowLeft className="h-6 w-6" />
        </button>
      </div>
      <div
        className={`col-start-2 col-end-5 mr-2 ml-2 grow text-center text-4xl font-bold text-base-content`}
      >
        {children}
      </div>
      <div className={`col-span-1 col-start-5 flex-none`}></div>
    </div>
  );
};

export default Title;
