"use client";

import React from "react";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  if (!name) {
    return <Icons.Sparkles {...props} />;
  }

  // Look up icon in lucide-react exports
  const IconComponent = (Icons as unknown as Record<string, React.FC<LucideProps>>)[name];

  if (!IconComponent) {
    return <Icons.CheckCircle2 {...props} />;
  }

  return <IconComponent {...props} />;
};
