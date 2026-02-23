import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card = ({ children, className = "" }: CardProps) => {
  return <div className={`pacifico-card ${className}`}>{children}</div>;
};

export default Card;
