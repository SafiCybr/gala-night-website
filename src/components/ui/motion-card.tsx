
import React from "react";
import { cn } from "@/lib/utils";

interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  animateIn?: boolean;
}

const MotionCard = ({
  children,
  className,
  hoverEffect = true,
  animateIn = true,
  ...props
}: MotionCardProps) => {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm transition-all duration-300",
        hoverEffect && "hover:shadow-lg hover:-translate-y-1",
        animateIn && "animate-scale-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface MotionCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const MotionCardHeader = ({
  className,
  ...props
}: MotionCardHeaderProps) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
};

interface MotionCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const MotionCardContent = ({
  className,
  ...props
}: MotionCardContentProps) => {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
};

interface MotionCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const MotionCardFooter = ({
  className,
  ...props
}: MotionCardFooterProps) => {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
};

interface MotionCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

const MotionCardTitle = ({
  className,
  ...props
}: MotionCardTitleProps) => {
  return (
    <h3
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
};

interface MotionCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

const MotionCardDescription = ({
  className,
  ...props
}: MotionCardDescriptionProps) => {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
};

export {
  MotionCard,
  MotionCardHeader,
  MotionCardFooter,
  MotionCardTitle,
  MotionCardDescription,
  MotionCardContent,
};
