import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ShellCard(props: {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Card className={cn("h-full shadow-sm", props.className)}>
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{props.title}</CardTitle>
          <Badge variant="secondary">Soon</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{props.description}</p>
      </CardHeader>
      {props.children ? <CardContent>{props.children}</CardContent> : null}
    </Card>
  );
}
