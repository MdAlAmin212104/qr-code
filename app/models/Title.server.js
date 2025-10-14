import db from "../db.server"


export function validateTitle(data) {
  const errors = {};
  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Title is required";
  }
  return Object.keys(errors).length ? errors : null;
}

export async function createTitle(data) {
  return await db.title.create({
    data: {
      title: data.title,
      description: data.description,
    },
  });
}



export async function allDataTitles() {
    return await db.title.findMany(
        {orderBy: { createdAt: 'desc' }}
    )
}
