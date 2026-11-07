import React from "react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumb?: React.ReactNode;
}

export default function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <div className="wrap ph">
      <div className="crumb">
        {breadcrumb || <Link href="/">Home</Link>}
      </div>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
    </div>
  );
}

