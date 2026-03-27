import type { SisStudent, SisTeacher } from "./roster-mapper.js";

export interface DeltaResult<T> {
  added: T[];
  updated: T[];
  deleted: string[]; // SIS IDs of removed items
}

export class DeltaDetector {
  detectStudentChanges(
    current: SisStudent[],
    previous: Map<string, SisStudent>,
  ): DeltaResult<SisStudent> {
    const added: SisStudent[] = [];
    const updated: SisStudent[] = [];
    const currentIds = new Set<string>();

    for (const student of current) {
      currentIds.add(student.sisId);
      const prev = previous.get(student.sisId);

      if (!prev) {
        added.push(student);
      } else if (this.studentChanged(student, prev)) {
        updated.push(student);
      }
    }

    const deleted: string[] = [];
    for (const [sisId] of previous) {
      if (!currentIds.has(sisId)) {
        deleted.push(sisId);
      }
    }

    return { added, updated, deleted };
  }

  detectTeacherChanges(
    current: SisTeacher[],
    previous: Map<string, SisTeacher>,
  ): DeltaResult<SisTeacher> {
    const added: SisTeacher[] = [];
    const updated: SisTeacher[] = [];
    const currentIds = new Set<string>();

    for (const teacher of current) {
      currentIds.add(teacher.sisId);
      const prev = previous.get(teacher.sisId);

      if (!prev) {
        added.push(teacher);
      } else if (this.teacherChanged(teacher, prev)) {
        updated.push(teacher);
      }
    }

    const deleted: string[] = [];
    for (const [sisId] of previous) {
      if (!currentIds.has(sisId)) {
        deleted.push(sisId);
      }
    }

    return { added, updated, deleted };
  }

  private studentChanged(a: SisStudent, b: SisStudent): boolean {
    return (
      a.firstName !== b.firstName ||
      a.lastName !== b.lastName ||
      a.email !== b.email ||
      a.grade !== b.grade ||
      a.schoolName !== b.schoolName ||
      a.teacherEmail !== b.teacherEmail
    );
  }

  private teacherChanged(a: SisTeacher, b: SisTeacher): boolean {
    return (
      a.firstName !== b.firstName ||
      a.lastName !== b.lastName ||
      a.email !== b.email
    );
  }
}
