import type { PatientRelation, Gender } from "./types";

export interface FamilyMember {
  id: string | number;
  name: string;
  relation: PatientRelation;
  age?: string;
  gender?: Gender | "";
  img?: string;
}

export const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: 1, name: "Aditya", relation: "self", img: "https://i.pravatar.cc/150?img=11", age: "32", gender: "male" },
  { id: 2, name: "Aarav", relation: "child", img: "https://i.pravatar.cc/150?img=12", age: "6", gender: "male" },
  { id: 3, name: "Hazel", relation: "spouse", img: "https://i.pravatar.cc/150?img=5", age: "30", gender: "female" },
  { id: 4, name: "Rahul", relation: "parent", img: "https://i.pravatar.cc/150?img=8", age: "62", gender: "male" },
];

