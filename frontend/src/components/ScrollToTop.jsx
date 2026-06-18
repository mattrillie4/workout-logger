import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// small component that ensures page starts at top scroll when navigating through pages
const ScrollToTop = () => {
  // get desired path name
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
