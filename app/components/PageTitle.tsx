'use client';

import { usePathname } from 'next/navigation';

const PageTitle = () => {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/books':
        return 'Books';
      case '/takeout':
        return 'Take Out';
      case '/return':
        return 'Return';
      case '/users':
        return 'Users';
      case '/settings':
        return 'Settings';
      case '/loanstatus':
        return 'Loan Status';
      case '/reports/category-update':
        return 'Category Update';
      case '/reports/return':
        return 'Return Status';
      case '/reports/toplist':
        return 'Top List';
      case '/bookcrud':
        return 'Book Management';
      default:
        return 'Dashboard';
    }
  };

  return (
    <h1 className="text-2xl font-bold text-gray-900">
      {getPageTitle(pathname)}
    </h1>
  );
};

export default PageTitle;
