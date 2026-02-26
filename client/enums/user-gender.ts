export enum UserGender {
  male = "male",
  female = "female",
}

export const GenderLabel: Record<UserGender, string> = {
  [UserGender.male]: "Nam",
  [UserGender.female]: "Nữ",
};
