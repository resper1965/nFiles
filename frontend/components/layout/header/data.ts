export const notifications = [
  {
    id: 1,
    title: "n.files",
    desc: "Sistema de gestão de documentos.",
    type: "text",
    date: "Agora",
  },
];

export type Notification = (typeof notifications)[number];
