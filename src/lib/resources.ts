import type { LessonResource } from "@/lib/types";

export const LESSON_PACK: Omit<LessonResource, "id">[] = [
  {
    kind: "curriculum",
    title: "Khan Academy — Grade 3 Math",
    url: "https://www.khanacademy.org/math/cc-third-grade-math",
    audience: "both",
    sort_order: 10,
  },
  {
    kind: "whiteboard",
    title: "Zoom interactive worksheet",
    url: "https://zoom.us/wb/doc/x2Jyut0ZSCWzW5awOGwOOg/p/47400512572183",
    audience: "both",
    sort_order: 20,
  },
  {
    kind: "homework",
    title: "Homework sheet",
    url: "https://drive.google.com/file/d/1OMD61NC9TX61TV8qUZIyeDiC6UTr7dj3/view?usp=sharing",
    audience: "both",
    sort_order: 30,
  },
  {
    kind: "class_activity",
    title: "Class activity sheet",
    url: "https://drive.google.com/file/d/1B8TS3nLbwh1bYgA7MQtSMxHsXo-rikHK/view?usp=sharing",
    audience: "both",
    sort_order: 40,
  },
  {
    kind: "geogebra_teacher",
    title: "Teacher activity — Math at Wulmert’s",
    url: "https://www.geogebra.org/m/qcvzccvx",
    audience: "teacher",
    sort_order: 50,
  },
  {
    kind: "geogebra_student",
    title: "Student activity — Stuck in Traffic!",
    url: "https://www.geogebra.org/m/bnpqekuh",
    audience: "student",
    sort_order: 60,
  },
  {
    kind: "geogebra_advanced",
    title: "Advanced 1 — Checking balloons and light",
    url: "https://www.geogebra.org/m/szhzz9th",
    audience: "both",
    sort_order: 70,
  },
  {
    kind: "geogebra_advanced",
    title: "Advanced 2 — Ice Cream!",
    url: "https://www.geogebra.org/m/jvy2fcwg",
    audience: "both",
    sort_order: 80,
  },
  {
    kind: "geogebra_advanced",
    title: "Advanced 3 — Lighting and Marking",
    url: "https://www.geogebra.org/m/ypvrns8v",
    audience: "both",
    sort_order: 90,
  },
  {
    kind: "geogebra_create",
    title: "Create — Staging is Amazing",
    url: "https://www.geogebra.org/m/geewfmey",
    audience: "both",
    sort_order: 100,
  },
  {
    kind: "geogebra_quiz",
    title: "Quiz activity",
    url: "https://www.geogebra.org/m/pxmmum6n",
    audience: "both",
    sort_order: 110,
  },
];

export function resourcesFor(audience: "student" | "teacher") {
  return LESSON_PACK.filter(
    (item) => item.audience === "both" || item.audience === audience,
  );
}
