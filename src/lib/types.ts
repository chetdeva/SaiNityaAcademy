export type UserRole = "student" | "teacher";

export type Profile = {
  id: string;
  role: UserRole;
  display_name: string;
  default_zoom_url: string | null;
  created_at: string;
};

export type TeacherAvailability = {
  id: string;
  teacher_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

export type SessionStatus = "scheduled" | "cancelled";

export type ClassSession = {
  id: string;
  teacher_id: string;
  student_id: string;
  start_at: string;
  end_at: string;
  zoom_join_url: string | null;
  status: SessionStatus;
  created_at: string;
};

export type ClassSessionWithNames = ClassSession & {
  teacher?: Pick<Profile, "id" | "display_name" | "default_zoom_url"> | null;
  student?: Pick<Profile, "id" | "display_name"> | null;
};

export type ResourceAudience = "student" | "teacher" | "both";

export type ResourceKind =
  | "curriculum"
  | "whiteboard"
  | "homework"
  | "class_activity"
  | "geogebra_teacher"
  | "geogebra_student"
  | "geogebra_advanced"
  | "geogebra_create"
  | "geogebra_quiz";

export type LessonResource = {
  id: string;
  kind: ResourceKind;
  title: string;
  url: string;
  audience: ResourceAudience;
  sort_order: number;
};

export type TimeSlot = {
  start: Date;
  end: Date;
  teacherId: string;
};
