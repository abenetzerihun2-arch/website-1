import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        alt?: string;
        ar?: boolean | string;
        "auto-rotate"?: boolean | string;
        "camera-controls"?: boolean | string;
        exposure?: string;
        loading?: "auto" | "lazy" | "eager";
        poster?: string;
        reveal?: "auto" | "interaction" | "manual";
        "shadow-intensity"?: string;
        src?: string;
        "touch-action"?: string;
      };
    }
  }
}
