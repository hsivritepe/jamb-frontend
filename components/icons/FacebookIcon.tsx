// components/icons/FacebookIcon.tsx

export default function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx="26" cy="26" r="26" fill="white" />
        <circle cx="26" cy="26" r="25.5" stroke="#0A0A0A" strokeOpacity="0.1" />
        <path
          d="M26 41C34.2842 41 41 34.2842 41 26C41 17.7157 34.2842 11 26 11C17.7157 11 11 17.7157 11 26C11 34.2842 17.7157 41 26 41Z"
          fill="#0A0A0A"
          fillOpacity="0.3"
        />
        <path
          d="M31.8386 30.3385L32.5031 26.0015H28.3434V23.1876C28.3434 22.0021 28.9234 20.844 30.7882 20.844H32.6803V17.1526C32.6803 17.1526 30.9632 16.8594 29.3221 16.8594C25.8964 16.8594 23.6563 18.935 23.6563 22.6961V26.0015H19.8467V30.3385H23.6563V40.8201C24.4199 40.9404 25.2025 41.0015 25.9998 41.0015C26.7972 41.0015 27.5798 40.9382 28.3434 40.8201V30.3385H31.8386Z"
          fill="white"
        />
      </svg>
    );
  }