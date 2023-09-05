import * as React from 'react';
import { SVGProps } from 'react';

const LogoDocumentBase = ({
  width = 27,
  height = 18,
}: SVGProps<SVGSVGElement>) => (
  <svg
    width="41"
    height="41"
    viewBox="0 0 41 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="29.2734"
      cy="20.3512"
      r="3.80282"
      transform="rotate(90 29.2734 20.3512)"
      fill="#285FFF"
    />
    <path
      d="M29.2188 20.351L20.443 20.351"
      stroke="#285FFF"
      strokeWidth="1.1701"
    />
    <path
      d="M13.4775 15.0522L18.4504 15.0522C19.5813 15.0522 20.498 15.969 20.498 17.0999L20.498 23.2429C20.498 24.3738 19.5813 25.2906 18.4504 25.2906L9.38212 25.2906"
      stroke="#285FFF"
      strokeWidth="1.1701"
    />
    <circle
      cx="10.8456"
      cy="15.0857"
      r="3.80282"
      transform="rotate(90 10.8456 15.0857)"
      fill="#285FFF"
    />
    <circle
      cx="10.8456"
      cy="25.0313"
      r="3.80282"
      transform="rotate(90 10.8456 25.0313)"
      fill="#285FFF"
    />
  </svg>
);
export default LogoDocumentBase;
