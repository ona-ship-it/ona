import React from 'react';

interface PageTitleProps {
  title: string;
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, className = '' }) => {
  return (
    <h1 className={`text-3xl font-bold mb-6 ${className}`}>{title}</h1>
  );
};

export default PageTitle;