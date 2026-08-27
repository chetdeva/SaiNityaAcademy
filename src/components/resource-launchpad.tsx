import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resourcesFor } from "@/lib/resources";
import { ExternalLink } from "lucide-react";

const KIND_LABEL: Record<string, string> = {
  curriculum: "Curriculum",
  whiteboard: "Whiteboard",
  homework: "Homework",
  class_activity: "Class activity",
  geogebra_teacher: "Teacher tool",
  geogebra_student: "Student activity",
  geogebra_advanced: "Advanced",
  geogebra_create: "Create",
  geogebra_quiz: "Quiz",
};

export function ResourceLaunchpad(props: { audience: "student" | "teacher" }) {
  const items = resourcesFor(props.audience);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Curriculum launchpad</CardTitle>
        <p className="text-sm text-muted-foreground">
          Grade 3 lesson pack — Khan Academy, Zoom whiteboard, Drive sheets, and GeoGebra.
        </p>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <a
            key={`${item.kind}-${item.title}`}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2.5 hover:border-teal-300 hover:bg-teal-50/50"
          >
            <span>
              <span className="block text-xs font-medium uppercase tracking-wide text-teal-700">
                {KIND_LABEL[item.kind] ?? item.kind}
              </span>
              <span className="text-sm font-medium">{item.title}</span>
            </span>
            <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
