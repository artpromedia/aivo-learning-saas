export interface SisStudent {
  sisId: string;
  firstName: string;
  lastName: string;
  email?: string;
  grade?: string;
  schoolName?: string;
  teacherEmail?: string;
  sectionName?: string;
  parentEmail?: string;
  parentName?: string;
}

export interface SisTeacher {
  sisId: string;
  firstName: string;
  lastName: string;
  email: string;
  schoolName?: string;
}

export interface SisSection {
  sisId: string;
  name: string;
  subject?: string;
  grade?: string;
  teacherSisId?: string;
  studentSisIds: string[];
}

export interface MappedUser {
  email: string;
  name: string;
  role: "PARENT" | "TEACHER" | "LEARNER";
}

export interface MappedLearner {
  name: string;
  enrolledGrade?: number;
  schoolName?: string;
  parentEmail?: string;
  parentName?: string;
}

export class RosterMapper {
  mapStudent(student: SisStudent): { user: MappedUser; learner: MappedLearner } {
    const email = student.email ?? `${student.sisId}@sis.aivo.placeholder`;
    return {
      user: {
        email,
        name: `${student.firstName} ${student.lastName}`.trim(),
        role: "LEARNER",
      },
      learner: {
        name: `${student.firstName} ${student.lastName}`.trim(),
        enrolledGrade: student.grade ? parseInt(student.grade, 10) : undefined,
        schoolName: student.schoolName,
        parentEmail: student.parentEmail,
        parentName: student.parentName,
      },
    };
  }

  mapTeacher(teacher: SisTeacher): MappedUser {
    return {
      email: teacher.email,
      name: `${teacher.firstName} ${teacher.lastName}`.trim(),
      role: "TEACHER",
    };
  }

  mapParent(email: string, name: string): MappedUser {
    return { email, name, role: "PARENT" };
  }

  normalizeGrade(grade: string | undefined): number | undefined {
    if (!grade) return undefined;
    const parsed = parseInt(grade.replace(/\D/g, ""), 10);
    return isNaN(parsed) ? undefined : parsed;
  }
}
