export const notifications = [
  {
    id: 1,
    title: "n.Files",
    desc: "Gestão de documentos. Desenvolvido pela ness.",
    type: "text",
    date: "Agora",
  },
];

export type Notification = (typeof notifications)[number];
