export enum AvailabilityStatus {
  waiting = "waiting",
  no_overlap = "no_overlap",
  scheduled = "scheduled",
}

export const AvailabilityLabel: Record<AvailabilityStatus, string> = {
  [AvailabilityStatus.waiting]: "Đang đợi đối tác chọn thời gian",
  [AvailabilityStatus.no_overlap]:
    "Chưa tìm được thời gian trùng. Vui lòng chọn lại.",
  [AvailabilityStatus.scheduled]: "Hai bạn có date hẹn vào: ",
};
