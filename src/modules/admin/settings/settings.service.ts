export async function getModules() {
  return { modules: [] };
}

export async function getNotifications() {
  return { settings: {} };
}

export async function getSecurity() {
  return { settings: {} };
}

export async function getLanguage() {
  return { languages: [], defaultLanguage: "en" };
}

export async function getBackup() {
  return { schedules: [], lastBackup: null };
}
